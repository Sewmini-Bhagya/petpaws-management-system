import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiClock,
  FiUser,
  FiActivity,
  FiChevronLeft,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from "react-icons/fi";
import API from "../../api/axios";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import ROUTES from "../../config/routes";

/**
 * ReceptionAppointments Component
 */
function ReceptionAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [form, setForm] = useState({
    id: "",
    pet_id: "",
    appointment_start: "",
    service_ids: "",
    vet_id: "",
  });

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/reception/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      console.error("[Appointments] synchronization failed:", err);
      setError("Failed to synchronize active clinical schedule.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const parsedServiceIds = useMemo(
    () =>
      form.service_ids
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isInteger(n) && n > 0),
    [form.service_ids]
  );

  const handleSubmit = async (mode) => {
    try {
      setIsSyncing(true);
      setError("");

      if (mode === 'create') {
        await API.post("/reception/appointments", {
          pet_id: Number(form.pet_id),
          appointment_start: form.appointment_start,
          service_ids: parsedServiceIds,
          vet_id: form.vet_id ? Number(form.vet_id) : undefined,
        });
      } else {
        if (!form.id) throw new Error("Reference ID required for modification.");
        await API.put(`/reception/appointments/${form.id}`, {
          appointment_start: form.appointment_start || undefined,
          service_ids: parsedServiceIds.length ? parsedServiceIds : undefined,
          vet_id: form.vet_id ? Number(form.vet_id) : Number(form.vet_id) === 0 ? null : undefined,
        });
      }

      setForm({ id: "", pet_id: "", appointment_start: "", service_ids: "", vet_id: "" });
      await loadAppointments();
    } catch (err) {
      console.error(`[Appointments] ${mode} failed:`, err);
      setError(err.response?.data?.message || err.message || "Operation failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Authorize cancellation of this clinical appointment?")) return;
    try {
      setIsSyncing(true);
      await API.delete(`/reception/appointments/${id}`);
      await loadAppointments();
    } catch (err) {
      console.error("[Appointments] cancellation failed:", err);
      setError("Authorization denied for cancellation.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ReceptionistLayout active="appointments">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Registry Management</h1>
          <p style={subtitleStyle}>Coordinate and synchronize the clinical visit schedule.</p>
        </div>
      </header>

      {error && (
        <div style={errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div style={contentGrid}>
        {/* PROTOCOL FORM */}
        <section style={formSection}>
          <div style={sectionHeader}>
            <h3 style={sectionTitle}>
              {form.id ? <FiEdit3 /> : <FiPlus />}
              {form.id ? "Modify Protocol" : "Initialize Booking"}
            </h3>
            {form.id && <button style={resetBtn} onClick={() => setForm({ id: "", pet_id: "", appointment_start: "", service_ids: "", vet_id: "" })}>Reset</button>}
          </div>

          <div style={formGrid}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Patient ID</label>
              <input
                style={inputStyle}
                placeholder="Required for new bookings..."
                value={form.pet_id}
                onChange={(e) => setForm(p => ({ ...p, pet_id: e.target.value }))}
              />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Start Sequence</label>
              <input
                style={inputStyle}
                type="datetime-local"
                value={form.appointment_start}
                onChange={(e) => setForm(p => ({ ...p, appointment_start: e.target.value }))}
              />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Service Protocols (IDs)</label>
              <input
                style={inputStyle}
                placeholder="101, 104, 205..."
                value={form.service_ids}
                onChange={(e) => setForm(p => ({ ...p, service_ids: e.target.value }))}
              />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Veterinary Staff ID</label>
              <input
                style={inputStyle}
                placeholder="Assigned Vet (Optional)"
                value={form.vet_id}
                onChange={(e) => setForm(p => ({ ...p, vet_id: e.target.value }))}
              />
            </div>
          </div>

          <div style={formActions}>
            <button
              style={form.id ? primaryBtn : secondaryBtn}
              onClick={() => handleSubmit(form.id ? 'update' : 'create')}
              disabled={isSyncing}
            >
              {isSyncing ? "Synchronizing..." : form.id ? "Apply Modifications" : "Confirm Booking"}
            </button>
          </div>
        </section>

        {/* APPOINTMENT FEED */}
        <section style={feedSection}>
          <div style={sectionHeader}>
            <h3 style={sectionTitle}><FiCalendar /> Active Schedule</h3>
            <span style={countBadge}>{appointments.length} Total</span>
          </div>

          <div style={appointmentsList}>
            {isLoading ? (
              <div style={loaderStyle}>Synchronizing clinical feed...</div>
            ) : appointments.length === 0 ? (
              <div style={emptyState}>
                <FiClock size={48} color="var(--slate-200)" />
                <p>No active appointments found in the registry.</p>
              </div>
            ) : (
              appointments.map((a) => (
                <div key={a.appointment_id} style={appointmentCard}>
                  <div style={cardHeader}>
                    <div style={idTag}>REF-{a.appointment_id}</div>
                    <div style={statusTag}>Confirmed</div>
                  </div>

                  <div style={cardBody}>
                    <div style={primaryInfo}>
                      <span style={petName}>{a.pet_name}</span>
                      <span style={ownerName}>{a.client_name || "Guest Client"}</span>
                    </div>

                    <div style={metaGrid}>
                      <div style={metaItem}>
                        <FiClock />
                        <span>{new Date(a.appointment_start).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={metaItem}>
                        <FiActivity />
                        <span>{a.services || "Consultation Only"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={cardActions}>
                    <button style={actionBtn} onClick={() => setForm({
                      id: a.appointment_id,
                      pet_id: a.pet_id,
                      appointment_start: a.appointment_start.slice(0, 16),
                      service_ids: a.service_ids || "",
                      vet_id: a.vet_id || ""
                    })}>
                      <FiEdit3 /> Edit
                    </button>
                    <button style={cancelBtn} onClick={() => cancelAppointment(a.appointment_id)}>
                      <FiTrash2 /> Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </ReceptionistLayout>
  );
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

const contentGrid = {
  display: "grid",
  gridTemplateColumns: "400px 1fr",
  gap: "3rem",
  alignItems: "flex-start"
};

const formSection = {
  background: "white",
  padding: "2.5rem",
  borderRadius: "32px",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)",
  position: "sticky",
  top: "120px"
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem"
};

const sectionTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem"
};

const resetBtn = {
  background: "var(--slate-100)",
  color: "var(--slate-600)",
  border: "none",
  padding: "0.4rem 0.8rem",
  borderRadius: "8px",
  fontSize: "0.75rem",
  fontWeight: "800",
  cursor: "pointer"
};

const formGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem"
};

const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const inputStyle = {
  width: "100%",
  padding: "0.85rem 1rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "0.95rem",
  color: "var(--slate-900)",
  outline: "none"
};

const formActions = {
  marginTop: "2.5rem"
};

const primaryBtn = {
  width: "100%",
  padding: "1.1rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "1rem",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.3)"
};

const secondaryBtn = {
  ...primaryBtn,
  background: "var(--slate-900)",
  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2)"
};

const feedSection = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const countBadge = {
  background: "var(--slate-100)",
  color: "var(--slate-500)",
  padding: "0.4rem 0.75rem",
  borderRadius: "999px",
  fontSize: "0.75rem",
  fontWeight: "800"
};

const appointmentsList = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "1.5rem"
};

const appointmentCard = {
  background: "white",
  borderRadius: "24px",
  padding: "1.75rem",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const idTag = {
  fontSize: "0.7rem",
  fontWeight: "900",
  color: "var(--slate-300)",
  letterSpacing: "0.05em"
};

const statusTag = {
  fontSize: "0.7rem",
  fontWeight: "800",
  color: "var(--primary-green)",
  background: "rgba(107, 143, 113, 0.1)",
  padding: "0.3rem 0.6rem",
  borderRadius: "8px",
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
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const ownerName = {
  fontSize: "0.9rem",
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
  fontSize: "0.85rem",
  color: "var(--slate-600)",
  fontWeight: "600"
};

const cardActions = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
  paddingTop: "1.25rem",
  borderTop: "1px solid var(--slate-50)"
};

const actionBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.75rem",
  background: "var(--slate-50)",
  color: "var(--slate-700)",
  border: "none",
  borderRadius: "12px",
  fontSize: "0.85rem",
  fontWeight: "700",
  cursor: "pointer"
};

const cancelBtn = {
  ...actionBtn,
  background: "rgba(239, 68, 68, 0.05)",
  color: "#EF4444"
};

const loaderStyle = {
  padding: "4rem",
  textAlign: "center",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

const emptyState = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "6rem 2rem",
  background: "white",
  borderRadius: "32px",
  border: "2px dashed var(--slate-100)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  color: "var(--slate-400)"
};

export default ReceptionAppointments;
