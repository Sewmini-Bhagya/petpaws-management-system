import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiUser,
  FiClock,
  FiActivity,
  FiFileText,
  FiArrowRight,
  FiAlertCircle,
  FiSearch,
  FiExternalLink
} from "react-icons/fi";
import API from "../../api/axios";
import VetLayout from "../../components/vet/VetLayout";
import ROUTES from "../../config/routes";

/**
 * VetAppointments Component
 */
function VetAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await API.get("/vet/appointments");
        setAppointments(res.data || []);
      } catch (err) {
        console.error("[Clinical] Appointments fetch error:", err);
        setError("Clinical data link failed. Synchronizing...");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <VetLayout active="appointments">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Assigned Rounds</h1>
          <p style={subtitleStyle}>Manage your clinical workload and patient care transitions.</p>
        </div>
        <div style={countBadge}>
          <FiCalendar />
          <span>{appointments.length} Active Rounds</span>
        </div>
      </header>

      <div style={appointmentsFeed}>
        {isLoading ? (
          <div style={loaderStyle}>Synchronizing clinical records...</div>
        ) : error ? (
          <div style={errorBanner}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        ) : appointments.length === 0 ? (
          <div style={emptyState}>
            <FiSearch size={48} color="var(--slate-200)" />
            <p>No patients are currently assigned to your clinical rounds.</p>
          </div>
        ) : (
          <div style={appointmentsGrid}>
            {appointments.map((a) => (
              <div key={a.appointment_id} style={appointmentCard}>
                <div style={cardHeader}>
                  <div style={petProfile}>
                    <div style={avatarBox}><FiHeart /></div>
                    <div style={petMeta}>
                      <h3 style={petName}>{a.pet_name}</h3>
                      <span style={clientName}><FiUser /> {a.client_name?.trim() || a.client_email}</span>
                    </div>
                  </div>
                  <div style={statusBadge}>
                    {a.status || "Assigned"}
                  </div>
                </div>

                <div style={cardBody}>
                  <div style={infoRow}>
                    <div style={infoItem}>
                      <FiClock />
                      <div style={infoContent}>
                        <span style={infoLabel}>Scheduled Time</span>
                        <span style={infoValue}>{new Date(a.appointment_start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                    <div style={infoItem}>
                      <FiActivity />
                      <div style={infoContent}>
                        <span style={infoLabel}>Clinical Service</span>
                        <span style={infoValue}>{a.services || "General Consultation"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={cardFooter}>
                  <button
                    style={secondaryBtn}
                    onClick={() => navigate(`${ROUTES.VET.HISTORY}?pet_id=${a.pet_id}`)}
                  >
                    <FiFileText /> Medical Archives
                  </button>
                  <button
                    style={primaryBtn}
                    onClick={() => navigate(`${ROUTES.VET.DIAGNOSIS}?pet_id=${a.pet_id}&appointment_id=${a.appointment_id}`)}
                  >
                    Start Protocol <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VetLayout>
  );
}

function FiHeart(props) {
  return <FiActivity {...props} />; // Patient icon fallback
}

/* 🎨 STYLES */

const headerWrapper = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "3.5rem"
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

const countBadge = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1.25rem",
  background: "white",
  border: "1px solid var(--slate-100)",
  borderRadius: "16px",
  color: "var(--slate-500)",
  fontWeight: "700",
  fontSize: "0.9rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
};

const appointmentsFeed = {
  minHeight: "400px"
};

const appointmentsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
  gap: "2rem"
};

const appointmentCard = {
  background: "white",
  borderRadius: "32px",
  padding: "2rem",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.03)",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  transition: "all 0.2s"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
};

const petProfile = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem"
};

const avatarBox = {
  width: "56px",
  height: "56px",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem"
};

const petMeta = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem"
};

const petName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.35rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const clientName = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
  color: "var(--slate-400)",
  fontWeight: "600"
};

const statusBadge = {
  background: "var(--slate-50)",
  color: "var(--slate-500)",
  padding: "0.4rem 0.8rem",
  borderRadius: "10px",
  fontSize: "0.75rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const cardBody = {
  padding: "1.5rem",
  background: "var(--slate-50)",
  borderRadius: "24px"
};

const infoRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem"
};

const infoItem = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "flex-start",
  color: "var(--slate-400)"
};

const infoContent = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem"
};

const infoLabel = {
  fontSize: "0.7rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const infoValue = {
  fontSize: "0.9rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const cardFooter = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr",
  gap: "1rem"
};

const primaryBtn = {
  padding: "1rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "0.95rem",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  transition: "all 0.2s"
};

const secondaryBtn = {
  ...primaryBtn,
  background: "white",
  color: "var(--slate-600)",
  border: "1px solid var(--slate-100)"
};

const loaderStyle = {
  textAlign: "center",
  padding: "6rem",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

const errorBanner = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.5rem",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444",
  borderRadius: "20px",
  fontWeight: "700"
};

const emptyState = {
  textAlign: "center",
  padding: "8rem 2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  color: "var(--slate-400)"
};

export default VetAppointments;
