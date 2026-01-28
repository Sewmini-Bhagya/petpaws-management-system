import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";

/**
 * UserManagement Component
 * 
 * Provides an interface for the administrator to oversee the staff directory.
 * Admins can register new staff members (Veterinarians, Receptionists), 
 * modify existing roles, and manage account statuses.
 */
function UserManagement() {
  const [roles, setRoles] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState("VET");
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  /**
   * Fetches the complete list of system users.
   */
  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("[UserManagement] Fetch users failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches available roles for assignment.
   */
  const fetchRoles = async () => {
    try {
      const res = await API.get("/admin/roles");
      setRoles(res.data);
    } catch (err) {
      console.error("[UserManagement] Fetch roles failed:", err);
    }
  };

  // Live filtering based on search input
  useEffect(() => {
    const term = search.toLowerCase();
    const filteredData = users.filter((u) =>
      (u.email || "").toLowerCase().includes(term) ||
      (u.role_name || u.role || "").toLowerCase().includes(term)
    );
    setFiltered(filteredData);
  }, [search, users]);

  /**
   * Updates a specific user's system role.
   */
  const handleRoleChange = async (userId, newRoleName) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role_name: newRoleName });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role_name: newRoleName } : u));
    } catch (err) {
      alert("Failed to update role. Please check server logs.");
    }
  };

  /**
   * Deactivates a user account.
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this user account? This action is reversible by the database administrator.")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.user_id !== id));
    } catch (err) {
      console.error("[UserManagement] Delete failed:", err);
    }
  };

  return (
    <AdminLayout>
      <header style={headerContainer}>
        <div>
          <h1 style={titleStyle}>Staff Directory</h1>
          <p style={subtitleStyle}>Manage system access and roles for all clinic personnel</p>
        </div>
        <div style={btnGroup}>
          <button style={actionBtn} onClick={() => { setNewRole("VET"); setShowAddModal(true); }}>
            + Add Veterinarian
          </button>
          <button style={secondaryBtn} onClick={() => { setNewRole("RECEPTIONIST"); setShowAddModal(true); }}>
            + Add Receptionist
          </button>
        </div>
      </header>

      <div style={searchRow}>
        <div style={searchContainer}>
          <input
            placeholder="Filter by email or role classification..."
            style={searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={tableCard}>
        <table style={table}>
          <thead style={thead}>
            <tr>
              <th style={th}>Identifier</th>
              <th style={th}>Full Name</th>
              <th style={th}>Access Credentials</th>
              <th style={th}>Role Assignment</th>
              <th style={th}>Registration Date</th>
              <th style={th}>Status</th>
              <th style={th}>Operations</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={loaderCell}>Synchronizing directory...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={emptyRow}>
                  No staff or user profiles match the specified criteria.
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => {
                const fullName = u.first_name || u.last_name 
                  ? `${u.first_name || ""} ${u.last_name || ""}`.trim() 
                  : "Awaiting Onboarding";

                return (
                  <tr key={u.user_id} style={i % 2 === 0 ? rowEven : rowOdd}>
                    <td style={td}>
                      <span style={userIdBadge}>#{u.user_id}</span>
                    </td>
                    <td style={td}>
                      <div style={{
                        fontWeight: "700",
                        color: (u.first_name || u.last_name) ? "var(--slate-800)" : "var(--slate-400)",
                        fontStyle: (u.first_name || u.last_name) ? "normal" : "italic"
                      }}>{fullName}</div>
                    </td>
                    <td style={td}>
                      <div style={emailText}>{u.email}</div>
                    </td>

                    <td style={td}>
                      <select
                        value={u.role_name}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                        style={roleSelect}
                      >
                        {roles.map(r => (
                          <option key={r.role_id} value={r.role_name}>{r.role_name}</option>
                        ))}
                      </select>
                    </td>

                    <td style={td}>
                      <div style={{ color: "var(--slate-500)", fontSize: "0.9rem" }}>
                        {new Date(u.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </td>

                    <td style={td}>
                      <span style={{
                        ...statusBadge,
                        background: u.status === "ACTIVE" ? "var(--slate-50)" : "#FEE2E2",
                        color: u.status === "ACTIVE" ? "var(--primary-green)" : "#991B1B",
                        border: u.status === "ACTIVE" ? "1px solid var(--primary-green)" : "1px solid #FCA5A5"
                      }}>
                        {u.status}
                      </span>
                    </td>

                    <td style={td}>
                      <button
                        style={dangerBtn}
                        onClick={() => handleDelete(u.user_id)}
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
      </div>

      {showAddModal && (
        <AddUserModal
          role={newRole}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchUsers(); }}
        />
      )}
    </AdminLayout>
  );
}

/**
 * AddUserModal Component
 * 
 * Renders a secure modal interface to register a new system user.
 */
function AddUserModal({ role, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/admin/create-user", { email, password, role_name: role });
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h2 style={modalTitle}>Register {role}</h2>
        <p style={modalSubtitle}>Assign credentials for a new clinic staff member.</p>
        
        <form onSubmit={handleSubmit} style={form}>
          <div style={modalInputGroup}>
            <label style={inputLabel}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. staff@petpaws.com"
              style={modalInput}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={modalInputGroup}>
            <label style={inputLabel}>Initial Password</label>
            <input
              type="password"
              placeholder="••••••••"
              style={modalInput}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={modalBtns}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={mainBtn}>
              {loading ? "Registering..." : "Confirm Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
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

const btnGroup = { display: "flex", gap: "1rem" };

const actionBtn = {
  padding: "0.8rem 1.5rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.2)",
  transition: "transform 0.2s"
};

const secondaryBtn = {
  padding: "0.8rem 1.5rem",
  background: "white",
  color: "var(--primary-green)",
  border: "2px solid var(--primary-green)",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  transition: "all 0.2s"
};

const searchRow = { marginBottom: "1.5rem" };

const searchContainer = {
  maxWidth: "500px",
  background: "white",
  borderRadius: "16px",
  padding: "2px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-200)"
};

const searchInput = {
  width: "100%",
  padding: "0.8rem 1.2rem",
  borderRadius: "14px",
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: "0.95rem"
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

const userIdBadge = {
  background: "var(--slate-100)",
  padding: "0.3rem 0.6rem",
  borderRadius: "8px",
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "var(--slate-600)"
};

const emailText = { fontWeight: "600", color: "var(--slate-800)" };

const rowEven = { background: "#fff" };
const rowOdd = { background: "rgba(107, 143, 113, 0.02)" };

const roleSelect = {
  padding: "0.5rem 1rem",
  borderRadius: "10px",
  border: "1px solid var(--slate-200)",
  background: "white",
  fontSize: "0.85rem",
  fontWeight: "600",
  cursor: "pointer",
  outline: "none"
};

const statusBadge = {
  padding: "0.3rem 0.8rem",
  borderRadius: "10px",
  fontSize: "0.75rem",
  fontWeight: "800",
  letterSpacing: "0.02em"
};

const dangerBtn = {
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

const loaderCell = { textAlign: "center", padding: "4rem", color: "var(--slate-400)" };
const emptyRow = { textAlign: "center", padding: "4rem", color: "var(--slate-400)" };

/* MODAL */
const modalOverlay = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContent = {
  background: "#fff",
  padding: "3rem",
  borderRadius: "28px",
  width: "440px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
};

const modalTitle = { 
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.75rem", 
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const modalSubtitle = {
  color: "var(--slate-500)",
  fontSize: "0.95rem",
  marginBottom: "2rem"
};

const form = { display: "flex", flexDirection: "column", gap: "1.5rem" };

const modalInputGroup = { display: "flex", flexDirection: "column", gap: "0.5rem" };
const inputLabel = { fontSize: "0.85rem", fontWeight: "700", color: "var(--slate-700)", marginLeft: "0.2rem" };

const modalInput = { 
  padding: "0.9rem 1.2rem", 
  borderRadius: "14px", 
  border: "1px solid var(--slate-200)", 
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.2s"
};

const modalBtns = { display: "flex", gap: "1rem", marginTop: "1rem" };

const cancelBtn = { 
  flex: 1, 
  padding: "0.9rem", 
  borderRadius: "14px", 
  border: "1px solid var(--slate-200)", 
  background: "white", 
  color: "var(--slate-600)",
  fontWeight: "600",
  cursor: "pointer" 
};

const mainBtn = { 
  flex: 1.5, 
  padding: "0.9rem", 
  borderRadius: "14px", 
  border: "none", 
  background: "var(--primary-green)", 
  color: "white", 
  fontWeight: "700", 
  cursor: "pointer",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.2)"
};

export default UserManagement;