function ReceptionistDashboard() {
  return (
    <div style={container}>

      {/* TOP BAR SAME AS OTHERS */}
      <div style={topbar}>
        <h2 style={logo}>Pet Paws 🐾</h2>

        <div style={topIcons}>
          <div style={iconCircle}>🔔</div>

          <div style={profileWrap}>
            <div style={iconCircle}>👤</div>
            <span style={roleText}>Receptionist</span>
          </div>
        </div>
      </div>

      <div style={main}>

        {/* SIDEBAR */}
        <div style={sidebar}>
          <p style={navItem}>Home</p>
          <p style={navItem}>Appointments</p>
          <p style={navItem}>Clients</p>
          <p style={navItem}>Payments</p>
          <p style={navItem}>Invoices</p>

          <p style={logout}>Logout</p>
        </div>

        {/* CONTENT */}
        <div style={content}>

          {/* SEARCH */}
          <div style={searchBox}>
            <input
              placeholder="Search by pet name, client name, or phone..."
              style={searchInput}
            />
          </div>

          <div style={grid}>

            {/* LEFT SIDE */}
            <div>

              {/* SEARCH RESULTS */}
              <div style={card}>
                <h3>Client / Pet Results</h3>
                <p>No results yet</p>
              </div>

              {/* APPOINTMENT QUEUE */}
              <div style={card}>
                <div style={rowBetween}>
                  <h3>Today’s Queue</h3>
                  <button style={dangerBtn}>Override</button>
                </div>

                <div style={queueItem}>Position 1</div>
                <div style={queueItem}>Position 2</div>
                <div style={queueItem}>Position 3</div>
              </div>

            </div>

            {/* RIGHT SIDE */}
            <div>

              {/* PAYMENTS */}
              <div style={card}>
                <h3>Payments</h3>
                <p>No payments recorded</p>

                <button style={btn}>Record Payment</button>
              </div>

              {/* INVOICES */}
              <div style={card}>
                <h3>Recent Invoices</h3>
                <p>No invoices yet</p>
              </div>

              {/* QUICK ACTIONS */}
              <div style={card}>
                <h3>Quick Actions</h3>

                <button style={btnFull}>Add Appointment</button>
                <button style={btnFull}>Apply Discount</button>
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

const grid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "1.5rem"
};

const searchBox = {
  marginBottom: "1.5rem"
};

const searchInput = {
  width: "100%",
  padding: "0.8rem",
  borderRadius: "10px",
  border: "1px solid #ccc"
};

const card = {
  background: "#fff",
  padding: "1.2rem",
  borderRadius: "14px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  marginBottom: "1.2rem"
};

const queueItem = {
  padding: "0.6rem",
  borderBottom: "1px solid #eee"
};

const rowBetween = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const btn = {
  marginTop: "0.8rem",
  padding: "0.5rem 1rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const btnFull = {
  ...btn,
  width: "100%",
  marginTop: "0.5rem"
};

const dangerBtn = {
  padding: "0.4rem 0.8rem",
  background: "#d9534f",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const roleText = {
  color: "rgba(255,255,255,0.85)",
  fontSize: "0.95rem"
};

export default ReceptionistDashboard;