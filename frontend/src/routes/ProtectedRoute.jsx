import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  // not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // wrong role
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;