import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiCalendar, 
  FiUsers, 
  FiSearch, 
  FiCreditCard, 
  FiShoppingBag, 
  FiLogOut,
  FiArrowLeft
} from "react-icons/fi";
import { FaPaw } from "react-icons/fa";
import ROUTES from "../../config/routes";

/**
 * Navigation sidebar for the Receptionist portal.
 * 
 * Provides centralized routing control for front-desk operations, 
 * focusing on high-traffic clinical workflows.
 */
function ReceptionistSidebar({ active = "dashboard", onNavigate, onLogout }) {
  const navigate = useNavigate();

  const items = useMemo(
    () => [
      { key: "home", label: "Main Home", icon: <FiArrowLeft /> },
      { key: "dashboard", label: "Registry Home", icon: <FiHome /> },
      { key: "appointments", label: "Appointments", icon: <FiCalendar /> },
      { key: "queue", label: "Live Clinic Queue", icon: <FiUsers /> },
      { key: "search", label: "Identity Search", icon: <FiSearch /> },
      { key: "billing", label: "Billing Console", icon: <FiCreditCard /> },
      { key: "sales", label: "Retail Terminal", icon: <FiShoppingBag /> }, 
    ],
    []
  );

  return (
    <aside style={sidebarContainer}>
      <div 
        style={{ ...brandWrapper, cursor: "pointer" }} 
        onClick={() => navigate("/")}
      >
        <div style={logoIcon}><FaPaw /></div>
        <div style={brandText}>
          <span style={brandMain}>PetPaws</span>
          <span style={brandSub}>Receptionist</span>
        </div>
      </div>

      <nav style={navigationMenu}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => item.key === "home" ? navigate("/") : onNavigate && onNavigate(item.key)}
            style={{
              ...navItemBase,
              background: active === item.key ? "var(--primary-green)" : "transparent",
              color: active === item.key ? "white" : "var(--slate-400)",
              boxShadow: active === item.key ? "0 10px 15px -3px rgba(107, 143, 113, 0.3)" : "none"
            }}
          >
            <span style={iconSpan}>{item.icon}</span>
            <span style={labelSpan}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={footerWrapper}>
        <button
          onClick={() => {
            if (onLogout) return onLogout();
            localStorage.clear();
            navigate(ROUTES.AUTH.LOGIN);
          }}
          style={logoutBtn}
        >
          <FiLogOut />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
}

/* 🎨 STYLES */

const sidebarContainer = {
  width: "280px",
  height: "100vh",
  background: "var(--slate-900)",
  padding: "2.5rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const brandWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "3.5rem",
  paddingLeft: "0.5rem"
};

const logoIcon = {
  width: "40px",
  height: "40px",
  background: "var(--primary-green)",
  color: "white",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem",
  boxShadow: "0 8px 16px rgba(107, 143, 113, 0.2)"
};

const brandText = {
  display: "flex",
  flexDirection: "column"
};

const brandMain = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "white",
  letterSpacing: "0.02em"
};

const brandSub = {
  fontSize: "0.7rem",
  fontWeight: "700",
  color: "var(--primary-green)",
  textTransform: "uppercase",
  letterSpacing: "0.1em"
};

const navigationMenu = {
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem"
};

const navItemBase = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem 1.25rem",
  borderRadius: "16px",
  border: "none",
  fontSize: "0.95rem",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  textAlign: "left"
};

const iconSpan = {
  fontSize: "1.2rem",
  display: "flex",
  alignItems: "center"
};

const labelSpan = {
  flex: 1
};

const footerWrapper = {
  marginTop: "auto",
  paddingTop: "2rem"
};

const logoutBtn = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  padding: "1.25rem",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444",
  border: "none",
  borderRadius: "20px",
  fontSize: "0.9rem",
  fontWeight: "800",
  cursor: "pointer",
  transition: "all 0.2s"
};

export default ReceptionistSidebar;