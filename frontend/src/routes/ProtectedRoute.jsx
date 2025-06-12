import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ROUTES from "../config/routes";

/**
 * Maps each user role to their respective dashboard home route.
 */
const ROLE_DASHBOARDS = {
  ADMIN: ROUTES.ADMIN.DASHBOARD,
  CLIENT: ROUTES.CLIENT.DASHBOARD,
  RECEPTIONIST: ROUTES.RECEPTIONIST.DASHBOARD,
  VET: ROUTES.VET.DASHBOARD,
};

/**
 * ProtectedRoute Component
 * 
 * A wrapper component for routes that require authentication and specific role authorization.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized.
 * @param {string[]} [props.allowedRoles] - List of roles permitted to access this route.
 * 
 * Logic Flow:
 * 1. While auth state is initializing (authLoading), returns null to prevent layout shifts.
 * 2. If no valid token is found, redirects to Login while preserving the attempted path.
 * 3. If a token exists but the user profile is missing, redirects to Login.
 * 4. If allowedRoles are specified and the user lacks the required role, redirects them
 *    to their own role-specific dashboard home.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { user, authLoading } = useContext(AuthContext);

  const token = localStorage.getItem("token");
  const hasValidToken = token && token !== "undefined" && token !== "null";

  // Prevent UI flickering while the AuthProvider is validating the session
  if (authLoading) {
    return (
      <div style={loaderContainer}>
        <div style={spinnerStyle}></div>
      </div>
    );
  }

  // Session check: No token means no access
  if (!hasValidToken) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // Integrity check: Token exists but user profile failed to hydrate
  if (!user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // Authorization check: Role-Based Access Control (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role_name || user.role || "").toUpperCase();
    console.log("[ProtectedRoute] Path:", location.pathname, "Role:", userRole, "Allowed:", allowedRoles);

    if (!userRole || !allowedRoles.includes(userRole)) {
      const homePath = ROLE_DASHBOARDS[userRole] || ROUTES.AUTH.LOGIN;
      console.warn(`[Auth] Access denied for role: ${userRole}. Redirecting to ${homePath}`);
      return <Navigate to={homePath} replace />;
    }
  }

  return children;
}

const loaderContainer = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f8fafc"
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #6B8F71",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

// Note: Ensure the 'spin' keyframes are defined in index.css
/*
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/

export default ProtectedRoute;
