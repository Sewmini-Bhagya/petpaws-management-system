import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FiClipboard,
  FiBox,
  FiActivity,
  FiZap,
  FiInfo,
  FiClock,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiHash
} from "react-icons/fi";
import API from "../../api/axios";
import VetLayout from "../../components/vet/VetLayout";

/**
 * VetPrescriptions Component
 */
function VetPrescriptions() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const initialAppointmentId = queryParams.get("appointment_id") || "";

  const [form, setForm] = useState({
    appointment_id: initialAppointmentId,
    inventory_item_id: "",
    medication_name: "",
    quantity: "",
    dosage: "",
    instructions: "",
    duration_days: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialAppointmentId) {
      setForm(prev => ({ ...prev, appointment_id: initialAppointmentId }));
    }
  }, [initialAppointmentId]);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submitPrescription = async () => {
    const { appointment_id, quantity, inventory_item_id, medication_name } = form;

    if (!appointment_id || !quantity || (!inventory_item_id && !medication_name)) {
      setError("Clinical reference, quantity, and medication identifier are required.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setMessage("");

      const payload = {
        quantity: Number(quantity),
        dosage: form.dosage || null,
        instructions: form.instructions || null,
        duration_days: form.duration_days ? Number(form.duration_days) : null,
      };

      if (inventory_item_id) payload.inventory_item_id = Number(inventory_item_id);
      if (medication_name) payload.medication_name = medication_name;

      const res = await API.post(`/vet/appointments/${appointment_id}/prescriptions`, payload);
      setMessage(res.data?.message || "Pharmacological protocol successfully archived.");

      // Partial reset
      setForm(prev => ({
        ...prev,
        inventory_item_id: "",
        medication_name: "",
        quantity: "",
        dosage: "",
        instructions: "",
        duration_days: "",
      }));

      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("[Clinical] Prescription authorization failed:", err);
      setError(err.response?.data?.message || "Failed to authorize pharmacological protocol.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VetLayout active="prescriptions">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Pharmacy Hub</h1>
          <p style={subtitleStyle}>Authorize pharmacological protocols and manage clinical prescriptions.</p>
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
            <FiClipboard style={headerIcon} />
            <h3 style={formTitle}>Pharmacological Authorization</h3>
          </div>

          <div style={formBody}>
            {/* REFERENCE SECTION */}
            <div style={formCluster}>
              <h4 style={clusterTitle}>Clinical Reference</h4>
              <div style={fieldGrid}>
                <Field
                  label="Appointment Reference"
                  icon={<FiZap />}
                  placeholder="INV-XXXXXX"
                  value={form.appointment_id}
                  onChange={(v) => onChange("appointment_id", v)}
                />
              </div>
            </div>

            {/* MEDICATION SECTION */}
            <div style={formCluster}>
              <h4 style={clusterTitle}>Medication Protocol</h4>
              <div style={fieldGrid}>
                <Field
                  label="Inventory Ref (SKU)"
                  icon={<FiHash />}
                  placeholder="e.g. 501"
                  value={form.inventory_item_id}
                  onChange={(v) => onChange("inventory_item_id", v)}
                />
                <Field
                  label="Medication Label (Manual)"
                  icon={<FiBox />}
                  placeholder="e.g. Amoxicillin 250mg"
                  value={form.medication_name}
                  onChange={(v) => onChange("medication_name", v)}
                />
              </div>
            </div>

            {/* DOSAGE SECTION */}
            <div style={formCluster}>
              <h4 style={clusterTitle}>Dosage & Administration</h4>
              <div style={fieldGrid}>
                <Field
                  label="Authorized Quantity"
                  icon={<FiPlus />}
                  placeholder="e.g. 14"
                  value={form.quantity}
                  onChange={(v) => onChange("quantity", v)}
                />
                <Field
                  label="Dosage Protocol"
                  icon={<FiActivity />}
                  placeholder="e.g. 1 tablet twice daily"
                  value={form.dosage}
                  onChange={(v) => onChange("dosage", v)}
                />
                <Field
                  label="Clinical Instructions"
                  icon={<FiInfo />}
                  placeholder="e.g. Administer with food"
                  value={form.instructions}
                  onChange={(v) => onChange("instructions", v)}
                />
                <Field
                  label="Duration (Cycles/Days)"
                  icon={<FiClock />}
                  placeholder="e.g. 7"
                  value={form.duration_days}
                  onChange={(v) => onChange("duration_days", v)}
                />
              </div>
            </div>
          </div>

          <div style={formFooter}>
            <button
              style={authorizeBtn}
              type="button"
              disabled={isSaving}
              onClick={submitPrescription}
            >
              {isSaving ? "Authorizing..." : <><FiSave /> Authorize Prescription</>}
            </button>
          </div>
        </div>
      </div>
    </VetLayout>
  );
}

/**
 * Field Component
 * 
 * Standardized input container for clinical data entry.
 */
function Field({ label, icon, value, onChange, placeholder }) {
  return (
    <div style={fieldGroup}>
      <label style={fieldLabel}>{label}</label>
      <div style={inputWrapper}>
        <span style={fieldIcon}>{icon}</span>
        <input
          style={clinicalInput}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
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
  maxWidth: "900px",
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
  gap: "3rem"
};

const formCluster = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const clusterTitle = {
  fontSize: "0.75rem",
  fontWeight: "900",
  color: "var(--slate-300)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  borderBottom: "1px solid var(--slate-50)",
  paddingBottom: "0.5rem"
};

const fieldGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem"
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const fieldLabel = {
  fontSize: "0.85rem",
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
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--slate-300)",
  fontSize: "1.1rem",
  display: "flex"
};

const clinicalInput = {
  width: "100%",
  padding: "0.85rem 1rem 0.85rem 3.25rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "0.95rem",
  color: "var(--slate-900)",
  outline: "none",
  transition: "all 0.2s"
};

const formFooter = {
  padding: "2rem 2.5rem",
  background: "var(--slate-50)",
  display: "flex",
  justifyContent: "flex-end",
  borderTop: "1px solid var(--slate-100)"
};

const authorizeBtn = {
  padding: "1rem 2rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "1rem",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.3)",
  transition: "all 0.2s"
};

export default VetPrescriptions;
