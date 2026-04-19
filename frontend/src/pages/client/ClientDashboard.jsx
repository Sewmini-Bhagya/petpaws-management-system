import dogImg from "../../assets/dog.jpeg";
import { FiBell, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import API from "../../api/axios";

function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState({
    petCount: 0,
    upcomingAppointments: 0,
    pendingPayments: 0
  }); 

    useEffect(() => {
      const fetchData = async () => {
        try {
          const userRes = await API.get("/auth/me");
          setUser(userRes.data);

          const dashRes = await API.get("/client/dashboard");
          setDashboard(dashRes.data);

        } catch (err) {
          console.error(err);
        }
      };

      fetchData();
    }, []);

  return (
    <div style={container}>
      
      {/* TOP BAR */}
      <div style={topbar}>
        <div style={logo}>Pet Paws 🐾</div>

        <div style={iconGroup}>
          <div style={iconWrapper}>
            <FiBell style={{ color: "white" }} />
          </div>

          <div style={iconWrapper}>
            <FiUser style={{ color: "white" }} />
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={main}>
        
        {/* SIDEBAR */}
        <div style={sidebar}>
          <p style={navItem} onClick={() => navigate("/")}>Home</p>
          <p style={navItem} onClick={() => navigate("/pets")}>My Pets</p>
          <p style={navItem} onClick={() => navigate("/book")}>Appointments</p>
          <p style={navItem} onClick={() => navigate("/payments")}>Payments</p>

          <div style={{ marginTop: "auto" }}>
            <p style={navItem} onClick={() => { 
              localStorage.removeItem("token"); 
              navigate("/login");
              }}
            >Logout
            </p>
          </div>
        </div>

        {/* BODY */}
        <div style={body}>
          
          {/* HEADER */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h1>Welcome {user?.first_name || "..."}</h1>
            <p>
              Manage your pets, book appointments, and stay updated with their health.
            </p>
          </div>

          {/* CONTENT ROW */}
          <div style={contentRow}>
            
            {/* IMAGE */}
            <div style={imageContainer}>
              <img src={dogImg} alt="dog" style={dogImgStyle} />
            </div>

            {/* CARDS */}
            <div style={cardsGrid}>
              <div style={card}>
                <h3>Queue</h3>
                <p>Position: 1</p>
              </div>

              <div style={card}>
                <h3>Appointments</h3>
                <p>{dashboard.upcomingAppointments} upcoming</p>
              </div>

              <div style={card}>
                <h3>Payments</h3>
                <p>{dashboard.pendingPayments} pending</p>
              </div>

              <div
                style={card}
                onClick={() => navigate("/care-hub")}
              >
                <h3>Care Hub</h3>
                <p>Tips & guides</p>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div style={{ marginTop: "2rem" }}>
            <button style={actionBtn} onClick={() => navigate("/book")}>Book Appointment</button>
            <button style={actionBtn} onClick={() => navigate("/pets/add")}>Add Pet</button>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

/* STYLES */

const container = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  background: "#F7F9F7",
  color: "#1F2937"
};

const topbar = {
  height: "180px",
  background: "#6B8F71",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  padding: "1.5rem 2rem"
};

const iconGroup = {
  display: "flex",
  gap: "1.5rem",
  alignItems: "center"
};

const iconWrapper = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.15)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  transition: "0.2s"
};

const logo = {
  fontSize: "2rem",
  fontWeight: "bold"
};

const main = {
  display: "flex",
  flex: 1
};

const sidebar = {
  width: "220px",
  background: "#A7C4A0",
  padding: "2rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  fontSize: "1.1rem"
};

const navItem = {
  marginBottom: "1.8rem",
  cursor: "pointer"
};

const body = {
  flex: 1,
  padding: "2rem"
};

const contentRow = {
  display: "flex",
  gap: "2rem"
};

const imageContainer = {
  width: "280px"
};

const dogImgStyle = {
  width: "100%",
  borderRadius: "16px"
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
  flex: 1
};

const card = {
  background: "#fff",
  padding: "1.2rem",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const actionBtn = {
  background: "#6B8F71",
  color: "white",
  border: "none",
  padding: "0.9rem 1.5rem",
  borderRadius: "10px",
  marginRight: "1rem",
  cursor: "pointer"
};

export default ClientDashboard;