import { useContext } from "react";
import { FiBell, FiUser, FiSettings, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../config/routes";
import { AuthContext } from "../../context/AuthContext";

/**
 * ClientTopbar Component
 * 
 * The horizontal header for the Client Portal.
 * Displays the current section title, a search bar, and user-specific actions.
 */
function ClientTopbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <header style={topbarStyle}>
      <div style={searchContainer}>
        <FiSearch style={searchIcon} />
        <input 
          type="text" 
          placeholder="Search for pets, appointments, or products..." 
          style={searchInput} 
        />
      </div>

      <div style={actionGroup}>
        <button style={iconBtn} onClick={() => navigate(ROUTES.CLIENT.NOTIFICATIONS)} title="Notifications">
          <FiBell size={20} />
          <span style={notificationDot}></span>
        </button>

        <button style={iconBtn} title="Settings">
          <FiSettings size={20} />
        </button>

        <div style={divider}></div>

        <div 
          style={userSection} 
          onClick={() => navigate(user?.first_name ? ROUTES.CLIENT.EDIT_PROFILE : ROUTES.CLIENT.CREATE_PROFILE)}
        >
          <div style={userInfo}>
            <span style={userName}>{user?.first_name || "Pet Parent"}</span>
            <span style={userRole}>Client Account</span>
          </div>
          <div style={avatarBox}>
            <FiUser size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}

/* 🎨 STYLES */

const topbarStyle = {
  height: "80px",
  background: "white",
  borderBottom: "1px solid var(--slate-200)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 2.5rem",
  position: "sticky",
  top: 0,
  zIndex: 90
};

const searchContainer = {
  display: "flex",
  alignItems: "center",
  background: "var(--slate-50)",
  padding: "0.6rem 1.25rem",
  borderRadius: "14px",
  width: "400px",
  border: "1px solid var(--slate-100)"
};

const searchIcon = {
  color: "var(--slate-400)",
  marginRight: "0.75rem"
};

const searchInput = {
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: "0.9rem",
  color: "var(--slate-900)",
  width: "100%"
};

const actionGroup = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem"
};

const iconBtn = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  border: "none",
  background: "transparent",
  color: "var(--slate-600)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  position: "relative"
};

const notificationDot = {
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "8px",
  height: "8px",
  background: "#EF4444",
  borderRadius: "50%",
  border: "2px solid white"
};

const divider = {
  width: "1px",
  height: "24px",
  background: "var(--slate-200)",
  margin: "0 0.5rem"
};

const userSection = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.5rem",
  borderRadius: "14px",
  cursor: "pointer",
  transition: "background 0.2s"
};

const userInfo = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end"
};

const userName = {
  fontSize: "0.9rem",
  fontWeight: "700",
  color: "var(--slate-900)"
};

const userRole = {
  fontSize: "0.75rem",
  color: "var(--slate-500)",
  fontWeight: "500"
};

const avatarBox = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  background: "var(--slate-100)",
  color: "var(--primary-green)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

export default ClientTopbar;
