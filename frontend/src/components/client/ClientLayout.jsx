import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ClientSidebar from "./ClientSidebar";
import ClientTopbar from "./ClientTopbar";
import ROUTES from "../../config/routes";

/**
 * ClientLayout Component
 * 
 * Provides a standardized structural framework for the Client Portal.
 * Composes the Sidebar, Topbar, and a dynamic content area.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Sub-pages to render within the layout.
 * @param {string} props.active - Identifies the currently active navigation item.
 */
function ClientLayout({ children, active = "dashboard" }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleNavigate = (key) => {
    switch (key) {
      case "dashboard": return navigate(ROUTES.CLIENT.DASHBOARD);
      case "pets": return navigate(ROUTES.CLIENT.PETS);
      case "appointments": return navigate(ROUTES.CLIENT.BOOK_APPOINTMENT);
      case "shop": return navigate(ROUTES.CLIENT.SHOP);
      case "feedback": return navigate(ROUTES.CLIENT.FEEDBACK);
      case "notifications": return navigate(ROUTES.CLIENT.NOTIFICATIONS);
      default: return navigate(ROUTES.CLIENT.DASHBOARD);
    }
  };

  return (
    <div style={layoutWrapper}>
      <ClientSidebar
        active={active}
        onNavigate={handleNavigate}
        onLogout={() => {
          logout();
          navigate(ROUTES.AUTH.LOGIN);
        }}
      />
      <div style={mainContentArea}>
        <ClientTopbar />
        <main style={scrollableContent}>
          <div style={contentContainer}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* 🎨 LAYOUT STYLES */

const layoutWrapper = {
  display: "flex",
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  background: "var(--slate-50)",
  color: "var(--slate-900)",
  fontFamily: "'Inter', sans-serif"
};

const mainContentArea = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden"
};

const scrollableContent = {
  flex: 1,
  overflowY: "auto",
  padding: "2rem",
  scrollBehavior: "smooth"
};

const contentContainer = {
  maxWidth: "1400px",
  margin: "0 auto",
  width: "100%"
};

export default ClientLayout;
