import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import API from "../../api/axios";

/**
 * AppointmentManagement Component
 */
function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  /**
   * Fetches the complete schedule from the backend.
   */
  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("[Appointments] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates the status of an appointment to 'Cancelled'.
   */
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointment_id === id
            ? { ...a, status_name: "Cancelled" }
            : a
        )
      );
    } catch (err) {
      console.error("[Appointments] Cancel failed:", err);
    }
  };

  return (
    <AdminLayout>
      <header style={headerContainer}>
        <h1 style={titleStyle}>Clinic Schedule</h1>
        <p style={subtitleStyle}>Oversee all upcoming and past pet appointments</p>
      </header>

      {loading ? (
        <div style={loader}>Synchronizing schedule...</div>
      ) : (
        <div style={grid}>
          {appointments.length === 0 ? (
            <div style={emptyState}>No appointments found in the system.</div>
          ) : (
            appointments.map((a) => (
              <div key={a.appointment_id} style={card}>
                <div style={cardHeader}>
                  <h3 style={petName}>{a.pet_name || "Pet"}</h3>
                  <span style={{
                    ...statusBadge,
                    background: a.status_name === "Cancelled" ? "#FEE2E2" : "#DCFCE7",
                    color: a.status_name === "Cancelled" ? "#991B1B" : "#166534"
                  }}>
                    {a.status_name || a.status}
                  </span>
                </div>

                <div style={infoGroup}>
                  <div style={infoItem}>
                    <small style={label}>Owner</small>
                    <div style={value}>{a.client_name || "Unknown"}</div>
                  </div>
                  <div style={infoItem}>
                    <small style={label}>Schedule</small>
                    <div style={value}>
                      {new Date(a.appointment_start).toLocaleDateString()} at{" "}
                      {new Date(a.appointment_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={cardActions}>
                  <button style={secondaryBtn} disabled>Reschedule</button>
                  {a.status_name !== "Cancelled" && (
                    <button
                      style={dangerBtn}
                      onClick={() => handleCancel(a.appointment_id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "2.5rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const subtitleStyle = {
  color: "var(--slate-600)",
  fontSize: "1.1rem"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "1.5rem"
};

const card = {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "20px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)",
  display: "flex",
  flexDirection: "column",
  gap: "1.2rem"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
};

const petName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.2rem",
  fontWeight: "700",
  color: "var(--slate-800)"
};

const statusBadge = {
  fontSize: "0.7rem",
  fontWeight: "800",
  padding: "0.3rem 0.6rem",
  borderRadius: "8px",
  textTransform: "uppercase"
};

const infoGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem"
};

const infoItem = {
  display: "flex",
  flexDirection: "column"
};

const label = {
  fontSize: "0.75rem",
  color: "var(--slate-500)",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.02em"
};

const value = {
  fontSize: "0.95rem",
  color: "var(--slate-700)",
  fontWeight: "500"
};

const cardActions = {
  display: "flex",
  gap: "0.8rem",
  marginTop: "0.5rem"
};

const secondaryBtn = {
  flex: 1,
  background: "var(--slate-100)",
  color: "var(--slate-500)",
  border: "none",
  padding: "0.6rem",
  borderRadius: "10px",
  fontSize: "0.85rem",
  fontWeight: "600",
  cursor: "not-allowed"
};

const dangerBtn = {
  flex: 1,
  background: "transparent",
  color: "#EF4444",
  border: "1px solid #FCA5A5",
  padding: "0.6rem",
  borderRadius: "10px",
  fontSize: "0.85rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s"
};

const loader = {
  padding: "4rem",
  textAlign: "center",
  color: "var(--slate-400)"
};

const emptyState = {
  gridColumn: "1 / -1",
  padding: "4rem",
  textAlign: "center",
  background: "var(--slate-50)",
  borderRadius: "20px",
  border: "2px dashed var(--slate-200)",
  color: "var(--slate-400)"
};

export default AppointmentManagement;