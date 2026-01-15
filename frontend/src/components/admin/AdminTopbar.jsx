import { FiBell, FiUser } from "react-icons/fi";
import { FaPaw, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import ROUTES from "../../config/routes";
import { AuthContext } from "../../context/AuthContext";

/**
 * AdminTopbar Component
 * 
 * Horizontal navigation header for the Admin portal.
 * Features brand identity, global action icons, and user session indicators.
 */
function AdminTopbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div style={topbar}>
      <h2 style={logoContainer} onClick={() => navigate(ROUTES.HOME)}>
        Pet Paws <FaPaw size={24} style={pawIcon} />
      </h2>

      <div style={actionsContainer}>
        <div style={iconAction} title="Home" onClick={() => navigate(ROUTES.HOME)}>
          <FaHome color="white" size={18} />
        </div>

        <div style={iconAction} title="Notifications">
          <FiBell color="white" size={18} />
        </div>

        <div style={profileBadge} onClick={() => navigate(ROUTES.ADMIN.USER_MANAGEMENT)}>
          <div style={avatarCircle}>
            <FiUser color="var(--primary-green)" size={18} />
          </div>
          <span style={adminName}>{user?.name || "Administrator"}</span>
        </div>
      </div>
    </div>
  );
}

/* styles */

const topbar = {
  height: "70px",
  background: "var(--primary-green)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 2rem",
  color: "white",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  zIndex: 100
};

const logoContainer = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: "800",
  fontSize: "1.6rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem"
};

const pawIcon = {
  marginBottom: "-4px"
};

const actionsContainer = {
  display: "flex",
  gap: "1.2rem",
  alignItems: "center"
};

const iconAction = {
  width: "38px",
  height: "38px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background 0.2s ease",
  ":hover": {
    background: "rgba(255,255,255,0.25)"
  }
};

const profileBadge = {
  display: "flex",
  alignItems: "center",
  gap: "0.8rem",
  padding: "0.4rem 1rem 0.4rem 0.4rem",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.1)",
  cursor: "pointer",
  transition: "background 0.2s ease",
  marginLeft: "0.5rem"
};

const avatarCircle = {
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  background: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const adminName = {
  fontWeight: "600",
  fontSize: "0.9rem"
};

export default AdminTopbar;