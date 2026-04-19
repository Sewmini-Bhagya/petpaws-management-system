import { FiBell, FiUser } from "react-icons/fi";

function AdminTopbar() {
  return (
    <div style={topbar}>
      <h2 style={logo}>Pet Paws 🐾</h2>

      <div style={topIcons}>
        <div style={iconCircle}>
          <FiBell color="white" />
        </div>

        <div style={profileWrap}>
          <div style={iconAdmin}>
            <FiUser color="white" />
            <span style={adminText}>Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* styles */

const topbar = {
  height: "70px",
  background: "#6B8F71",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 2rem",
  color: "white"
};

const logo = {
  fontWeight: "bold",
  fontSize: "1.8rem"
};

const topIcons = {
  display: "flex",
  gap: "1rem",
  alignItems: "center"
};

const iconCircle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};
const iconAdmin = { 
  width: "90px", 
  height: "40px", 
  borderRadius: "10px", 
  background: "rgba(255,255,255,0.2)", 
  display: "flex", alignItems: "center", 
  justifyContent: "center", 
  cursor: "pointer",
  gap: "0.5rem"
};

const profileWrap = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem"
};

const adminText = {
  fontWeight: "500"
};

export default AdminTopbar;