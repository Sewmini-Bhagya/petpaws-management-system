import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { FiCalendar, FiCreditCard, FiActivity, FiPlus, FiStar } from "react-icons/fi";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";
import ROUTES from "../../config/routes";
import { AuthContext } from "../../context/AuthContext";

/**
 * ClientDashboard Component
 */
function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState({
    petCount: 0,
    upcomingAppointments: 0,
    pendingPayments: 0,
    queuePosition: null
  }); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashRes = await API.get("/client/dashboard");
        setDashboard(dashRes.data);
      } catch (err) {
        console.error("[Dashboard] Load failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <ClientLayout active="dashboard">
      <header style={headerSection}>
        <div style={greetingGroup}>
          <h1 style={titleStyle}>Good day, {user?.name?.split(' ')[0] || "Pet Parent"} 👋</h1>
          <p style={subtitleStyle}>Everything is set for your pets today. Check your schedule below.</p>
        </div>
        <div style={quickActions}>
          <button style={primaryBtn} onClick={() => navigate(ROUTES.CLIENT.BOOK_APPOINTMENT)}>
            <FiCalendar /> Book Appointment
          </button>
          <button style={secondaryBtn} onClick={() => navigate(ROUTES.CLIENT.ADD_PET)}>
            <FiPlus /> Register Pet
          </button>
        </div>
      </header>

      {/* STATS GRID */}
      <div style={statsGrid}>
        <div style={statCard}>
          <div style={{ ...iconCircle, background: "#E0F2FE", color: "#0369A1" }}>
            <FiActivity size={24} />
          </div>
          <div style={statInfo}>
            <span style={statLabel}>Queue Position</span>
            <span style={statValue}>{dashboard.queuePosition || "None"}</span>
          </div>
        </div>

        <div style={statCard}>
          <div style={{ ...iconCircle, background: "#DCFCE7", color: "#166534" }}>
            <FiCalendar size={24} />
          </div>
          <div style={statInfo}>
            <span style={statLabel}>Upcoming Visits</span>
            <span style={statValue}>{dashboard.upcomingAppointments}</span>
          </div>
        </div>

        <div style={statCard}>
          <div style={{ ...iconCircle, background: "#FEE2E2", color: "#991B1B" }}>
            <FiCreditCard size={24} />
          </div>
          <div style={statInfo}>
            <span style={statLabel}>Pending Dues</span>
            <span style={statValue}>{dashboard.pendingPayments > 0 ? `Rs. ${dashboard.pendingPayments}` : "Cleared"}</span>
          </div>
        </div>

        <div style={statCard} onClick={() => navigate(ROUTES.CLIENT.CARE_HUB)} role="button">
          <div style={{ ...iconCircle, background: "#FEF3C7", color: "#92400E" }}>
            <FiStar size={24} />
          </div>
          <div style={statInfo}>
            <span style={statLabel}>Care Hub</span>
            <span style={statValue}>Health Tips</span>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY / PROMO SECTION */}
      <div style={promoBanner}>
        <div style={promoContent}>
          <h2 style={promoTitle}>Premium Pet Insurance</h2>
          <p style={promoText}>Get up to 80% coverage for medical emergencies and routine checkups. Protecting your furry friends has never been easier.</p>
          <button style={promoBtn}>Learn More</button>
        </div>
        <div style={promoImageOverlay}></div>
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const headerSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "3rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const subtitleStyle = {
  color: "var(--slate-500)",
  fontSize: "1.1rem"
};

const greetingGroup = {
  display: "flex",
  flexDirection: "column"
};

const quickActions = {
  display: "flex",
  gap: "1rem"
};

const primaryBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  padding: "0.9rem 1.5rem",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.2)",
  transition: "transform 0.2s"
};

const secondaryBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "white",
  color: "var(--slate-900)",
  border: "1px solid var(--slate-200)",
  padding: "0.9rem 1.5rem",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  transition: "all 0.2s"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "1.5rem",
  marginBottom: "3rem"
};

const statCard = {
  background: "white",
  padding: "1.5rem",
  borderRadius: "24px",
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
  border: "1px solid var(--slate-100)",
  cursor: "pointer",
  transition: "transform 0.2s"
};

const iconCircle = {
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const statInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem"
};

const statLabel = {
  fontSize: "0.85rem",
  color: "var(--slate-500)",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.02em"
};

const statValue = {
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const promoBanner = {
  background: "linear-gradient(135deg, var(--primary-green) 0%, #4D6D52 100%)",
  borderRadius: "32px",
  padding: "4rem",
  position: "relative",
  overflow: "hidden",
  color: "white"
};

const promoContent = {
  position: "relative",
  zIndex: 2,
  maxWidth: "500px"
};

const promoTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.25rem",
  fontWeight: "800",
  marginBottom: "1rem"
};

const promoText = {
  fontSize: "1.1rem",
  opacity: "0.9",
  lineHeight: "1.6",
  marginBottom: "2rem"
};

const promoBtn = {
  background: "white",
  color: "var(--primary-green)",
  border: "none",
  padding: "1rem 2rem",
  borderRadius: "14px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 10px 15px rgba(0,0,0,0.1)"
};

const promoImageOverlay = {
  position: "absolute",
  right: "0",
  top: "0",
  bottom: "0",
  width: "40%",
  background: "url('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1000') center/cover",
  opacity: "0.2",
  maskImage: "linear-gradient(to left, black, transparent)"
};

export default ClientDashboard;