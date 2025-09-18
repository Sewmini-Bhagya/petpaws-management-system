import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiActivity,
  FiClock,
  FiUser,
  FiHeart,
  FiArrowRight,
  FiAlertCircle,
  FiClipboard,
  FiZap
} from "react-icons/fi";
import API from "../../api/axios";
import VetLayout from "../../components/vet/VetLayout";

/**
 * VetDashboard Component
 * 
 * The clinical nerve center for veterinary staff.
 * Provides a high-fidelity overview of the daily patient rounds,
 * critical triage metrics, and real-time appointment synchronization.
 */
function VetDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await API.get("/vet/dashboard");
        setAppointments(res.data?.todayAppointments || []);
      } catch (err) {
        console.error("[Dashboard] synchronization failed:", err);
        setError("Clinical data link failed. Synchronizing...");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = useMemo(() => [
    { label: "Active Rounds", value: appointments.length, icon: <FiCalendar />, color: "var(--primary-green)" },
    { label: "Pending Diagnosis", value: appointments.filter(a => !a.status_id || a.status_id < 3).length, icon: <FiActivity />, color: "#F59E0B" },
    { label: "Critical Priority", value: appointments.filter(a => a.is_emergency).length, icon: <FiZap />, color: "#EF4444" },
    { label: "Completed Today", value: appointments.filter(a => a.status_id === 4).length, icon: <FiCheckCircle />, color: "var(--slate-900)" }
  ], [appointments]);

  const mappedAppointments = useMemo(
    () =>
      appointments.map((item) => ({
        id: item.appointment_id,
        pet: item.pet_name,
        owner: item.client_name?.trim() || item.client_email || "Unregistered Owner",
        time: formatTime(item.appointment_start),
        service: item.services || "General Consultation",
        status: item.status || item.status_name || "Scheduled",
        isEmergency: !!item.is_emergency
      })),
    [appointments]
  );

  return (
    <VetLayout active="dashboard">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Clinical Control Center</h1>
          <p style={subtitleStyle}>Orchestrate today&apos;s rounds and manage patient care protocols.</p>
        </div>
      </header>

      {/* STATS STRIP */}
      <section style={statsStrip}>
        {stats.map((stat, idx) => (
          <div key={idx} style={statCard}>
            <div style={{ ...statIcon, color: stat.color, background: `${stat.color}15` }}>
              {stat.icon}
            </div>
            <div style={statMeta}>
              <span style={statLabel}>{stat.label}</span>
              <span style={statValue}>{stat.value}</span>
            </div>
          </div>
        ))}
      </section>

      <div style={dashboardGrid}>
        {/* ACTIVE ROUNDS */}
        <section style={roundsPanel}>
          <div style={panelHeader}>
            <h3 style={panelTitle}><FiActivity /> Active Rounds</h3>
            <span style={countBadge}>{appointments.length} Scheduled</span>
          </div>

          <div style={roundsList}>
            {isLoading ? (
              <div style={loaderStyle}>Synchronizing clinical feed...</div>
            ) : error ? (
              <div style={errorBanner}>
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            ) : mappedAppointments.length === 0 ? (
              <div style={emptyState}>
                <FiClipboard size={48} color="var(--slate-100)" />
                <p>No patients are currently assigned to your rounds today.</p>
              </div>
            ) : (
              mappedAppointments.map((a) => (
                <div key={a.id} style={{
                  ...appointmentCard,
                  borderColor: a.isEmergency ? "rgba(239, 68, 68, 0.2)" : "var(--slate-100)",
                  background: a.isEmergency ? "rgba(239, 68, 68, 0.02)" : "white"
                }}>
                  <div style={cardHeader}>
                    <div style={idTag}>REF-{a.id}</div>
                    <div style={{
                      ...statusBadge,
                      color: a.isEmergency ? "#EF4444" : "var(--primary-green)",
                      background: a.isEmergency ? "rgba(239, 68, 68, 0.1)" : "rgba(107, 143, 113, 0.1)"
                    }}>
                      {a.isEmergency && <FiZap style={{ marginRight: '4px' }} />}
                      {a.status}
                    </div>
                  </div>

                  <div style={cardBody}>
                    <div style={primaryInfo}>
                      <span style={petName}>{a.pet}</span>
                      <span style={ownerName}>{a.owner}</span>
                    </div>

                    <div style={metaGrid}>
                      <div style={metaItem}>
                        <FiClock />
                        <span>{a.time}</span>
                      </div>
                      <div style={metaItem}>
                        <FiActivity />
                        <span>{a.service}</span>
                      </div>
                    </div>
                  </div>

                  <button style={actionBtn}>
                    Authorize Diagnosis <FiArrowRight />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CLINICAL NOTICES / TOOLS */}
        <aside style={toolsPanel}>
          <div style={panelHeader}>
            <h3 style={panelTitle}>Clinical Resources</h3>
          </div>
          <div style={resourceList}>
            <div style={resourceCard}>
              <FiHeart />
              <div>
                <h4 style={resourceName}>Pathology Link</h4>
                <p style={resourceDesc}>Access real-time laboratory results.</p>
              </div>
            </div>
            <div style={resourceCard}>
              <FiClipboard />
              <div>
                <h4 style={resourceName}>Pharma Registry</h4>
                <p style={resourceDesc}>Consult the medication database.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </VetLayout>
  );
}

/**
 * Standardizes time formatting for clinical precision.
 */
function formatTime(value) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid Time";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

function FiCheckCircle(props) {
  return <FiActivity {...props} />; // Fallback if missing
}

/* 🎨 STYLES */

const headerWrapper = {
  marginBottom: "3rem"
};

const titleGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const subtitleStyle = {
  color: "var(--slate-500)",
  fontSize: "1.1rem"
};

const statsStrip = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "1.5rem",
  marginBottom: "3.5rem"
};

const statCard = {
  background: "white",
  padding: "1.75rem",
  borderRadius: "24px",
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
};

const statIcon = {
  width: "52px",
  height: "52px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem"
};

const statMeta = {
  display: "flex",
  flexDirection: "column"
};

const statLabel = {
  fontSize: "0.8rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const statValue = {
  fontSize: "1.75rem",
  fontWeight: "900",
  color: "var(--slate-900)",
  fontFamily: "'Outfit', sans-serif"
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 340px",
  gap: "3rem",
  alignItems: "flex-start"
};

const roundsPanel = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
};

const panelHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const panelTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem"
};

const countBadge = {
  background: "var(--slate-100)",
  color: "var(--slate-500)",
  padding: "0.4rem 0.8rem",
  borderRadius: "999px",
  fontSize: "0.8rem",
  fontWeight: "800"
};

const roundsList = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "1.5rem"
};

const appointmentCard = {
  background: "white",
  borderRadius: "28px",
  padding: "1.75rem",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.03)",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  transition: "all 0.2s"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const idTag = {
  fontSize: "0.75rem",
  fontWeight: "900",
  color: "var(--slate-300)",
  letterSpacing: "0.05em"
};

const statusBadge = {
  fontSize: "0.75rem",
  fontWeight: "800",
  padding: "0.4rem 0.75rem",
  borderRadius: "10px",
  textTransform: "uppercase"
};

const cardBody = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem"
};

const primaryInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem"
};

const petName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.35rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const ownerName = {
  fontSize: "0.95rem",
  color: "var(--slate-500)",
  fontWeight: "600"
};

const metaGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem"
};

const metaItem = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  fontSize: "0.9rem",
  color: "var(--slate-600)",
  fontWeight: "600"
};

const actionBtn = {
  width: "100%",
  padding: "1rem",
  background: "var(--slate-50)",
  color: "var(--slate-900)",
  border: "none",
  borderRadius: "16px",
  fontSize: "0.9rem",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  transition: "all 0.2s"
};

const toolsPanel = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  background: "white",
  padding: "2rem",
  borderRadius: "32px",
  border: "1px solid var(--slate-100)",
  position: "sticky",
  top: "120px"
};

const resourceList = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem"
};

const resourceCard = {
  display: "flex",
  gap: "1.25rem",
  padding: "1.25rem",
  borderRadius: "20px",
  background: "var(--slate-50)",
  color: "var(--slate-900)",
  cursor: "pointer"
};

const resourceName = {
  fontSize: "0.95rem",
  fontWeight: "800",
  margin: 0
};

const resourceDesc = {
  fontSize: "0.8rem",
  color: "var(--slate-500)",
  margin: "0.2rem 0 0 0"
};

const loaderStyle = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "4rem",
  color: "var(--slate-400)"
};

const errorBanner = {
  gridColumn: "1 / -1",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444",
  borderRadius: "16px",
  fontWeight: "700"
};

const emptyState = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "6rem 2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  color: "var(--slate-400)"
};

export default VetDashboard;