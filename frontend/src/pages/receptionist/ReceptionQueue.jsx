import { useEffect, useState } from "react";
import {
  FiArrowUp,
  FiArrowDown,
  FiAlertCircle,
  FiUsers,
  FiActivity,
  FiZap,
  FiMoreVertical,
  FiShield
} from "react-icons/fi";
import API from "../../api/axios";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";

/**
 * ReceptionQueue Component
 */
function ReceptionQueue() {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadQueue = async () => {
    try {
      const res = await API.get("/reception/queue");
      setQueue(res.data || []);
    } catch (err) {
      console.error("[Queue] synchronization failed:", err);
      setError("Clinical synchronization failed. Checking uplink...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const move = async (from, to) => {
    if (to < 0 || to >= queue.length) return;
    const copy = [...queue];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setQueue(copy);

    try {
      await API.put("/reception/queue/reorder", {
        appointment_ids: copy.map((q) => q.appointment_id),
      });
      await loadQueue();
    } catch (err) {
      console.error("[Queue] reordering failed:", err);
      setError("Sequence synchronization failed.");
    }
  };

  const updatePriority = async (id, payload) => {
    try {
      await API.put(`/reception/queue/${id}/priority`, payload);
      await loadQueue();
    } catch (err) {
      console.error("[Queue] triage update failed:", err);
      setError("Triage authorization failed.");
    }
  };

  return (
    <ReceptionistLayout active="queue">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Live Clinical Queue</h1>
          <p style={subtitleStyle}>Real-time patient orchestration and dynamic triage management.</p>
        </div>
        <div style={syncStatus}>
          <div style={pulse}></div>
          <span>Live Sync Active</span>
        </div>
      </header>

      {error && (
        <div style={errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div style={queueContainer}>
        {isLoading ? (
          <div style={loaderStyle}>Establishing clinical data link...</div>
        ) : queue.length === 0 ? (
          <div style={emptyState}>
            <FiUsers size={64} color="var(--slate-100)" />
            <h3 style={emptyTitle}>Queue Vacant</h3>
            <p style={emptyText}>No patients are currently registered in the active clinical queue.</p>
          </div>
        ) : (
          <div style={queueList}>
            {queue.map((q, idx) => (
              <div key={q.appointment_id} style={{
                ...queueCard,
                borderColor: q.is_emergency ? "rgba(239, 68, 68, 0.2)" : "var(--slate-100)",
                background: q.is_emergency ? "rgba(239, 68, 68, 0.02)" : "white"
              }}>
                <div style={positionBadge}>#{idx + 1}</div>

                <div style={patientInfo}>
                  <div style={identityRow}>
                    <span style={petName}>{q.pet_name}</span>
                    <div style={badgeRow}>
                      {Number(q.is_emergency) === 1 && <span style={emergencyChip}><FiZap /> Emergency</span>}
                      {Number(q.is_walkin) === 1 && <span style={walkinChip}><FiShield /> Walk-in</span>}
                    </div>
                  </div>
                  <span style={ownerName}>{q.client_name || "Unregistered Client"}</span>
                </div>

                <div style={controlGroup}>
                  <div style={prioritySelectWrapper}>
                    <FiActivity style={selectIcon} />
                    <select
                      value={q.is_emergency ? "2" : q.is_walkin ? "1" : "0"}
                      onChange={(e) => {
                        const val = e.target.value;
                        updatePriority(q.appointment_id, {
                          priority_level: Number(val),
                          is_emergency: val === "2" ? 1 : 0,
                          is_walkin: val === "1" ? 1 : 0
                        });
                      }}
                      style={prioritySelect}
                    >
                      <option value="0">Standard Priority</option>
                      <option value="1">Walk-in Triage</option>
                      <option value="2">Emergency Triage</option>
                    </select>
                  </div>

                  <div style={moveControls}>
                    <button style={moveBtn} onClick={() => move(idx, idx - 1)} disabled={idx === 0} title="Promote in Sequence">
                      <FiArrowUp />
                    </button>
                    <button style={moveBtn} onClick={() => move(idx, idx + 1)} disabled={idx === queue.length - 1} title="Demote in Sequence">
                      <FiArrowDown />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ReceptionistLayout>
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

const syncStatus = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  background: "white",
  padding: "0.75rem 1.25rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-100)",
  fontSize: "0.8rem",
  fontWeight: "800",
  color: "var(--primary-green)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
};

const pulse = {
  width: "8px",
  height: "8px",
  background: "var(--primary-green)",
  borderRadius: "50%",
  boxShadow: "0 0 0 0 rgba(107, 143, 113, 0.4)",
  animation: "pulse 2s infinite"
};

const errorBanner = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444",
  borderRadius: "16px",
  marginBottom: "2.5rem",
  fontWeight: "700",
  fontSize: "0.95rem"
};

const queueContainer = {
  maxWidth: "900px"
};

const queueList = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem"
};

const queueCard = {
  display: "flex",
  alignItems: "center",
  padding: "1.75rem 2rem",
  borderRadius: "28px",
  border: "1px solid",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.03)",
  gap: "2rem",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
};

const positionBadge = {
  width: "48px",
  height: "48px",
  background: "var(--slate-900)",
  color: "white",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  fontSize: "1.1rem",
  flexShrink: 0
};

const patientInfo = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem"
};

const identityRow = {
  display: "flex",
  alignItems: "center",
  gap: "1rem"
};

const petName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const badgeRow = {
  display: "flex",
  gap: "0.5rem"
};

const emergencyChip = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "#EF4444",
  color: "white",
  padding: "0.25rem 0.75rem",
  borderRadius: "8px",
  fontSize: "0.7rem",
  fontWeight: "900",
  textTransform: "uppercase"
};

const walkinChip = {
  ...emergencyChip,
  background: "var(--primary-green)"
};

const ownerName = {
  fontSize: "0.95rem",
  color: "var(--slate-500)",
  fontWeight: "600"
};

const controlGroup = {
  display: "flex",
  alignItems: "center",
  gap: "2rem"
};

const prioritySelectWrapper = {
  position: "relative",
  width: "200px"
};

const selectIcon = {
  position: "absolute",
  left: "0.85rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--slate-400)",
  pointerEvents: "none"
};

const prioritySelect = {
  width: "100%",
  padding: "0.75rem 1rem 0.75rem 2.5rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "0.85rem",
  fontWeight: "700",
  color: "var(--slate-700)",
  outline: "none",
  cursor: "pointer",
  appearance: "none"
};

const moveControls = {
  display: "flex",
  gap: "0.5rem"
};

const moveBtn = {
  width: "40px",
  height: "40px",
  background: "white",
  color: "var(--slate-400)",
  border: "1px solid var(--slate-100)",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.1rem",
  cursor: "pointer",
  transition: "all 0.2s"
};

const loaderStyle = {
  padding: "4rem",
  textAlign: "center",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

const emptyState = {
  textAlign: "center",
  padding: "8rem 2rem",
  background: "white",
  borderRadius: "32px",
  border: "2px dashed var(--slate-100)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem"
};

const emptyTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const emptyText = {
  color: "var(--slate-500)",
  fontSize: "1.1rem",
  maxWidth: "400px"
};

export default ReceptionQueue;
