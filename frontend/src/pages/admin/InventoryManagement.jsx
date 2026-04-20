import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminSidebar from "../../components/admin/AdminSidebar";

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

  const fetchInventory = async () => {
    try {
      const [itemsRes, expiryRes] = await Promise.all([
        API.get("/inventory"),
        API.get("/inventory/expiry-alerts")
      ]);

      setItems(itemsRes.data || []);
      setExpiryAlerts(expiryRes.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load inventory");
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

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!newItem.item_name.trim()) {
      alert("Item name is required");
      return;
    }

    if (Number(newItem.reorder_level) < 0) {
      alert("Reorder level must be >= 0");
      return;
    }

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
      console.error(error);
      alert(error.response?.data?.message || "Failed to add item");
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();

    if (!stockForm.inventory_item_id) {
      alert("Select an item");
      return;
    }

    if (Number(stockForm.quantity) < 0) {
      alert("Quantity must be >= 0");
      return;
    }

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
      console.error(error);
      alert(error.response?.data?.message || "Failed to update stock");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      await API.delete(`/inventory/${id}`);
      await fetchInventory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete item");
    }
  };

  return (
    <div style={container}>
      <AdminTopbar />

      <div style={main}>
        <AdminSidebar />

        <div style={content}>
          <h1 style={title}>Inventory Management</h1>

          <div style={formGrid}>
            <form style={card} onSubmit={handleAddItem}>
              <h3>Add New Item</h3>
              <input
                style={input}
                placeholder="Item name"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
              />

              <select
                style={input}
                value={newItem.item_type}
                onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })}
              >
                <option value="MEDICATION">MEDICATION</option>
                <option value="FOOD">FOOD</option>
                <option value="TOYS">TOYS</option>
                <option value="OTHER">OTHER</option>
              </select>

              <input
                style={input}
                type="number"
                min="0"
                placeholder="Reorder level"
                value={newItem.reorder_level}
                onChange={(e) => setNewItem({ ...newItem, reorder_level: e.target.value })}
              />

              <input
                style={input}
                type="date"
                value={newItem.expiry_date}
                onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
              />

              <input
                style={input}
                placeholder="Batch number"
                value={newItem.batch_number}
                onChange={(e) => setNewItem({ ...newItem, batch_number: e.target.value })}
              />

              <input
                style={input}
                placeholder="Unit of measure"
                value={newItem.unit_of_measure}
                onChange={(e) => setNewItem({ ...newItem, unit_of_measure: e.target.value })}
              />

              <button style={primaryBtn} type="submit">Add Item</button>
            </form>

            <form style={card} onSubmit={handleUpdateStock}>
              <h3>Update Stock</h3>

              <select
                style={input}
                value={stockForm.inventory_item_id}
                onChange={(e) => setStockForm({ ...stockForm, inventory_item_id: e.target.value })}
              >
                <option value="">Select item</option>
                {items.map((item) => (
                  <option key={item.inventory_item_id} value={item.inventory_item_id}>
                    {item.item_name}
                  </option>
                ))}
              </select>

              <input
                style={input}
                type="number"
                min="0"
                placeholder="New quantity"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
              />

              <select
                style={input}
                value={stockForm.transaction_type}
                onChange={(e) => setStockForm({ ...stockForm, transaction_type: e.target.value })}
              >
                <option value="ADD">ADD</option>
                <option value="USE">USE</option>
                <option value="ADJUST">ADJUST</option>
              </select>

              <input
                style={input}
                placeholder="Remarks"
                value={stockForm.remarks}
                onChange={(e) => setStockForm({ ...stockForm, remarks: e.target.value })}
              />

              <button style={primaryBtn} type="submit">Update Stock</button>
            </form>
          </div>

          <div style={{ ...card, marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Items Near Expiry (30 days)</h3>
            {expiryAlerts.length === 0 ? (
              <p style={{ color: "#666" }}>No expiry alerts</p>
            ) : (
              expiryAlerts.map((alert) => (
                <div key={alert.inventory_item_id} style={expiryAlertRow}>
                  <strong>{alert.item_name}</strong>
                  <span>
                    Expiry: {alert.expiry_date?.slice(0, 10)} ({alert.days_to_expiry} days)
                  </span>
                </div>
              ))
            )}
          </div>

          <div style={{ ...card, marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Inventory List</h3>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table style={table}>
                <thead style={thead}>
                  <tr>
                    <th style={th}>Item</th>
                    <th style={th}>Type</th>
                    <th style={th}>Quantity</th>
                    <th style={th}>Reorder Level</th>
                    <th style={th}>Status</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={emptyRow}>No inventory items found</td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const isLow = Number(item.quantity_available) <= Number(item.reorder_level);
                      const expiring = expiryMap.get(item.inventory_item_id);

                      return (
                        <tr
                          key={item.inventory_item_id}
                          style={isLow ? lowStockRow : {}}
                        >
                          <td style={td}>{item.item_name}</td>
                          <td style={td}>{item.item_type}</td>
                          <td style={td}>{item.quantity_available}</td>
                          <td style={td}>{item.reorder_level}</td>
                          <td style={td}>
                            {isLow && <span style={lowBadge}>Low Stock</span>}
                            {expiring && <span style={expiryBadge}>Expiring Soon</span>}
                          </td>
                          <td style={td}>
                            <button
                              style={dangerBtn}
                              onClick={() => handleDelete(item.inventory_item_id)}
                            >
                              Delete
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
        </div>
      </div>
    </div>
  );
}

const container = {
  minHeight: "100vh",
  background: "#F7F9F7"
};

const main = {
  display: "flex"
};

const content = {
  flex: 1,
  padding: "2rem"
};

const title = {
  fontSize: "2.2rem",
  marginBottom: "1rem"
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem"
};

const card = {
  background: "#fff",
  borderRadius: "14px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  padding: "1rem"
};

const input = {
  width: "100%",
  padding: "0.7rem",
  marginBottom: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const primaryBtn = {
  background: "#6B8F71",
  color: "white",
  border: "none",
  padding: "0.6rem 1rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const thead = {
  background: "#6B8F71",
  color: "white"
};

const th = {
  textAlign: "left",
  padding: "10px"
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};

const emptyRow = {
  textAlign: "center",
  padding: "1rem",
  color: "#666"
};

const lowStockRow = {
  background: "#ffe5e5"
};

const lowBadge = {
  background: "#d9534f",
  color: "white",
  borderRadius: "12px",
  fontSize: "0.75rem",
  padding: "0.2rem 0.5rem",
  marginRight: "0.4rem"
};

const expiryBadge = {
  background: "#f0ad4e",
  color: "white",
  borderRadius: "12px",
  fontSize: "0.75rem",
  padding: "0.2rem 0.5rem"
};

const dangerBtn = {
  background: "#d9534f",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "0.4rem 0.7rem",
  cursor: "pointer"
};

const expiryAlertRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#fff4de",
  border: "1px solid #f4cd88",
  borderRadius: "8px",
  padding: "0.7rem",
  marginBottom: "0.5rem"
};

export default InventoryManagement;
