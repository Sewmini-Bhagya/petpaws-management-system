import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ReceptionistSidebar from "./ReceptionistSidebar";
import ReceptionistTopbar from "./ReceptionistTopbar";
import ROUTES from "../../config/routes";

/**
 * Structural layout wrapper for all Receptionist portal views.
 * 
 * Orchestrates the clinical operations interface by composing 
 * the high-frequency sidebar navigation and administrative topbar.
 */
function ReceptionistLayout({ children, active = "dashboard" }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleNavigate = (key) => {
    switch(key) {
      case "dashboard": return navigate(ROUTES.RECEPTIONIST.DASHBOARD);
      case "appointments": return navigate(ROUTES.RECEPTIONIST.APPOINTMENTS);
      case "queue": return navigate(ROUTES.RECEPTIONIST.QUEUE);
      case "search": return navigate(ROUTES.RECEPTIONIST.SEARCH);
      case "billing": return navigate(ROUTES.RECEPTIONIST.BILLING);
      case "sales": return navigate(ROUTES.RECEPTIONIST.SALES);
      default: return navigate(ROUTES.RECEPTIONIST.DASHBOARD);
    }
  };

  return (
    <div style={layoutContainer}>
      <ReceptionistSidebar
        active={active}
        onNavigate={handleNavigate}
        onLogout={() => {
          logout();
          navigate(ROUTES.AUTH.LOGIN);
        }}
      />
      <div style={mainContentWrapper}>
        <ReceptionistTopbar receptionistName={user?.first_name || "Receptionist"} />
        <main style={contentViewport}>
          {children}
        </main>
      </div>
    </div>
  );
}

/* 🎨 STYLES */

const layoutContainer = {
  display: "flex",
  minHeight: "100vh",
  background: "var(--slate-50)",
};

const mainContentWrapper = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden"
};

const contentViewport = {
  flex: 1,
  padding: "2.5rem 3rem",
  overflowY: "auto",
  background: "var(--slate-50)"
};

export default ReceptionistLayout;
