import {
  FiActivity,
  FiClock,
  FiShield,
  FiMapPin,
  FiChevronLeft,
  FiAlertTriangle,
  FiHeart
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";
import ROUTES from "../../config/routes";

/**
 * MedicalHistory Component
 */
function MedicalHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await API.get(`/pets/${id}/history`);
        const data = res.data;
        setPet(data.pet);

        // Combine and sort events
        const events = [
          ...data.past_appointments.map(a => ({ ...a, event_type: "Consultation", date: a.appointment_start })),
          ...data.diagnoses.map(d => ({ ...d, event_type: "Diagnosis", date: d.diagnosed_at })),
          ...data.prescriptions.map(p => ({ ...p, event_type: "Prescription", date: p.prescribed_at })),
          ...data.vaccinations.map(v => ({ ...v, event_type: "Vaccination", date: v.vaccination_date }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setHistory(events);
      } catch (err) {
        console.error("[Clinical] History fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  return (
    <ClientLayout active="pets">
      <div style={viewportContainer}>
        <header style={headerWrapper}>
          <button style={backBtn} onClick={() => navigate(ROUTES.CLIENT.PETS)}>
            <FiChevronLeft /> Patient Registry
          </button>
          <div style={titleGroup}>
            <h1 style={titleStyle}>{pet ? `${pet.pet_name}'s ` : ""}Clinical Timeline</h1>
            <p style={subtitleStyle}>A chronological ledger of patient encounters and medical milestones.</p>
          </div>
        </header>

        {pet?.allergies && (
          <div style={allergyAlert}>
            <div style={alertIcon}><FiAlertTriangle /></div>
            <div style={alertContent}>
              <span style={alertTitle}>Critical Allergy Protocol</span>
              <span style={alertValue}>{pet.allergies}</span>
            </div>
          </div>
        )}

        <div style={timelineWrapper}>
          {history.length === 0 ? (
            <div style={emptyState}>
              <FiActivity size={48} color="var(--slate-100)" />
              <p>No clinical encounters have been recorded for this patient.</p>
            </div>
          ) : (
            <div style={timelineFeed}>
              {history.map((event, idx) => (
                <div key={idx} style={timelineCard}>
                  <div style={dateCol}>
                    <FiClock style={dateIcon} />
                    <span style={dateText}>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div style={contentCol}>
                    <div style={typeBadge}>
                      {event.event_type}
                    </div>
                    <h3 style={eventNote}>{event.diagnosis || event.medication_name || event.vaccine_name || event.services || "Clinical Event"}</h3>
                    <div style={facilityInfo}>
                      <FiActivity /> {event.notes || event.dosage || "Standard Protocol"}
                    </div>
                  </div>

                  <div style={securityCol}>
                    <FiShield title="Verified Clinical Record" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const viewportContainer = {
  padding: "4rem",
  maxWidth: "1000px",
  margin: "0 auto"
};

const headerWrapper = {
  marginBottom: "4rem"
};

const backBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "transparent",
  border: "none",
  color: "var(--slate-500)",
  fontSize: "0.9rem",
  fontWeight: "700",
  cursor: "pointer",
  marginBottom: "1.5rem",
  padding: 0
};

const titleGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "3rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  letterSpacing: "-0.02em"
};

const subtitleStyle = {
  color: "var(--slate-500)",
  fontSize: "1.1rem",
  fontWeight: "500"
};

const timelineWrapper = {
  position: "relative",
  paddingLeft: "2rem",
  borderLeft: "2px dashed var(--slate-100)",
  marginTop: "2rem"
};

const allergyAlert = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  background: "#EF4444",
  color: "white",
  padding: "1.5rem 2rem",
  borderRadius: "24px",
  boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.2)",
  marginBottom: "3rem"
};

const alertIcon = {
  fontSize: "2rem",
  display: "flex"
};

const alertContent = {
  display: "flex",
  flexDirection: "column"
};

const alertTitle = {
  fontSize: "0.8rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  opacity: 0.9
};

const alertValue = {
  fontSize: "1.5rem",
  fontWeight: "900",
  fontFamily: "'Outfit', sans-serif"
};

const timelineFeed = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
};

const timelineCard = {
  background: "white",
  padding: "2rem",
  borderRadius: "28px",
  border: "1px solid var(--slate-100)",
  display: "grid",
  gridTemplateColumns: "160px 1fr 40px",
  alignItems: "center",
  gap: "2rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.02)",
  position: "relative"
};

const dateCol = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "var(--slate-400)",
  fontWeight: "600"
};

const dateIcon = {
  fontSize: "1.1rem"
};

const dateText = {
  fontSize: "0.9rem"
};

const contentCol = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const typeBadge = {
  alignSelf: "flex-start",
  padding: "0.4rem 0.8rem",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "10px",
  fontSize: "0.75rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const eventNote = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const facilityInfo = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.85rem",
  color: "var(--slate-400)",
  fontWeight: "600"
};

const securityCol = {
  display: "flex",
  justifyContent: "flex-end",
  color: "var(--slate-200)",
  fontSize: "1.25rem"
};

const emptyState = {
  textAlign: "center",
  padding: "4rem",
  color: "var(--slate-300)"
};

export default MedicalHistory;

