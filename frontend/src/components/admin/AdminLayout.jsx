import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

/**
 * AdminLayout Component
 * 
 * The standard structural wrapper for all Admin portal pages.
 * Features a persistent sidebar and topbar, providing a consistent 
 * navigation experience across management modules.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render within the layout.
 */
function AdminLayout({ children }) {
  return (
    <div style={layoutContainer}>
      <AdminSidebar />

      <div style={mainViewport}>
        <AdminTopbar />
        <main style={contentArea}>{children}</main>
      </div>
    </div>
  );
}

/* styles */

const layoutContainer = {
  display: "flex",
  minHeight: "100vh",
  background: "var(--slate-50)",
};

const mainViewport = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden", // Keeps the sidebar and topbar fixed
};

const contentArea = {
  flex: 1,
  padding: "2.5rem",
  overflowY: "auto", // Allows the specific page content to scroll
  background: "var(--slate-50)",
};

export default AdminLayout;