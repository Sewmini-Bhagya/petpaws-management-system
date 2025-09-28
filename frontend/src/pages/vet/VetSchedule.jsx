import { useEffect, useState, useMemo } from "react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiActivity,
  FiArrowRight,
  FiAlertCircle,
  FiSearch,
  FiHeart
} from "react-icons/fi";
import API from "../../api/axios";
import VetLayout from "../../components/vet/VetLayout";

/**
 * VetSchedule Component
 */
function VetSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await API.get("/vet/schedule");
        setSchedule(res.data || []);
      } catch (err) {
        console.error("[Clinical] Schedule fetch error:", err);
        setError("Clinical timeline synchronization failed.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const groupedSchedule = useMemo(() => {
    const groups = {};
    schedule.forEach(item => {
      const date = new Date(item.appointment_start).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups);
  }, [schedule]);

  return (
    <VetLayout active="schedule">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Clinical Roster</h1>
          <p style={subtitleStyle}>Analyze upcoming patient encounters and clinical availability.</p>
        </div>
        <div style={statusBadge}>
          <FiCalendar />
          <span>{schedule.length} Total Encounters</span>
        </div>
      </header>

      <div style={timelineContainer}>
        {isLoading ? (
          <div style={loaderStyle}>Synchronizing clinical roster...</div>
        ) : error ? (
          <div style={errorBanner}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        ) : schedule.length === 0 ? (
          <div style={emptyState}>
            <FiSearch size={48} color="var(--slate-200)" />
            <p>Your clinical roster is currently clear.</p>
          </div>
        ) : (
          <div style={timelineGrid}>
            {groupedSchedule.map(([date, items]) => (
              <section key={date} style={dateSection}>
                <div style={dateHeader}>
                  <div style={dateMarker} />
                  <h3 style={dateTitle}>{date}</h3>
                  <span style={dateCount}>{items.length} Rounds</span>
                </div>

                <div style={itemsList}>
                  {items.map((s) => (
                    <div key={s.appointment_id} style={scheduleCard}>
                      <div style={timeCol}>
                        <FiClock style={timeIcon} />
                        <span style={timeText}>
                          {new Date(s.appointment_start).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </span>
                      </div>

                      <div style={patientCol}>
                        <div style={patientInfo}>
                          <span style={petName}>{s.pet_name}</span>
                          <span style={ownerName}><FiUser /> {s.client_name?.trim() || s.client_email || "N/A"}</span>
                        </div>
                      </div>

                      <div style={serviceCol}>
                        <div style={serviceBadge}>
                          <FiActivity />
                          <span>{s.services || "General Consultation"}</span>
                        </div>
                      </div>

                      <div style={actionCol}>
                        <button style={viewBtn}>
                          Prep <FiArrowRight />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </VetLayout>
  );
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

const statusBadge = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1.25rem",
  background: "white",
  border: "1px solid var(--slate-100)",
  borderRadius: "16px",
  color: "var(--slate-500)",
  fontWeight: "700",
  fontSize: "0.9rem"
};

const timelineContainer = {
  minHeight: "400px"
};

const timelineGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "4rem"
};

const dateSection = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const dateHeader = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  padding: "0 1rem"
};

const dateMarker = {
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  background: "var(--primary-green)",
  border: "4px solid rgba(107, 143, 113, 0.2)"
};

const dateTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const dateCount = {
  fontSize: "0.8rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const itemsList = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const scheduleCard = {
  background: "white",
  borderRadius: "24px",
  padding: "1.5rem 2rem",
  border: "1px solid var(--slate-100)",
  display: "grid",
  gridTemplateColumns: "140px 1fr 240px 120px",
  alignItems: "center",
  gap: "2rem",
  transition: "all 0.2s",
  cursor: "pointer",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
};

const timeCol = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "var(--slate-900)",
  fontWeight: "800"
};

const timeIcon = {
  color: "var(--slate-300)"
};

const timeText = {
  fontSize: "0.95rem"
};

const patientCol = {
  display: "flex",
  alignItems: "center"
};

const patientInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem"
};

const petName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const ownerName = {
  fontSize: "0.85rem",
  color: "var(--slate-400)",
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontWeight: "600"
};

const serviceCol = {
  display: "flex",
  justifyContent: "flex-start"
};

const serviceBadge = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  padding: "0.5rem 1rem",
  background: "var(--slate-50)",
  color: "var(--slate-600)",
  borderRadius: "12px",
  fontSize: "0.85rem",
  fontWeight: "700"
};

const actionCol = {
  display: "flex",
  justifyContent: "flex-end"
};

const viewBtn = {
  padding: "0.6rem 1rem",
  background: "transparent",
  color: "var(--slate-400)",
  border: "1px solid var(--slate-100)",
  borderRadius: "12px",
  fontSize: "0.85rem",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  transition: "all 0.2s"
};

const loaderStyle = {
  textAlign: "center",
  padding: "6rem",
  color: "var(--slate-400)"
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

export default VetSchedule;
