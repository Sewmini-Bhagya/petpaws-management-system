import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiHeart, 
  FiCalendar, 
  FiShoppingBag, 
  FiMessageSquare, 
  FiBell,
  FiLogOut,
  FiArrowLeft
} from "react-icons/fi";

/**
 * ClientSidebar Component
 * 
 * The primary navigation controller for the Client Portal.
 * Features a vertical list of portal modules with visual feedback for the active route.
 */
function ClientSidebar({ active = "dashboard", onNavigate, onLogout }) {
  const navigate = useNavigate();
  const items = useMemo(
    () => [
      { key: "home", label: "Main Home", icon: <FiArrowLeft /> },
      { key: "dashboard", label: "Dashboard", icon: <FiHome /> },
      { key: "pets", label: "My Pets", icon: <FiHeart /> },
      { key: "appointments", label: "Appointments", icon: <FiCalendar /> },
      { key: "shop", label: "Pet Shop", icon: <FiShoppingBag /> },
      { key: "notifications", label: "Notifications", icon: <FiBell /> },
      { key: "feedback", label: "Feedback", icon: <FiMessageSquare /> },
    ],
    []
  );

  const handleItemClick = (key) => {
    if (key === "home") {
      navigate("/");
    } else {
      onNavigate?.(key);
    }
  };

  return (
    <aside style={sidebarStyle}>
      <div style={{ ...logoContainer, cursor: "pointer" }} onClick={() => navigate("/")}>
        <div style={logoCircle}>PP</div>
        <span style={logoText}>PetPaws</span>
      </div>

      <nav style={navGroup}>
        {items.map((item) => (
          <NavItem
            key={item.key}
            icon={item.icon}
            text={item.label}
            active={active === item.key}
            onClick={() => handleItemClick(item.key)}
          />
        ))}
      </nav>

      <div style={footerGroup}>
        <NavItem
          icon={<FiLogOut />}
          text="Sign Out"
          isLogout
          onClick={onLogout}
        />
      </div>
    </aside>
  );
}

/**
 * NavItem Component
 * 
 * Individual navigation button with icon and text.
 */
function NavItem({ icon, text, active = false, onClick, isLogout }) {
  const baseStyle = {
    ...navItemBase,
    background: active ? "var(--primary-green)" : "transparent",
    color: active ? "white" : "var(--slate-600)",
    boxShadow: active ? "0 4px 12px rgba(107, 143, 113, 0.25)" : "none",
  };

  const logoutStyle = {
    ...navItemBase,
    color: "#EF4444",
    marginTop: "1rem",
  };

  return (
    <button
      type="button"
      style={isLogout ? logoutStyle : baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active && !isLogout) {
          e.currentTarget.style.background = "var(--slate-100)";
          e.currentTarget.style.color = "var(--slate-900)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active && !isLogout) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--slate-600)";
        }
      }}
    >
      <span style={iconWrapper}>{icon}</span>
      <span style={textWrapper}>{text}</span>
    </button>
  );
}

/* 🎨 STYLES */

const sidebarStyle = {
  width: "280px",
  height: "100vh",
  background: "white",
  borderRight: "1px solid var(--slate-200)",
  display: "flex",
  flexDirection: "column",
  padding: "2rem 1.25rem",
  zIndex: 100
};

const logoContainer = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0 0.5rem",
  marginBottom: "3rem"
};

const logoCircle = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  background: "var(--primary-green)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  fontSize: "1.1rem"
};

const logoText = {
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  fontFamily: "'Outfit', sans-serif"
};

const navGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  flex: 1
};

const footerGroup = {
  borderTop: "1px solid var(--slate-100)",
  paddingTop: "1.5rem"
};

const navItemBase = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  width: "100%",
  padding: "0.9rem 1rem",
  borderRadius: "14px",
  border: "none",
  cursor: "pointer",
  fontSize: "0.95rem",
  fontWeight: "600",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  textAlign: "left"
};

const iconWrapper = {
  fontSize: "1.2rem",
  display: "flex",
  alignItems: "center"
};

const textWrapper = {
  letterSpacing: "-0.01em"
};

export default ClientSidebar;
