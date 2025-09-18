import { useMemo } from "react";
import { 
  FiGrid, 
  FiCalendar, 
  FiFileText, 
  FiActivity, 
  FiClipboard, 
  FiClock,
  FiLogOut,
  FiHeart
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../config/routes";

/**
 * VetSidebar Component
 * 
 * The primary navigation controller for the Veterinary staff.
 * Features a high-density clinical module list with status indicators
 * and intuitive structural hierarchy.
 */
function VetSidebar({ active = "dashboard", onNavigate, onLogout }) {
  const navigate = useNavigate();

  const items = useMemo(
    () => [
      { key: "dashboard", label: "Control Center", icon: <FiGrid /> },
      { key: "appointments", label: "Active Rounds", icon: <FiCalendar /> },
      { key: "history", label: "Medical Archives", icon: <FiFileText /> },
      { key: "diagnosis", label: "Clinical Diagnosis", icon: <FiActivity /> },
      { key: "prescriptions", label: "Pharmacy Hub", icon: <FiClipboard /> },
      { key: "schedule", label: "Shift Schedule", icon: <FiClock /> },
    ],
    []
  );

  return (
    <aside style={sidebarWrapper}>
      <div style={brandContainer}>
        <div style={logoWrapper}>
          <FiHeart size={20} />
        </div>
        <div style={brandText}>
          <h1 style={brandTitle}>PetPaws</h1>
          <span style={brandBadge}>Clinical Portal</span>
        </div>
      </div>

      <nav style={navigationList}>
        {items.map((item) => (
          <NavItem
            key={item.key}
            icon={item.icon}
            text={item.label}
            active={active === item.key}
            onClick={() => onNavigate?.(item.key)}
          />
        ))}
      </nav>

      <div style={logoutContainer}>
        <button style={logoutBtn} onClick={() => onLogout?.()}>
          <FiLogOut />
          <span>Authorize Logout</span>
        </button>
      </div>
    </aside>
  );
}

/**
 * NavItem Component
 * 
 * A specialized clinical navigation terminal.
 */
function NavItem({ text, icon, active = false, onClick }) {
  return (
    <button
      type="button"
      style={{
        ...navItemBase,
        background: active ? "var(--primary-green)" : "transparent",
        color: active ? "white" : "var(--slate-500)",
        boxShadow: active ? "0 10px 15px -3px rgba(107, 143, 113, 0.3)" : "none",
      }}
      onClick={onClick}
    >
      <span style={active ? iconActive : iconBase}>{icon}</span>
      <span style={labelBase}>{text}</span>
    </button>
  );
}

/* 🎨 STYLES */

const sidebarWrapper = {
  width: "280px",
  height: "100vh",
  background: "white",
  borderRight: "1px solid var(--slate-100)",
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100,
  padding: "2rem"
};

const brandContainer = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "3.5rem",
  paddingLeft: "0.5rem"
};

const logoWrapper = {
  width: "40px",
  height: "40px",
  background: "var(--primary-green)",
  color: "white",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const brandText = {
  display: "flex",
  flexDirection: "column"
};

const brandTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0,
  letterSpacing: "-0.02em"
};

const brandBadge = {
  fontSize: "0.7rem",
  fontWeight: "800",
  color: "var(--primary-green)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const navigationList = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const navItemBase = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem 1.25rem",
  borderRadius: "16px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  textAlign: "left",
  width: "100%",
  fontWeight: "700",
  fontSize: "0.95rem"
};

const iconBase = {
  fontSize: "1.25rem",
  display: "flex",
  alignItems: "center",
  color: "var(--slate-400)"
};

const iconActive = {
  ...iconBase,
  color: "white"
};

const labelBase = {
  flex: 1
};

const logoutContainer = {
  marginTop: "auto",
  paddingTop: "2rem",
  borderTop: "1px solid var(--slate-50)"
};

const logoutBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  width: "100%",
  padding: "1rem 1.25rem",
  background: "var(--slate-50)",
  color: "var(--slate-500)",
  border: "none",
  borderRadius: "16px",
  fontSize: "0.85rem",
  fontWeight: "800",
  cursor: "pointer",
  transition: "all 0.2s"
};

export default VetSidebar;
