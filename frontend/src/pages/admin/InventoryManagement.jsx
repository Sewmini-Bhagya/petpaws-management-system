import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";

/**
 * InventoryManagement Component
 */
function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newItem, setNewItem] = useState({
    item_name: "",
    item_type: "OTHER",
    reorder_level: 0,
    expiry_date: "",
    unit_of_measure: "",
    batch_number: ""
  });

  const [stockForm, setStockForm] = useState({
    inventory_item_id: "",
    quantity: 0,
    transaction_type: "ADJUST",
    remarks: ""
  });

  /**
   * Fetches inventory data and expiry alerts from the backend.
   */
  const fetchInventory = async () => {
    try {
      const [itemsRes, expiryRes] = await Promise.all([
        API.get("/inventory"),
        API.get("/inventory/expiry-alerts")
      ]);

      setItems(itemsRes.data || []);
      setExpiryAlerts(expiryRes.data || []);
    } catch (error) {
      console.error("[Inventory] Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInventory();
  }, []);

  const expiryMap = useMemo(() => {
    const map = new Map();
    expiryAlerts.forEach((item) => {
      map.set(item.inventory_item_id, item);
    });
    return map;
  }, [expiryAlerts]);

  /**
   * Handles the creation of a new inventory record.
   */
  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItem.item_name.trim()) return alert("Item name is required");

    try {
      await API.post("/inventory", {
        ...newItem,
        reorder_level: Number(newItem.reorder_level),
        expiry_date: newItem.expiry_date || null
      });

      setNewItem({
        item_name: "",
        item_type: "OTHER",
        reorder_level: 0,
        expiry_date: "",
        unit_of_measure: "",
        batch_number: ""
      });

      await fetchInventory();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add item");
    }
  };

  /**
   * Processes a stock adjustment transaction.
   */
  const handleUpdateStock = async (e) => {
    e.preventDefault();

    if (!stockForm.inventory_item_id) return alert("Please select an item");

    try {
      await API.put(`/inventory/${stockForm.inventory_item_id}/stock`, {
        quantity: Number(stockForm.quantity),
        transaction_type: stockForm.transaction_type,
        remarks: stockForm.remarks
      });

      setStockForm({
        inventory_item_id: "",
        quantity: 0,
        transaction_type: "ADJUST",
        remarks: ""
      });

      await fetchInventory();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update stock");
    }
  };

  /**
   * Removes an item from the system.
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await API.delete(`/inventory/${id}`);
      await fetchInventory();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete item");
    }
  };

  return (
    <AdminLayout>
      <header style={headerContainer}>
        <h1 style={titleStyle}>Inventory Hub</h1>
        <p style={subtitleStyle}>Monitor and manage clinical supplies and stock levels</p>
      </header>

      <div style={formGrid}>
        {/* ADD ITEM FORM */}
        <form style={card} onSubmit={handleAddItem}>
          <h3 style={cardTitle}>Register New Item</h3>
          <div style={inputGroup}>
            <input
              style={input}
              placeholder="Item Name"
              value={newItem.item_name}
              onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
            />
            <select
              style={select}
              value={newItem.item_type}
              onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })}
            >
              <option value="MEDICATION">Medication</option>
              <option value="FOOD">Food / Nutrition</option>
              <option value="TOYS">Toys / Enrichment</option>
              <option value="OTHER">Other Supplies</option>
            </select>
          </div>

          <div style={inputGroup}>
            <input
              style={input}
              type="number"
              placeholder="Reorder Level"
              value={newItem.reorder_level}
              onChange={(e) => setNewItem({ ...newItem, reorder_level: e.target.value })}
            />
            <input
              style={input}
              type="date"
              value={newItem.expiry_date}
              onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
            />
          </div>

          <div style={inputGroup}>
            <input
              style={input}
              placeholder="Batch #"
              value={newItem.batch_number}
              onChange={(e) => setNewItem({ ...newItem, batch_number: e.target.value })}
            />
            <input
              style={input}
              placeholder="Unit (e.g. kg, ml, pcs)"
              value={newItem.unit_of_measure}
              onChange={(e) => setNewItem({ ...newItem, unit_of_measure: e.target.value })}
            />
          </div>

          <button style={primaryBtn} type="submit">Add to Registry</button>
        </form>

        {/* UPDATE STOCK FORM */}
        <form style={card} onSubmit={handleUpdateStock}>
          <h3 style={cardTitle}>Stock Adjustment</h3>
          <select
            style={select}
            value={stockForm.inventory_item_id}
            onChange={(e) => setStockForm({ ...stockForm, inventory_item_id: e.target.value })}
          >
            <option value="">Select Item to Adjust</option>
            {items.map((item) => (
              <option key={item.inventory_item_id} value={item.inventory_item_id}>
                {item.item_name} ({item.quantity_available} {item.unit_of_measure} current)
              </option>
            ))}
          </select>

          <div style={inputGroup}>
            <input
              style={input}
              type="number"
              placeholder="Adjustment Quantity"
              value={stockForm.quantity}
              onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
            />
            <select
              style={select}
              value={stockForm.transaction_type}
              onChange={(e) => setStockForm({ ...stockForm, transaction_type: e.target.value })}
            >
              <option value="ADD">Restock (+)</option>
              <option value="USE">Dispense (-)</option>
              <option value="ADJUST">Correction (+/-)</option>
            </select>
          </div>

          <input
            style={input}
            placeholder="Reason / Remarks"
            value={stockForm.remarks}
            onChange={(e) => setStockForm({ ...stockForm, remarks: e.target.value })}
          />

          <button style={primaryBtn} type="submit">Commit Adjustment</button>
        </form>
      </div>

      {/* EXPIRY ALERTS */}
      {expiryAlerts.length > 0 && (
        <div style={expiryContainer}>
          <h3 style={cardTitle}>⚠️ Critical Expiry Alerts</h3>
          <div style={alertGrid}>
            {expiryAlerts.map((alert) => (
              <div key={alert.inventory_item_id} style={expiryAlertRow}>
                <div>
                  <strong style={{ display: "block" }}>{alert.item_name}</strong>
                  <small style={{ opacity: 0.8 }}>Batch: {alert.batch_number || "N/A"}</small>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "700" }}>{new Date(alert.expiry_date).toLocaleDateString()}</div>
                  <small>{alert.days_to_expiry} days remaining</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVENTORY LIST */}
      <div style={tableCard}>
        <h3 style={cardTitle}>Master Inventory Registry</h3>
        {loading ? (
          <div style={loader}>Synchronizing data...</div>
        ) : (
          <table style={table}>
            <thead>
              <tr style={thead}>
                <th style={th}>Item Identity</th>
                <th style={th}>Classification</th>
                <th style={th}>Available Stock</th>
                <th style={th}>Reorder Limit</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" style={emptyRow}>No inventory records found.</td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = Number(item.quantity_available) <= Number(item.reorder_level);
                  const expiring = expiryMap.get(item.inventory_item_id);

                  return (
                    <tr key={item.inventory_item_id} style={isLow ? lowStockRow : {}}>
                      <td style={td}>
                        <div style={{ fontWeight: "600" }}>{item.item_name}</div>
                        <small style={mutedText}>Batch: {item.batch_number || "None"}</small>
                      </td>
                      <td style={td}>{item.item_type}</td>
                      <td style={td}>
                        <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                          {item.quantity_available}
                        </span>{" "}
                        {item.unit_of_measure}
                      </td>
                      <td style={td}>{item.reorder_level}</td>
                      <td style={td}>
                        <div style={statusWrapper}>
                          {isLow && <span style={lowBadge}>LOW STOCK</span>}
                          {expiring && <span style={expiryBadge}>EXPIRING</span>}
                          {!isLow && !expiring && <span style={healthyBadge}>STABLE</span>}
                        </div>
                      </td>
                      <td style={td}>
                        <button
                          style={dangerBtn}
                          onClick={() => handleDelete(item.inventory_item_id)}
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

/* styles */

const headerContainer = {
  marginBottom: "2.5rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const subtitleStyle = {
  color: "var(--slate-600)",
  fontSize: "1.1rem"
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "2rem",
  marginBottom: "2rem"
};

const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "2rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)"
};

const cardTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  marginBottom: "1.5rem",
  color: "var(--slate-800)"
};

const inputGroup = {
  display: "flex",
  gap: "1rem",
  marginBottom: "1rem"
};

const input = {
  flex: 1,
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-200)",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s"
};

const select = {
  flex: 1,
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-200)",
  background: "white",
  fontSize: "0.95rem",
  marginBottom: "1rem"
};

const primaryBtn = {
  width: "100%",
  padding: "0.9rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  marginTop: "0.5rem",
  transition: "opacity 0.2s"
};

const expiryContainer = {
  background: "#FFFBEB",
  padding: "2rem",
  borderRadius: "20px",
  marginBottom: "2rem",
  border: "1px solid #FEF3C7"
};

const alertGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1rem"
};

const tableCard = {
  background: "#fff",
  borderRadius: "20px",
  padding: "2rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)"
};

const table = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 0.5rem"
};

const thead = {
  background: "var(--slate-50)",
  color: "var(--slate-600)",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const th = {
  textAlign: "left",
  padding: "1rem",
  fontWeight: "700"
};

const td = {
  padding: "1.2rem 1rem",
  borderBottom: "1px solid var(--slate-100)",
  fontSize: "0.95rem"
};

const statusWrapper = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap"
};

const lowBadge = {
  background: "#FEE2E2",
  color: "#991B1B",
  padding: "0.3rem 0.7rem",
  borderRadius: "8px",
  fontSize: "0.7rem",
  fontWeight: "800"
};

const expiryBadge = {
  background: "#FEF3C7",
  color: "#92400E",
  padding: "0.3rem 0.7rem",
  borderRadius: "8px",
  fontSize: "0.7rem",
  fontWeight: "800"
};

const healthyBadge = {
  background: "#DCFCE7",
  color: "#166534",
  padding: "0.3rem 0.7rem",
  borderRadius: "8px",
  fontSize: "0.7rem",
  fontWeight: "800"
};

const dangerBtn = {
  background: "transparent",
  color: "#EF4444",
  border: "1px solid #FCA5A5",
  borderRadius: "8px",
  padding: "0.4rem 0.8rem",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "600",
  transition: "all 0.2s"
};

const lowStockRow = {
  background: "rgba(239, 68, 68, 0.02)"
};

const expiryAlertRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#fff",
  borderRadius: "12px",
  padding: "1rem",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

const loader = {
  padding: "4rem",
  textAlign: "center",
  color: "var(--slate-400)"
};

const emptyRow = {
  textAlign: "center",
  padding: "3rem",
  color: "var(--slate-400)"
};

const mutedText = {
  color: "var(--slate-500)",
  fontSize: "0.85rem"
};

export default InventoryManagement;
