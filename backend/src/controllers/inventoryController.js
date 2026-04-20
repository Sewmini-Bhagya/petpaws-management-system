const db = require('../config/db');

const DEFAULT_EXPIRY_ALERT_DAYS = 30;

const logInventoryTransaction = async ({
  inventory_item_id,
  user_id,
  transaction_type,
  quantity,
  remarks
}) => {
  await db.query(
    `INSERT INTO inventory_transactions
    (inventory_item_id, user_id, transaction_type, quantity, transaction_date, remarks)
    VALUES (?, ?, ?, ?, NOW(), ?)`,
    [
      inventory_item_id,
      user_id || null,
      transaction_type,
      quantity,
      remarks || null
    ]
  );
};

// GET /api/inventory
exports.getAllInventoryItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        ii.inventory_item_id,
        ii.item_name,
        ii.item_type,
        COALESCE(s.quantity_available, 0) AS quantity_available,
        ii.reorder_level,
        ii.expiry_date
      FROM inventory_items ii
      LEFT JOIN inventory_stock s ON s.inventory_item_id = ii.inventory_item_id
      ORDER BY ii.item_name ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/inventory
exports.addInventoryItem = async (req, res) => {
  const {
    medication_id,
    supplier_id,
    item_name,
    item_type,
    expiry_date,
    batch_number,
    unit_of_measure,
    reorder_level
  } = req.body;

  if (!item_name || item_name.trim() === '') {
    return res.status(400).json({ message: 'item_name is required' });
  }

  const parsedReorderLevel = Number(reorder_level ?? 0);
  if (Number.isNaN(parsedReorderLevel) || parsedReorderLevel < 0) {
    return res.status(400).json({ message: 'reorder_level must be >= 0' });
  }

  try {
    const [itemResult] = await db.query(
      `INSERT INTO inventory_items
      (medication_id, supplier_id, item_name, item_type, expiry_date, batch_number, unit_of_measure, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medication_id || null,
        supplier_id || null,
        item_name,
        item_type || 'OTHER',
        expiry_date || null,
        batch_number || null,
        unit_of_measure || null,
        parsedReorderLevel
      ]
    );

    await db.query(
      `INSERT INTO inventory_stock (inventory_item_id, quantity_available, last_updated)
      VALUES (?, ?, NOW())`,
      [itemResult.insertId, 0]
    );

    await logInventoryTransaction({
      inventory_item_id: itemResult.insertId,
      user_id: req.user?.user_id,
      transaction_type: 'INIT',
      quantity: 0,
      remarks: 'Initial stock created'
    });

    res.status(201).json({
      message: 'Inventory item added successfully',
      inventory_item_id: itemResult.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/inventory/:id/stock
exports.updateInventoryStock = async (req, res) => {
  const { id } = req.params;
  const { quantity, transaction_type, remarks } = req.body;

  const parsedQuantity = Number(quantity);
  if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
    return res.status(400).json({ message: 'quantity must be >= 0' });
  }

  try {
    const [exists] = await db.query(
      'SELECT inventory_item_id FROM inventory_items WHERE inventory_item_id = ?',
      [id]
    );

    if (exists.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const [currentStockRows] = await db.query(
      'SELECT quantity_available FROM inventory_stock WHERE inventory_item_id = ?',
      [id]
    );

    const previousQuantity = currentStockRows.length > 0
      ? Number(currentStockRows[0].quantity_available)
      : 0;

    const [updateResult] = await db.query(
      `UPDATE inventory_stock
       SET quantity_available = ?, last_updated = NOW()
       WHERE inventory_item_id = ?`,
      [parsedQuantity, id]
    );

    if (updateResult.affectedRows === 0) {
      await db.query(
        `INSERT INTO inventory_stock (inventory_item_id, quantity_available, last_updated)
         VALUES (?, ?, NOW())`,
        [id, parsedQuantity]
      );
    }

    await logInventoryTransaction({
      inventory_item_id: id,
      user_id: req.user?.user_id,
      transaction_type: transaction_type || 'ADJUST',
      quantity: Math.abs(parsedQuantity - previousQuantity),
      remarks: remarks || `Stock adjusted from ${previousQuantity} to ${parsedQuantity}`
    });

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/inventory/:id/prescribe
exports.prescribeMedicationStock = async (req, res) => {
  const { id } = req.params;
  const { quantity, remarks, prescription_reference } = req.body;

  const parsedQuantity = Number(quantity);
  if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ message: 'quantity must be > 0' });
  }

  try {
    const [items] = await db.query(
      `SELECT ii.inventory_item_id, ii.item_name, ii.item_type, COALESCE(s.quantity_available, 0) AS quantity_available
       FROM inventory_items ii
       LEFT JOIN inventory_stock s ON s.inventory_item_id = ii.inventory_item_id
       WHERE ii.inventory_item_id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const item = items[0];
    if (item.item_type !== 'MEDICATION') {
      return res.status(400).json({ message: 'Only MEDICATION items can be prescribed' });
    }

    const [deductResult] = await db.query(
      `UPDATE inventory_stock
       SET quantity_available = quantity_available - ?, last_updated = NOW()
       WHERE inventory_item_id = ? AND quantity_available >= ?`,
      [parsedQuantity, id, parsedQuantity]
    );

    if (deductResult.affectedRows === 0) {
      return res.status(400).json({
        message: `Insufficient stock for ${item.item_name}. Available: ${item.quantity_available}, requested: ${parsedQuantity}`
      });
    }

    await logInventoryTransaction({
      inventory_item_id: id,
      user_id: req.user?.user_id,
      transaction_type: 'PRESCRIBE',
      quantity: parsedQuantity,
      remarks: remarks || (prescription_reference
        ? `Medication prescribed (${prescription_reference})`
        : 'Medication prescribed')
    });

    const [updatedStock] = await db.query(
      'SELECT quantity_available FROM inventory_stock WHERE inventory_item_id = ?',
      [id]
    );

    res.json({
      message: 'Medication prescribed and stock updated successfully',
      inventory_item_id: Number(id),
      prescribed_quantity: parsedQuantity,
      quantity_available: updatedStock[0]?.quantity_available ?? 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/inventory/expiry-alerts
exports.getExpiryAlerts = async (req, res) => {
  const parsedDays = Number(req.query.days ?? DEFAULT_EXPIRY_ALERT_DAYS);
  const days = Number.isNaN(parsedDays) || parsedDays <= 0
    ? DEFAULT_EXPIRY_ALERT_DAYS
    : parsedDays;
  const includeExpired = req.query.includeExpired === 'true';

  try {
    const expiryFilter = includeExpired
      ? 'ii.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)'
      : 'ii.expiry_date >= CURDATE() AND ii.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)';

    const [rows] = await db.query(
      `SELECT
        ii.inventory_item_id,
        ii.item_name,
        ii.item_type,
        ii.expiry_date,
        COALESCE(s.quantity_available, 0) AS quantity_available,
        DATEDIFF(ii.expiry_date, CURDATE()) AS days_to_expiry,
        CASE
          WHEN ii.expiry_date < CURDATE() THEN 'EXPIRED'
          WHEN DATEDIFF(ii.expiry_date, CURDATE()) <= 7 THEN 'CRITICAL'
          ELSE 'WARNING'
        END AS alert_level
      FROM inventory_items ii
      LEFT JOIN inventory_stock s ON s.inventory_item_id = ii.inventory_item_id
      WHERE ii.expiry_date IS NOT NULL
        AND ${expiryFilter}
      ORDER BY ii.expiry_date ASC`,
      [days]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/inventory/low-stock
exports.getLowStockItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        ii.inventory_item_id,
        ii.item_name,
        ii.item_type,
        COALESCE(s.quantity_available, 0) AS quantity_available,
        ii.reorder_level,
        ii.expiry_date
      FROM inventory_items ii
      LEFT JOIN inventory_stock s ON s.inventory_item_id = ii.inventory_item_id
      WHERE COALESCE(s.quantity_available, 0) <= ii.reorder_level
      ORDER BY COALESCE(s.quantity_available, 0) ASC, ii.item_name ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/inventory/:id
exports.deleteInventoryItem = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM inventory_stock WHERE inventory_item_id = ?', [id]);
    const [result] = await db.query('DELETE FROM inventory_items WHERE inventory_item_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
