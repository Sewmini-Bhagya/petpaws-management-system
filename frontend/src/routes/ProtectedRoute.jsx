import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Route guard.
 * - Requires an auth token (and ideally a loaded user).
 * - Optionally enforces role(s) using the loaded user.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { user, authLoading } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const hasValidToken = token && token !== "undefined" && token !== "null";

  // Wait until AuthProvider verifies token/user with backend.
  if (authLoading) {
    return null;
  }

  if (!hasValidToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role-gating is requested but user isn't loaded yet, block for now.
  // (AuthProvider will populate user on mount.)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role_name || user?.role; // support either shape
    if (!userRole) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
