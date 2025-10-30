import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiUsers,
  FiAlertCircle,
  FiPlusCircle,
  FiSearch,
  FiCreditCard,
  FiPrinter,
  FiActivity,
  FiChevronRight
} from "react-icons/fi";
import API from "../../api/axios";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import ROUTES from "../../config/routes";

/**
 * ReceptionistDashboard Component
 */
function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    today_appointments: [],
    queue: [],
    quick_actions: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isQueueUpdating, setIsQueueUpdating] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get("/reception/dashboard");
      setDashboard({
        today_appointments: res.data?.today_appointments || [],
        queue: res.data?.queue || [],
        quick_actions: res.data?.quick_actions || [],
      });
    } catch (err) {
      console.error("[ReceptionDashboard] sync failed:", err);
      setError("Clinical synchronization failed. Check connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const apps = dashboard.today_appointments.length;
    const queueLen = dashboard.queue.length;
    const emergencies = dashboard.queue.filter(q => Number(q.is_emergency) === 1).length;
    return { apps, queueLen, emergencies };
  }, [dashboard]);

  const doSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await API.get(`/reception/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("[ReceptionSearch] failed:", err);
      setError("Identity search failed.");
    }
  };

  const prioritizeEmergency = async (appointmentId) => {
    try {
      setIsQueueUpdating(true);
      await API.put(`/reception/queue/${appointmentId}/emergency`);
      await loadDashboard();
    } catch (err) {
      console.error("[Queue] priority update failed:", err);
      setError("Emergency prioritization failed.");
    } finally {
      setIsQueueUpdating(false);
    }
  };

  return (
    <ReceptionistLayout active="dashboard">
      {/* STATS STRIP */}
      <div style={statsStrip}>
        <div style={statCard}>
          <div style={{ ...statIcon, background: "rgba(107, 143, 113, 0.1)", color: "var(--primary-green)" }}>
            <FiCalendar />
          </div>
          <div style={statInfo}>
            <span style={statLabel}>Appointments Today</span>
            <span style={statValue}>{stats.apps}</span>
          </div>
        </div>
        <div style={statCard}>
          <div style={{ ...statIcon, background: "rgba(15, 23, 42, 0.05)", color: "var(--slate-900)" }}>
            <FiUsers />
          </div>
          <div style={statInfo}>
            <span style={statLabel}>Active Queue</span>
            <span style={statValue}>{stats.queueLen}</span>
          </div>
        </div>
        <div style={statCard}>
          <div style={{ ...statIcon, background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}>
            <FiAlertCircle />
          </div>
          <div style={statInfo}>
            <span style={statLabel}>Emergencies</span>
            <span style={statValue}>{stats.emergencies}</span>
          </div>
        </div>
      </div>

      <div style={mainGrid}>
        {/* LEFT COLUMN: REGISTRY & QUEUE */}
        <div style={contentCol}>
          <section style={cardSection}>
            <div style={sectionHeader}>
              <h3 style={sectionTitle}>Registry Operations</h3>
              <div style={inlineSearch}>
                <FiSearch style={inlineSearchIcon} />
                <input
                  style={inlineSearchInput}
                  placeholder="Patient ID / Client Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                />
              </div>
            </div>

            {searchResults.length > 0 && (
              <div style={resultsGrid}>
                {searchResults.map((r) => (
                  <div key={`${r.client_id}-${r.pet_id}`} style={resultItem}>
                    <div style={resultIdentity}>
                      <span style={resultName}>{r.client_name}</span>
                      <span style={resultMeta}>{r.pet_name} — {r.phone}</span>
                    </div>
                    <button style={viewBtn} onClick={() => navigate(ROUTES.RECEPTION_SEARCH)}>
                      <FiChevronRight />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={dualGrid}>
              {/* APPOINTMENTS LIST */}
              <div style={listPanel}>
                <div style={panelHeader}>
                  <FiCalendar /> <span>Scheduled Registry</span>
                </div>
                <div style={panelContent}>
                  {dashboard.today_appointments.map(a => (
                    <div key={a.appointment_id} style={appointmentItem}>
                      <div style={itemTime}>{new Date(a.appointment_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={itemDetails}>
                        <div style={itemPet}>{a.pet_name}</div>
                        <div style={itemOwner}>{a.client_name}</div>
                      </div>
                    </div>
                  ))}
                  {dashboard.today_appointments.length === 0 && <div style={emptyPanel}>No active bookings for today.</div>}
                </div>
              </div>

              {/* LIVE QUEUE */}
              <div style={listPanel}>
                <div style={panelHeader}>
                  <FiActivity /> <span>Live Clinical Queue</span>
                </div>
                <div style={panelContent}>
                  {dashboard.queue.map(q => (
                    <div key={q.appointment_id} style={{ ...queueItem, background: q.is_emergency ? "rgba(239, 68, 68, 0.05)" : "white" }}>
                      <div style={queuePosition}>#{q.queue_position}</div>
                      <div style={itemDetails}>
                        <div style={itemPet}>
                          {q.pet_name}
                          {q.is_emergency && <span style={emergencyPulse}>Emergency</span>}
                        </div>
                        <div style={itemOwner}>{q.client_name}</div>
                      </div>
                      {!q.is_emergency && (
                        <button style={prioritizeBtn} onClick={() => prioritizeEmergency(q.appointment_id)} disabled={isQueueUpdating}>
                          Prioritize
                        </button>
                      )}
                    </div>
                  ))}
                  {dashboard.queue.length === 0 && <div style={emptyPanel}>Queue is currently vacant.</div>}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: ACTIONS & BILLING */}
        <aside style={actionCol}>
          <div style={actionCard}>
            <h3 style={actionTitle}>Quick Protocols</h3>
            <div style={actionGrid}>
              <button style={actionBtn} onClick={() => navigate(ROUTES.RECEPTIONIST.APPOINTMENTS)}>
                <FiPlusCircle /> New Booking
              </button>
              <button style={actionBtn} onClick={() => navigate(ROUTES.RECEPTIONIST.BILLING)}>
                <FiCreditCard /> Billing Console
              </button>
              <button style={actionBtn} onClick={() => navigate(ROUTES.RECEPTIONIST.INVOICE)}>
                <FiPrinter /> Invoice Terminal
              </button>
              <button style={actionBtn} onClick={() => navigate(ROUTES.RECEPTIONIST.SALES)}>
                <FiShoppingBag /> Retail Sale
              </button>
            </div>
          </div>

          <div style={promoCard}>
            <div style={promoIcon}><FiActivity /></div>
            <h4 style={promoTitle}>Queue Management</h4>
            <p style={promoText}>Monitor clinic throughput and handle triage status directly from the registry home.</p>
            <button style={secondaryBtn} onClick={() => navigate(ROUTES.RECEPTIONIST.QUEUE)}>Open Full Queue View</button>
          </div>
        </aside>
      </div>
    </ReceptionistLayout>
  );
}

/* 🎨 STYLES */

const statsStrip = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2rem",
  marginBottom: "3rem"
};

const statCard = {
  background: "white",
  padding: "1.75rem 2rem",
  borderRadius: "24px",
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
  border: "1px solid var(--slate-100)"
};

const statIcon = {
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem"
};

const statInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem"
};

const statLabel = {
  fontSize: "0.8rem",
  fontWeight: "700",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const statValue = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 340px",
  gap: "2.5rem",
  alignItems: "flex-start"
};

const contentCol = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
};

const cardSection = {
  background: "white",
  borderRadius: "32px",
  padding: "2.5rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)",
  border: "1px solid var(--slate-100)"
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2.5rem"
};

const sectionTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const inlineSearch = {
  position: "relative",
  width: "280px"
};

const inlineSearchIcon = {
  position: "absolute",
  left: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--slate-400)"
};

const inlineSearchInput = {
  width: "100%",
  padding: "0.75rem 1rem 0.75rem 2.75rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "0.9rem",
  outline: "none"
};

const resultsGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  marginBottom: "2.5rem",
  background: "var(--slate-50)",
  padding: "1.5rem",
  borderRadius: "20px"
};

const resultItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 1.25rem",
  background: "white",
  borderRadius: "14px",
  border: "1px solid var(--slate-200)"
};

const resultIdentity = {
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem"
};

const resultName = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const resultMeta = {
  fontSize: "0.85rem",
  color: "var(--slate-500)",
  fontWeight: "600"
};

const viewBtn = {
  background: "var(--slate-100)",
  color: "var(--slate-500)",
  border: "none",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};

const dualGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "2rem"
};

const listPanel = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem"
};

const panelHeader = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  fontSize: "0.9rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const panelContent = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const appointmentItem = {
  display: "flex",
  gap: "1.25rem",
  padding: "1.25rem",
  background: "var(--slate-50)",
  borderRadius: "20px",
  border: "1px solid var(--slate-100)"
};

const itemTime = {
  fontSize: "0.9rem",
  fontWeight: "800",
  color: "var(--primary-green)",
  background: "white",
  padding: "0.4rem 0.75rem",
  borderRadius: "10px",
  height: "fit-content",
  whiteSpace: "nowrap"
};

const itemDetails = {
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem"
};

const itemPet = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem"
};

const itemOwner = {
  fontSize: "0.85rem",
  color: "var(--slate-500)",
  fontWeight: "600"
};

const queueItem = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  padding: "1.25rem",
  background: "white",
  borderRadius: "20px",
  border: "1px solid var(--slate-200)"
};

const queuePosition = {
  width: "36px",
  height: "36px",
  background: "var(--slate-900)",
  color: "white",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  fontSize: "0.9rem",
  flexShrink: 0
};

const emergencyPulse = {
  fontSize: "0.65rem",
  fontWeight: "900",
  color: "white",
  background: "#EF4444",
  padding: "0.2rem 0.5rem",
  borderRadius: "6px",
  textTransform: "uppercase"
};

const prioritizeBtn = {
  marginLeft: "auto",
  padding: "0.5rem 0.8rem",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444",
  border: "none",
  borderRadius: "10px",
  fontSize: "0.75rem",
  fontWeight: "800",
  cursor: "pointer",
  transition: "all 0.2s"
};

const emptyPanel = {
  padding: "2rem",
  textAlign: "center",
  color: "var(--slate-300)",
  fontSize: "0.9rem",
  fontWeight: "600",
  background: "var(--slate-50)",
  borderRadius: "20px",
  border: "2px dashed var(--slate-100)"
};

const actionCol = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
};

const actionCard = {
  background: "white",
  padding: "2rem",
  borderRadius: "28px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
  border: "1px solid var(--slate-100)"
};

const actionTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "1.5rem"
};

const actionGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const actionBtn = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  width: "100%",
  padding: "1rem 1.25rem",
  background: "var(--slate-50)",
  color: "var(--slate-700)",
  border: "1px solid var(--slate-100)",
  borderRadius: "16px",
  fontSize: "0.95rem",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s"
};

const promoCard = {
  background: "var(--slate-900)",
  padding: "2rem",
  borderRadius: "28px",
  color: "white",
  textAlign: "center"
};

const promoIcon = {
  width: "48px",
  height: "48px",
  background: "rgba(255,255,255,0.1)",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.25rem",
  margin: "0 auto 1.5rem",
  color: "var(--primary-green)"
};

const promoTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "800",
  marginBottom: "0.75rem"
};

const promoText = {
  fontSize: "0.9rem",
  color: "var(--slate-400)",
  lineHeight: "1.6",
  marginBottom: "1.5rem"
};

const secondaryBtn = {
  width: "100%",
  padding: "0.85rem",
  background: "white",
  color: "var(--slate-900)",
  border: "none",
  borderRadius: "12px",
  fontSize: "0.9rem",
  fontWeight: "800",
  cursor: "pointer"
};

export default ReceptionistDashboard;