import { useNavigate } from "react-router-dom";
import { FaPaw } from "react-icons/fa";
import ROUTES from "../config/routes";

/**
 * Navbar Component
 * 
 * Global navigation bar for public-facing pages.
 */
function Navbar() {
  const navigate = useNavigate();

  return (
    <div style={navbarStyle}>
      <div style={logoStyle} onClick={() => navigate(ROUTES.HOME)}>
        Pet Paws <FaPaw size={32} style={{ marginBottom: "-4px" }} />
      </div>

      <div style={navLinksStyle}>
        <button style={linkBtn} onClick={() => navigate(ROUTES.HOME)}>Home</button>
        <button style={linkBtn} onClick={() => navigate(ROUTES.PUBLIC.ABOUT)}>About</button>
        <button style={linkBtn} onClick={() => navigate(ROUTES.PUBLIC.SERVICES)}>Services</button>
        <button style={linkBtn} onClick={() => navigate(ROUTES.PUBLIC.CONTACT)}>Contact</button>
        
        <button style={loginBtn} onClick={() => navigate(ROUTES.AUTH.LOGIN)}>
          Login
        </button>

        <button style={signupBtn} onClick={() => navigate(ROUTES.AUTH.SIGNUP)}>
          Signup
        </button>
      </div>
    </div>
  );
}

const navbarStyle = {
  background: "var(--primary-green)",
  color: "white",
  padding: "1.5rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};

const logoStyle = {
  fontSize: "2rem",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem"
};

const navLinksStyle = {
  display: "flex",
  gap: "1.2rem",
  alignItems: "center"
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "1rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "opacity 0.2s",
  ":hover": { opacity: 0.8 }
};

const loginBtn = {
  background: "#fff",
  color: "var(--primary-green)",
  border: "none",
  padding: "0.6rem 1.2rem",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  marginLeft: "0.5rem"
};

const signupBtn = {
  background: "rgba(255,255,255,0.2)",
  color: "white",
  border: "1px solid white",
  padding: "0.6rem 1.2rem",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer"
};

export default Navbar;
