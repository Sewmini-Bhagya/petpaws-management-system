import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import ROUTES from "../../config/routes";
import { AuthContext } from "../../context/AuthContext";

/**
 * AdminSidebar Component
 * 
 * Vertical navigation menu for the Admin portal.
 * Provides access to all management modules and the logout trigger.
 */
function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div style={sidebar}>
      <div style={navGroup}>
        <NavItem text="Overview" onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)} />
        <NavItem text="User Directory" onClick={() => navigate(ROUTES.ADMIN.USER_MANAGEMENT)} />
        <NavItem text="Access Control" onClick={() => navigate(ROUTES.ADMIN.PERMISSIONS)} />
        <NavItem text="Inventory Hub" onClick={() => navigate(ROUTES.ADMIN.INVENTORY)} />
        <NavItem text="Appointments" onClick={() => navigate(ROUTES.ADMIN.APPOINTMENTS)} />
        <NavItem text="Service List" onClick={() => navigate(ROUTES.ADMIN.SERVICES)} />
        <NavItem text="Loyalty Program" onClick={() => navigate(ROUTES.ADMIN.LOYALTY)} />
      </div>

      <div style={footerGroup}>
        <NavItem
          text="Logout"
          isLogout
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}

/**
 * NavItem Component
 * 
 * Represents a single link in the sidebar with interactive hover states.
 */
function NavItem({ text, onClick, isLogout }) {
  const [hover, setHover] = useState(false);

  const dynamicStyle = {
    ...navItem,
    background: hover
      ? isLogout
        ? "#EF4444"
        : "var(--primary-green)"
      : "transparent",
    color: hover || isLogout ? "white" : "var(--slate-700)",
    fontWeight: hover ? "700" : "500",
  };

  return (
    <div
      style={dynamicStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {text}
    </div>
  );
}

/* styles */

const sidebar = {
  width: "260px",
  minHeight: "calc(100vh - 70px)",
  background: "#fff",
  padding: "2rem 1rem",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid var(--slate-200)"
};

const navGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem"
};

const footerGroup = {
  marginTop: "auto",
  width: "100%",
  paddingTop: "1rem",
  borderTop: "1px solid var(--slate-100)"
};

const navItem = {
  padding: "0.8rem 1.2rem",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontSize: "0.95rem",
};

export default AdminSidebar;