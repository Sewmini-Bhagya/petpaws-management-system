import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import API from "../../api/axios";

/**
 * ServicesManagement Component
 * 
 * Provides full administrative management over the clinic's service catalog.
 * Supports real-time CRUD operations with a polished modal user interface.
 */
function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    service_name: "",
    category: "Medical",
    duration: "30",
    price: ""
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error("[ServicesManagement] Fetch services failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      service_name: "",
      category: "Medical",
      duration: "30",
      price: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingService(s);
    setFormData({
      service_name: s.service_name || "",
      category: s.category || "Medical",
      duration: String(s.duration || "30"),
      price: String(s.price || "")
    });
    setShowModal(true);
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this service?")) return;
    try {
      await API.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      console.error("[ServicesManagement] Archive failed:", err);
      alert("Failed to archive service.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service_name || !formData.price || !formData.duration) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      service_name: formData.service_name,
      category: formData.category,
      duration: formData.duration,
      price: Number(formData.price)
    };

    try {
      if (editingService) {
        await API.put(`/services/${editingService.service_id}`, payload);
      } else {
        await API.post("/services", payload);
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      console.error("[ServicesManagement] Save failed:", err);
      alert("Failed to save service changes.");
    }
  };

  return (
    <AdminLayout>
      <header style={headerContainer}>
        <div>
          <h1 style={titleStyle}>Service Catalog</h1>
          <p style={subtitleStyle}>Configure medical and care services offered to clients</p>
        </div>
        <button style={addBtn} onClick={handleOpenAdd}>+ Add New Service</button>
      </header>

      <div style={tableCard}>
        <table style={table}>
          <thead>
            <tr style={thead}>
              <th style={th}>Service Name</th>
              <th style={th}>Classification</th>
              <th style={th}>Est. Duration</th>
              <th style={th}>Standard Fee</th>
              <th style={th}>Operations</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "4rem", color: "var(--slate-400)", fontWeight: "600" }}>
                  Synchronizing service catalog...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "4rem", color: "var(--slate-400)", fontWeight: "600" }}>
                  No services currently available. Click "+ Add New Service" to start.
                </td>
              </tr>
            ) : (
              services.map((s, i) => (
                <tr key={s.service_id} style={i % 2 === 0 ? rowEven : rowOdd}>
                  <td style={td}>
                    <div style={serviceName}>{s.service_name}</div>
                  </td>
                  <td style={td}>
                    <span style={categoryBadge}>{s.category || "Medical"}</span>
                  </td>
                  <td style={td}>{s.duration} mins</td>
                  <td style={td}>
                    <div style={priceText}>Rs. {Number(s.price || 0).toLocaleString()}</div>
                  </td>
                  <td style={td}>
                    <div style={actionGroup}>
                      <button style={editBtn} onClick={() => handleOpenEdit(s)}>Edit</button>
                      <button style={deleteBtn} onClick={() => handleArchive(s.service_id)}>Archive</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h2 style={modalTitle}>{editingService ? "Modify Catalog Item" : "Create New Catalog Item"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={formGroup}>
                <label style={label}>Service Name *</label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="e.g. Full Grooming Session"
                  style={input}
                  required
                />
              </div>

              <div style={formRow}>
                <div style={{ ...formGroup, flex: 1 }}>
                  <label style={label}>Classification Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={selectInput}
                  >
                    <option value="Medical">Medical</option>
                    <option value="Prevention">Prevention</option>
                    <option value="Care">Care</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ ...formGroup, flex: 1 }}>
                  <label style={label}>Est. Duration (Mins) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 30"
                    style={input}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div style={formGroup}>
                <label style={label}>Standard Fee (Rs.) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 2500"
                  style={input}
                  min="0"
                  required
                />
              </div>

              <div style={modalActions}>
                <button type="button" style={cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={saveBtn}>Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "2.5rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
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

const addBtn = {
  padding: "0.8rem 1.5rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.95rem",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  transition: "all 0.2s ease"
};

const tableCard = {
  background: "#fff",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)"
};

const table = { width: "100%", borderCollapse: "collapse" };

const thead = {
  background: "var(--slate-50)",
  color: "var(--slate-600)",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const th = { padding: "1.2rem 1.5rem", fontWeight: "700", textAlign: "left" };
const td = { padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--slate-50)", fontSize: "0.95rem" };

const serviceName = { fontWeight: "700", color: "var(--slate-800)" };

const categoryBadge = {
  background: "rgba(107, 143, 113, 0.1)",
  padding: "0.3rem 0.7rem",
  borderRadius: "8px",
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--primary-green)"
};

const priceText = { fontWeight: "800", color: "var(--slate-800)" };

const rowEven = { background: "#fff" };
const rowOdd = { background: "rgba(107, 143, 113, 0.02)" };

const actionGroup = { display: "flex", gap: "0.5rem" };

const editBtn = {
  padding: "0.5rem 1rem",
  background: "var(--slate-100)",
  color: "var(--slate-700)",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "600",
  transition: "background 0.2s"
};

const deleteBtn = {
  padding: "0.5rem 1rem",
  background: "transparent",
  color: "#EF4444",
  border: "1px solid #FCA5A5",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "600",
  transition: "all 0.2s"
};

// Modal Design Styles
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(15, 23, 42, 0.3)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContent = {
  background: "white",
  borderRadius: "24px",
  padding: "2.5rem",
  width: "480px",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
  border: "1px solid var(--slate-100)"
};

const modalTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.6rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "1.8rem"
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginBottom: "1.2rem"
};

const formRow = {
  display: "flex",
  gap: "1rem",
  marginBottom: "0.2rem"
};

const label = {
  fontSize: "0.85rem",
  fontWeight: "700",
  color: "var(--slate-700)"
};

const input = {
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-200)",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "inherit"
};

const selectInput = {
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-200)",
  fontSize: "0.95rem",
  outline: "none",
  background: "white",
  fontFamily: "inherit"
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.8rem",
  marginTop: "2rem"
};

const cancelBtn = {
  padding: "0.8rem 1.5rem",
  background: "var(--slate-100)",
  color: "var(--slate-700)",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700"
};

const saveBtn = {
  padding: "0.8rem 1.5rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700"
};

export default ServicesManagement;