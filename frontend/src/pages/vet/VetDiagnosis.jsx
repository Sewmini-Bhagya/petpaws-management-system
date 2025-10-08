import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FiFileText,
  FiActivity,
  FiClipboard,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiZap
} from "react-icons/fi";
import API from "../../api/axios";
import VetLayout from "../../components/vet/VetLayout";

/**
 * VetDiagnosis Component
 */
function VetDiagnosis() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const initialAppointmentId = queryParams.get("appointment_id") || "";

  const [appointmentId, setAppointmentId] = useState(initialAppointmentId);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialAppointmentId) setAppointmentId(initialAppointmentId);
  }, [initialAppointmentId]);

  const submitDiagnosis = async () => {
    if (!appointmentId || !diagnosis.trim()) {
      setError("Active clinical reference (Appointment ID) and diagnosis are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      const res = await API.post(`/vet/appointments/${appointmentId}/diagnosis`, {
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || null,
      });

      setMessage(res.data?.message || "Clinical diagnosis has been successfully archived.");
      setDiagnosis("");
      setNotes("");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("[Clinical] Diagnosis submission failed:", err);
      setError(err.response?.data?.message || "Failed to archive clinical findings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VetLayout active="diagnosis">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Clinical Protocol</h1>
          <p style={subtitleStyle}>Document diagnostic findings and authorize treatment procedures.</p>
        </div>
      </header>

      <div style={formTerminal}>
        {message && (
          <div style={successBanner}>
            <FiCheckCircle />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={errorBanner}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <div style={formCard}>
          <div style={formHeader}>
            <FiFileText style={headerIcon} />
            <h3 style={formTitle}>Patient Encounter Report</h3>
          </div>

          <div style={formBody}>
            <div style={inputField}>
              <label style={fieldLabel}>Clinical Reference (Appointment ID)</label>
              <div style={inputWrapper}>
                <FiZap style={fieldIcon} />
                <input
                  style={textInput}
                  value={appointmentId}
                  placeholder="Enter reference ID (e.g. 101)"
                  onChange={(e) => setAppointmentId(e.target.value)}
                />
              </div>
            </div>

            <div style={inputField}>
              <label style={fieldLabel}>Primary Diagnosis</label>
              <div style={inputWrapper}>
                <FiActivity style={fieldIcon} />
                <textarea
                  style={textArea}
                  placeholder="Describe the primary medical findings..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
            </div>

            <div style={inputField}>
              <label style={fieldLabel}>Clinical Notes & Treatment Protocol</label>
              <div style={inputWrapper}>
                <FiClipboard style={fieldIcon} />
                <textarea
                  style={textArea}
                  placeholder="Authorize specific medications, dosages, and follow-up care..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={formFooter}>
            <button
              style={saveBtn}
              type="button"
              disabled={isSubmitting}
              onClick={submitDiagnosis}
            >
              {isSubmitting ? "Archiving..." : <><FiSave /> Finalize & Save Protocol</>}
            </button>
          </div>
        </div>
      </div>
    </VetLayout>
  );
}

/* 🎨 STYLES */

const headerWrapper = {
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

const formTerminal = {
  maxWidth: "800px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
};

const successBanner = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem 1.5rem",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "20px",
  fontWeight: "700"
};

const errorBanner = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem 1.5rem",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444",
  borderRadius: "20px",
  fontWeight: "700"
};

const formCard = {
  background: "white",
  borderRadius: "32px",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)",
  overflow: "hidden"
};

const formHeader = {
  padding: "2rem 2.5rem",
  background: "var(--slate-50)",
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  borderBottom: "1px solid var(--slate-100)"
};

const headerIcon = {
  fontSize: "1.5rem",
  color: "var(--slate-400)"
};

const formTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const formBody = {
  padding: "2.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
};

const inputField = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const fieldLabel = {
  fontSize: "0.9rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  paddingLeft: "0.25rem"
};

const inputWrapper = {
  position: "relative",
  display: "flex"
};

const fieldIcon = {
  position: "absolute",
  left: "1.25rem",
  top: "1.1rem",
  color: "var(--slate-300)",
  fontSize: "1.1rem"
};

const textInput = {
  width: "100%",
  padding: "1rem 1rem 1rem 3.25rem",
  borderRadius: "16px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "1rem",
  color: "var(--slate-900)",
  outline: "none",
  transition: "all 0.2s"
};

const textArea = {
  ...textInput,
  minHeight: "140px",
  resize: "vertical",
  lineHeight: "1.6"
};

const formFooter = {
  padding: "2rem 2.5rem",
  background: "var(--slate-50)",
  display: "flex",
  justifyContent: "flex-end",
  borderTop: "1px solid var(--slate-100)"
};

const saveBtn = {
  padding: "1rem 2rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "1rem",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.3)",
  transition: "all 0.2s"
};

export default VetDiagnosis;
