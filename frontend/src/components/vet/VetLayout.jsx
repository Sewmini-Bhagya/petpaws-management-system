import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import VetSidebar from "./VetSidebar";
import VetTopbar from "./VetTopbar";
import ROUTES from "../../config/routes";

/**
 * VetLayout Component
 * 
 * The structural architecture for the Veterinary Clinical Suite.
 * Establishes a professional, high-focus environment for clinical operations,
 * featuring a persistent navigation system and a specialized utility topbar.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - View-specific clinical content
 * @param {string} props.active - Current active clinical context
 */
function VetLayout({ children, active = "dashboard" }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  /**
   * Orchestrates navigation between clinical modules.
   */
  const handleNavigate = (key) => {
    switch (key) {
      case "dashboard": return navigate(ROUTES.VET.DASHBOARD);
      case "appointments": return navigate(ROUTES.VET.APPOINTMENTS);
      case "history": return navigate(ROUTES.VET.HISTORY);
      case "diagnosis": return navigate(ROUTES.VET.DIAGNOSIS);
      case "prescriptions": return navigate(ROUTES.VET.PRESCRIPTIONS);
      case "schedule": return navigate(ROUTES.VET.SCHEDULE);
      default: return navigate(ROUTES.VET.DASHBOARD);
    }
  };

  return (
    <div style={layoutRoot}>
      <VetSidebar
        active={active}
        onNavigate={handleNavigate}
        onLogout={() => {
          logout();
          navigate(ROUTES.AUTH.LOGIN);
        }}
      />
      
      <div style={viewportContainer}>
        <VetTopbar vetName={user?.first_name ? `Dr. ${user.first_name}` : "Clinical Staff"} />
        <main style={mainContent}>
          <div style={contentWrapper}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* 🎨 STYLES */

const layoutRoot = {
  display: "flex",
  minHeight: "100vh",
  background: "var(--slate-50)",
  fontFamily: "'Inter', sans-serif"
};

const viewportContainer = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  marginLeft: "280px", // Accommodates fixed sidebar
  minWidth: 0 // Prevents flex-item overflow
};

const mainContent = {
  flex: 1,
  padding: "2.5rem",
  paddingTop: "1.5rem"
};

const contentWrapper = {
  maxWidth: "1400px",
  margin: "0 auto",
  width: "100%"
};

export default VetLayout;
