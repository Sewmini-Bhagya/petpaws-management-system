import { useNavigate } from "react-router-dom";
import { useState } from "react";

function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <div style={sidebar}>

      <div>
        <NavItem text="Home" onClick={() => navigate("/admin")} />
        <NavItem text="User Management" onClick={() => navigate("/um")} />
        <NavItem text="Profile Management" />
        <NavItem text="Inventory Management" onClick={() => navigate("/inventory")} />
        <NavItem text="Appointment Management" />
        <NavItem text="Services Management" />
        <NavItem text="Loyalty" />
      </div>

      <div style={{ marginTop: "auto", width: "25%", textAlign: "" }}>
        <NavItem text="Logout" isLogout />
      </div>

    </div>
  );
}

/* 🔥 SINGLE CLEAN NavItem */
function NavItem({ text, onClick, isLogout }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        ...navItem,
        background: hover
          ? isLogout
            ? "#bb6666"
            : "#6B8F71"
          : "rgba(255,255,255,0.2)",
        color: hover || isLogout ? "white" : "#1F2937",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {text}
    </div>
  );
}

/* styles */

const sidebar = {
  width: "240px",
  minHeight: "calc(100vh - 70px)",
  background: "#A7C1A8",
  padding: "2rem 1.5rem",
  display: "flex",
  flexDirection: "column"
};

const navItem = {
  width: "87%",
  padding: "0.8rem 1rem",
  borderRadius: "10px",
  marginBottom: "0.8rem",
  cursor: "pointer",
  transition: "0.2s ease",
  fontSize: "0.95rem"
};

export default AdminSidebar;