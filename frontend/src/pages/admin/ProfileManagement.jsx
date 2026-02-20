import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import API from "../../api/axios";

/**
 * ProfileManagement Component
 */
function ProfileManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("[ProfileManagement] Fetch profiles failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm("Are you sure you want to suspend this account?")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("[ProfileManagement] Suspend failed:", err);
      alert("Failed to suspend user.");
    }
  };

  return (
    <AdminLayout>
      <header style={headerContainer}>
        <h1 style={titleStyle}>Entity Profiles</h1>
        <p style={subtitleStyle}>Overview of registered clients and personnel details</p>
      </header>

      <div style={tableCard}>
        <table style={table}>
          <thead>
            <tr style={thead}>
              <th style={th}>Full Name</th>
              <th style={th}>Contact Email</th>
              <th style={th}>User Role</th>
              <th style={th}>Registration Date</th>
              <th style={th}>Operations</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "4rem", color: "var(--slate-400)", fontWeight: "600" }}>
                  Synchronizing entity profiles...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "4rem", color: "var(--slate-400)", fontWeight: "600" }}>
                  No registered profiles found in the database.
                </td>
              </tr>
            ) : (
              users.map((u, i) => {
                const fullName = u.first_name || u.last_name
                  ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                  : "Awaiting Onboarding";

                return (
                  <tr key={u.user_id} style={i % 2 === 0 ? rowEven : rowOdd}>
                    <td style={td}>
                      <div style={{
                        ...userName,
                        color: (u.first_name || u.last_name) ? "var(--slate-800)" : "var(--slate-400)",
                        fontStyle: (u.first_name || u.last_name) ? "normal" : "italic"
                      }}>{fullName}</div>
                    </td>
                    <td style={td}>
                      <div style={emailText}>{u.email}</div>
                    </td>
                    <td style={td}>
                      <span style={{
                        ...roleBadge,
                        background: u.role_name === "VET" ? "var(--primary-green)" : u.role_name === "ADMIN" ? "var(--slate-900)" : "var(--slate-100)",
                        color: u.role_name === "VET" || u.role_name === "ADMIN" ? "white" : "var(--slate-600)"
                      }}>
                        {u.role_name}
                      </span>
                    </td>
                    <td style={td}>{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                    <td style={td}>
                      <div style={actionGroup}>
                        <span style={{
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          alignSelf: "center",
                          marginRight: "1rem",
                          color: u.status === "ACTIVE" ? "var(--primary-green)" : "#EF4444",
                          textTransform: "uppercase"
                        }}>{u.status}</span>
                        {u.status === "ACTIVE" && (
                          <button style={deleteBtn} onClick={() => handleSuspend(u.user_id)}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

/* 🎨 STYLES */

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

const userName = { fontWeight: "700", color: "var(--slate-800)" };
const emailText = { color: "var(--slate-600)" };

const roleBadge = {
  padding: "0.3rem 0.7rem",
  borderRadius: "8px",
  fontSize: "0.75rem",
  fontWeight: "700",
};

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
  fontWeight: "600"
};

const deleteBtn = {
  padding: "0.5rem 1rem",
  background: "transparent",
  color: "#EF4444",
  border: "1px solid #FCA5A5",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "600"
};

export default ProfileManagement;