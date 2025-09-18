import { FiBell, FiUser, FiSearch, FiGlobe, FiSettings, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../config/routes";

/**
 * VetTopbar Component
 * 
 * The utility command layer for the Veterinary Clinical Suite.
 * Provides real-time status indicators, global clinical context,
 * and specialized staff identity management.
 * 
 * @param {Object} props
 * @param {string} props.vetName - Display name of the authenticated veterinarian
 */
function VetTopbar({ vetName = "Clinical Staff" }) {
  const navigate = useNavigate();

  return (
    <header style={topbarWrapper}>
      <div style={contextArea}>
        <div style={statusBadge}>
          <div style={pulseDot}></div>
          <span>On Clinical Duty</span>
        </div>
        <div style={searchPlaceholder}>
          <FiSearch />
          <span>Quick patient lookup...</span>
        </div>
      </div>

      <div style={utilityArea}>
        <button style={utilBtn} title="Global View" onClick={() => navigate(ROUTES.HOME)}>
          <FiGlobe />
        </button>

        <button style={utilBtn} title="Notifications">
          <div style={notifBadge}>2</div>
          <FiBell />
        </button>

        <div style={staffProfile}>
          <div style={staffMeta}>
            <span style={staffName}>{vetName}</span>
            <span style={staffRole}>Senior Veterinarian</span>
          </div>
          <div style={avatarCircle}>
            <FiUser />
          </div>
        </div>
      </div>
    </header>
  );
}

/* 🎨 STYLES */

const topbarWrapper = {
  height: "90px",
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid var(--slate-100)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 3rem",
  position: "sticky",
  top: 0,
  zIndex: 90,
  transition: "all 0.3s ease"
};

const contextArea = {
  display: "flex",
  alignItems: "center",
  gap: "2.5rem"
};

const statusBadge = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  padding: "0.6rem 1rem",
  borderRadius: "12px",
  fontSize: "0.75rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const pulseDot = {
  width: "8px",
  height: "8px",
  background: "var(--primary-green)",
  borderRadius: "50%",
  boxShadow: "0 0 0 0 rgba(107, 143, 113, 0.4)",
  animation: "pulse 2s infinite"
};

const searchPlaceholder = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "var(--slate-400)",
  fontSize: "0.9rem",
  fontWeight: "600",
  cursor: "pointer",
  padding: "0.6rem 1.25rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-50)",
  background: "var(--slate-50)",
  width: "300px"
};

const utilityArea = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem"
};

const utilBtn = {
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  background: "white",
  color: "var(--slate-500)",
  border: "1px solid var(--slate-100)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.25rem",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.2s"
};

const notifBadge = {
  position: "absolute",
  top: "-4px",
  right: "-4px",
  background: "#EF4444",
  color: "white",
  fontSize: "0.65rem",
  fontWeight: "900",
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid white"
};

const staffProfile = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  paddingLeft: "1.5rem",
  borderLeft: "1px solid var(--slate-100)",
  marginLeft: "0.5rem"
};

const staffMeta = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end"
};

const staffName = {
  fontSize: "0.95rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const staffRole = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--slate-400)"
};

const avatarCircle = {
  width: "48px",
  height: "48px",
  borderRadius: "16px",
  background: "var(--slate-900)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.25rem",
  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2)"
};

export default VetTopbar;
