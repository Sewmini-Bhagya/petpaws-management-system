function VetDashboard() {
  return (
    <div style={container}>

      {/* TOP BAR */}
      <div style={topbar}>
        <h2 style={logo}>Pet Paws 🐾</h2>

        <div style={topIcons}>
          <div style={iconCircle}>🔔</div>

          <div style={profileWrap}>
            <div style={iconCircle}>👤</div>
            <span style={roleText}>Dr. Perera</span>
          </div>
        </div>
      </div>

      <div style={main}>

        {/* SIDEBAR */}
        <div style={sidebar}>
          <p style={navItem}>Home</p>
          <p style={navItem}>Appointments</p>
          <p style={navItem}>Medical Records</p>
          <p style={navItem}>Prescriptions</p>

          <p style={logout}>Logout</p>
        </div>

        {/* CONTENT */}
        <div style={content}>

          <h1 style={title}>Today's Schedule</h1>

          <div style={grid}>

            {/* LEFT */}
            <div>

              {/* APPOINTMENTS */}
              <div style={card}>
                <h3>Appointments</h3>

        
                <div style={appointmentItem}>
                  No appointments yet
                </div>
              </div>

              </div>

          </div>

        </div>
      </div>
    </div>
  );
}

/* STYLE */

const container = {
  minHeight: "100vh",
  background: "#F7F9F7"
};

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
  fontWeight: "bold"
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

const profileWrap = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem"
};

const main = {
  display: "flex"
};

const sidebar = {
  width: "220px",
  minHeight: "calc(100vh - 70px)",
  background: "#A7C1A8",
  padding: "2rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};

const navItem = {
  marginBottom: "1.5rem",
  cursor: "pointer"
};

const logout = {
  marginTop: "auto",
  cursor: "pointer"
};

const content = {
  flex: 1,
  padding: "2rem"
};

const roleText = {
  color: "rgba(255,255,255,0.85)",
  fontSize: "0.95rem"
};

const title = {
  fontSize: "2.2rem",
  marginBottom: "1.5rem"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "1.5rem"
};

const card = {
  background: "#fff",
  padding: "1.2rem",
  borderRadius: "14px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  marginBottom: "1.2rem"
};

const appointmentItem = {
  padding: "0.6rem",
  borderBottom: "1px solid #eee"
};

const alertCard = {
  background: "#ffe5e5",
  color: "#b30000",
  padding: "1rem",
  borderRadius: "12px",
  marginBottom: "1rem",
  fontWeight: "bold",
  textAlign: "center"
};

const input = {
  width: "100%",
  padding: "0.6rem",
  marginTop: "0.5rem",
  marginBottom: "0.5rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const btnFull = {
  width: "100%",
  padding: "0.6rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const smallText = {
  fontSize: "0.8rem",
  color: "#888",
  marginTop: "0.5rem"
};

export default VetDashboard;