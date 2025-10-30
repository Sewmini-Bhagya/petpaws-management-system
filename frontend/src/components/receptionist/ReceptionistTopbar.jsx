import { FiBell, FiUser, FiSearch, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../config/routes";

/**
 * Top navigation bar for the Receptionist portal.
 * 
 * Functions as the status and utility layer for clinical registry operations.
 * Displays user identity and global operational status.
 */
function ReceptionistTopbar({ receptionistName = "Receptionist" }) {
  const navigate = useNavigate();

  return (
    <header style={topbarContainer}>
      <div style={searchPlaceholder}>
        <FiSearch style={searchIcon} />
        <input 
          type="text" 
          placeholder="Global Patient/Client Registry Search..." 
          style={searchInput} 
          onFocus={() => navigate(ROUTES.RECEPTIONIST.SEARCH)}
        />
      </div>

      <div style={utilityGroup}>
        <div style={statusBadge}>
          <FiCheckCircle />
          <span>Registry Active</span>
        </div>

        <div style={iconAction} title="Clinical Alerts">
          <FiBell />
          <span style={notifDot}></span>
        </div>

        <div style={profileSegment}>
          <div style={userInfo}>
            <span style={userLabel}>Clinical Staff</span>
            <span style={userName}>{receptionistName}</span>
          </div>
          <div style={avatarBox}>
            <FiUser />
          </div>
        </div>
      </div>
    </header>
  );
}

/* 🎨 STYLES */

const topbarContainer = {
  height: "90px",
  background: "white",
  borderBottom: "1px solid var(--slate-100)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 3rem",
  position: "sticky",
  top: 0,
  zIndex: 90
};

const searchPlaceholder = {
  position: "relative",
  width: "100%",
  maxWidth: "400px"
};

const searchIcon = {
  position: "absolute",
  left: "1.25rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

const searchInput = {
  width: "100%",
  padding: "0.85rem 1.25rem 0.85rem 3.25rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "0.95rem",
  color: "var(--slate-900)",
  outline: "none",
  cursor: "pointer"
};

const utilityGroup = {
  display: "flex",
  alignItems: "center",
  gap: "2.5rem"
};

const statusBadge = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  borderRadius: "10px",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  fontSize: "0.8rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const iconAction = {
  position: "relative",
  fontSize: "1.3rem",
  color: "var(--slate-400)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const notifDot = {
  position: "absolute",
  top: "-2px",
  right: "-2px",
  width: "8px",
  height: "8px",
  background: "#EF4444",
  borderRadius: "50%",
  border: "2px solid white"
};

const profileSegment = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem"
};

const userInfo = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end"
};

const userLabel = {
  fontSize: "0.7rem",
  fontWeight: "700",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const userName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const avatarBox = {
  width: "48px",
  height: "48px",
  borderRadius: "16px",
  background: "var(--slate-900)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.25rem",
  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.1)"
};

export default ReceptionistTopbar;
