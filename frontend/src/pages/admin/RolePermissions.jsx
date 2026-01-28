import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";
import { FiShield, FiCheck, FiX, FiLock } from "react-icons/fi";

/**
 * RolePermissions Component
 */
function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetches roles and the current permission mapping matrix.
   */
  const fetchData = async () => {
    try {
      const [rolesRes, matrixRes] = await Promise.all([
        API.get("/admin/roles"),
        API.get("/admin/permissions-matrix")
      ]);

      setRoles(rolesRes.data);
      setPermissions(matrixRes.data.allPermissions);
      setMatrix(matrixRes.data.roleMappings);
    } catch (err) {
      console.error("[ACM] Data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Checks if a role currently possesses a specific capability.
   */
  const isAssigned = (roleId, permissionId) => {
    return matrix.some(m => m.role_id === roleId && m.permission_id === permissionId);
  };

  /**
   * Toggles a permission for a role.
   * Safety: Prevents modification of 'ADMIN' permissions.
   */
  const handleToggle = async (roleId, permissionId, roleName) => {
    if (roleName === 'ADMIN') {
      alert("🛡️ Security Lock: Administrative permissions are immutable to prevent system lockout.");
      return;
    }

    try {
      await API.post("/admin/toggle-permission", { role_id: roleId, permission_id: permissionId });

      setMatrix(prev => {
        const exists = prev.find(m => m.role_id === roleId && m.permission_id === permissionId);
        if (exists) {
          return prev.filter(m => m !== exists);
        } else {
          return [...prev, { role_id: roleId, permission_id: permissionId }];
        }
      });
    } catch (err) {
      console.error("[ACM] Update failed:", err);
      alert("Failed to synchronize permissions matrix.");
    }
  };

  return (
    <AdminLayout>
      <header style={headerContainer}>
        <div style={titleGroup}>
          <div style={iconBox}><FiShield size={24} /></div>
          <div>
            <h1 style={titleStyle}>Access Control</h1>
            <p style={subtitleStyle}>Dynamically manage clinical and administrative capabilities</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={loader}>Synchronizing Permission Matrix...</div>
      ) : (
        <div style={tableCard}>
          <table style={table}>
            <thead style={thead}>
              <tr>
                <th style={thCapability}>Capability</th>
                <th style={thDesc}>Functionality Description</th>
                {roles.map(r => (
                  <th key={r.role_id} style={thRole}>{r.role_name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.permission_id} style={rowStyle}>
                  <td style={tdPerm}>
                    <div style={permName}>{p.permission_name.replace(/_/g, ' ')}</div>
                  </td>
                  <td style={tdDesc}>{getFriendlyDesc(p.permission_name)}</td>
                  {roles.map(r => {
                    const active = isAssigned(r.role_id, p.permission_id);
                    const isAdmin = r.role_name === 'ADMIN';
                    return (
                      <td
                        key={`${r.role_id}-${p.permission_id}`}
                        style={tdCheck}
                        onClick={() => handleToggle(r.role_id, p.permission_id, r.role_name)}
                      >
                        <div style={{
                          ...toggleBtn,
                          background: active ? "var(--slate-50)" : "transparent",
                          color: active ? "var(--primary-green)" : "var(--slate-300)",
                          border: active ? "1px solid var(--primary-green)" : "1px solid var(--slate-100)",
                          cursor: isAdmin ? "not-allowed" : "pointer"
                        }}>
                          {isAdmin ? <FiLock size={16} /> : active ? <FiCheck size={18} /> : <FiX size={18} />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

/**
 * Maps raw permission keys to human-readable functional descriptions.
 */
const getFriendlyDesc = (name) => {
  const descs = {
    'MANAGE_USERS': 'Oversee staff registry and access levels.',
    'MANAGE_INVENTORY': 'Track clinical stock, batches, and expiries.',
    'MANAGE_SERVICES': 'Configure clinic service offerings and pricing.',
    'VIEW_REVENUE': 'Access financial analytics and billing history.',
    'TREAT_PETS': 'Record clinical findings and update vitals.',
    'PRESCRIBE_MEDICATION': 'Generate official pharmacy prescriptions.',
    'VIEW_MEDICAL_HISTORY': 'Read-only access to all clinical pet records.',
    'MANAGE_QUEUE': 'Coordinate patient check-ins and waitlists.',
    'GENERATE_INVOICE': 'Finalize consultations and process payments.',
    'REGISTER_PETS': 'Onboard new pets into the clinic ecosystem.',
    'BOOK_APPOINTMENT': 'Schedule and manage pet owner visits.',
    'VIEW_NOTIFICATIONS': 'Receive critical system alerts and reminders.'
  };
  return descs[name] || 'Custom system capability.';
};

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "2.5rem"
};

const titleGroup = {
  display: "flex",
  alignItems: "center",
  gap: "1.2rem"
};

const iconBox = {
  background: "var(--primary-green)",
  color: "white",
  padding: "1rem",
  borderRadius: "16px",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.2)"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.2rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  lineHeight: "1.2"
};

const subtitleStyle = {
  color: "var(--slate-600)",
  fontSize: "1rem"
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

const thCapability = { padding: "1.2rem 1.5rem", fontWeight: "700", textAlign: "left" };
const thDesc = { padding: "1.2rem 1.5rem", fontWeight: "700", textAlign: "left" };
const thRole = { padding: "1.2rem 1.5rem", fontWeight: "700", textAlign: "center" };

const rowStyle = { borderBottom: "1px solid var(--slate-50)", transition: "background 0.2s" };

const tdPerm = { padding: "1.2rem 1.5rem" };
const permName = { fontWeight: "700", color: "var(--slate-800)", textTransform: "capitalize" };

const tdDesc = { padding: "1.2rem 1.5rem", color: "var(--slate-500)", fontSize: "0.9rem" };
const tdCheck = { padding: "0.8rem", textAlign: "center" };

const toggleBtn = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  margin: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s"
};

const loader = { padding: "5rem", textAlign: "center", color: "var(--slate-400)", fontSize: "1.1rem" };

export default RolePermissions;
