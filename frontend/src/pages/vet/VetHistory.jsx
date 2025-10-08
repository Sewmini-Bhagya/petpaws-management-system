import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  FiSearch, 
  FiActivity, 
  FiClipboard, 
  FiShield, 
  FiFileText, 
  FiAlertTriangle, 
  FiUser, 
  FiHeart,
  FiBox,
  FiCalendar,
  FiCheckCircle
} from "react-icons/fi";
import API from "../../api/axios";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import VetLayout from "../../components/vet/VetLayout";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import AdminLayout from "../../components/admin/AdminLayout";
import APP_CONFIG from "../../config/appConfig";

/**
 * VetHistory Component
 */
function VetHistory() {
  const { search } = useLocation();
  const initialPetId = new URLSearchParams(search).get("pet_id") || "";

  const { user } = useContext(AuthContext);
  const role = (user?.role_name || user?.role || "").toUpperCase();

  const [petId, setPetId] = useState(initialPetId);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async (id = petId) => {
    if (!id) {
      setError("Clinical reference ID is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/vet/pets/${id}`);
      setHistory(res.data);
    } catch (err) {
      console.error("[Clinical] history retrieval failed:", err);
      setHistory(null);
      setError("Failed to locate medical archives for this reference.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPetId) fetchHistory(initialPetId);
  }, [initialPetId]);

  // DYNAMIC LAYOUT
  const Layout = role === "ADMIN" ? AdminLayout : role === "RECEPTIONIST" ? ReceptionistLayout : VetLayout;

  return (
    <Layout active={role === "RECEPTIONIST" ? "search" : "history"}>
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Clinical Records</h1>
          <p style={subtitleStyle}>Access longitudinal patient records and diagnostic history.</p>
        </div>
      </header>

      <div style={terminalToolbar}>
        <div style={inputGroup}>
          <FiSearch style={inputIcon} />
          <input
            style={terminalInput}
            placeholder="Search by Patient ID (e.g. 101)..."
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
          />
        </div>
        <button style={loadBtn} onClick={() => fetchHistory()} disabled={loading}>
          {loading ? "Querying..." : "Retrieve Record"}
        </button>
      </div>

      {error && (
        <div style={errorBanner}>
          <FiAlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {history && (
        <div style={historyContainer}>
          {/* CRITICAL ALERTS */}
          {history.pet?.allergies && (
            <div style={allergyAlert}>
              <div style={alertIcon}><FiAlertTriangle /></div>
              <div style={alertContent}>
                <span style={alertTitle}>Critical Allergy Protocol</span>
                <span style={alertValue}>{history.pet.allergies}</span>
              </div>
            </div>
          )}

          <div style={historyGrid}>
            <div style={mainColumn}>
              {/* PATIENT PROFILE */}
              <div style={profileCard}>
                <div style={profileHeader}>
                  <div style={avatarWrapper}>
                    {history.pet?.profile_picture ? (
                      <img 
                        src={`${APP_CONFIG.SERVER_URL}/uploads/pets/${history.pet.profile_picture}`} 
                        alt="Patient" 
                        style={patientImg} 
                      />
                    ) : (
                      <FiHeart />
                    )}
                  </div>
                  <div style={profileMeta}>
                    <h2 style={petName}>{history.pet?.pet_name}</h2>
                    <span style={speciesTag}>{history.pet?.species} {history.pet?.breed ? `• ${history.pet.breed}` : ""}</span>
                  </div>
                </div>
                <div style={ownerInfo}>
                  <FiUser />
                  <span>Authorized Owner: <strong>{history.pet?.owner_name?.trim() || history.pet?.owner_email || "N/A"}</strong></span>
                </div>
              </div>

              {/* TIMELINE SECTIONS */}
              <ClinicalSection 
                title="Diagnostic History" 
                icon={<FiActivity />}
                items={history.diagnoses} 
                render={(d) => (
                  <div style={diagnosisItem}>
                    <h4 style={diagnosisTitle}>{d.diagnosis || "General Findings"}</h4>
                    <p style={diagnosisNotes}>{d.notes || "No clinical notes recorded."}</p>
                    {d.created_at && <span style={itemDate}>{formatDate(d.created_at)}</span>}
                  </div>
                )} 
              />

              <ClinicalSection 
                title="Clinical Rounds" 
                icon={<FiCalendar />}
                items={history.past_appointments} 
                render={(a) => (
                  <div style={appointmentItem}>
                    <div style={itemHeader}>
                      <span style={itemRef}>REF-{a.appointment_id}</span>
                      <span style={itemDate}>{formatDate(a.appointment_start)}</span>
                    </div>
                    <span style={serviceName}>{a.services || "Consultation"}</span>
                  </div>
                )} 
              />
            </div>

            <div style={sideColumn}>
              <ClinicalSection 
                title="Pharmacology" 
                icon={<FiBox />}
                items={history.prescriptions} 
                render={(p) => (
                  <div style={prescriptionItem}>
                    <h4 style={medName}>{p.medication_name || p.medication_id || "Medication"}</h4>
                    <div style={medMeta}>
                      <span>{p.quantity ?? "0"} Units</span>
                      <span>{p.dosage || "Standard"}</span>
                    </div>
                  </div>
                )} 
              />

              <ClinicalSection 
                title="Immunizations" 
                icon={<FiShield />}
                items={history.vaccinations} 
                render={(v) => (
                  <div style={vaccineItem}>
                    <FiCheckCircle color="var(--primary-green)" />
                    <div style={vaccineMeta}>
                      <h4 style={vacName}>{v.vaccine_name || v.vaccination_name || "Vaccine"}</h4>
                      <span style={itemDate}>{formatDate(v.vaccination_date || v.vaccinated_at)}</span>
                    </div>
                  </div>
                )} 
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

/**
 * ClinicalSection Component
 * 
 * Standardized module for specific medical data categories.
 */
function ClinicalSection({ title, icon, items = [], render }) {
  return (
    <div style={sectionCard}>
      <div style={sectionHeader}>
        {icon}
        <h3 style={sectionTitle}>{title}</h3>
      </div>
      <div style={sectionContent}>
        {!items?.length ? (
          <div style={emptySection}>No clinical records found in this category.</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} style={itemWrapper}>
              {render(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });
};

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

const terminalToolbar = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  background: "white",
  padding: "1rem",
  borderRadius: "24px",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
  marginBottom: "3rem",
  maxWidth: "700px"
};

const inputGroup = {
  position: "relative",
  flex: 1
};

const inputIcon = {
  position: "absolute",
  left: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--slate-400)"
};

const terminalInput = {
  width: "100%",
  padding: "0.85rem 1rem 0.85rem 2.75rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-50)",
  background: "var(--slate-50)",
  fontSize: "1rem",
  outline: "none"
};

const loadBtn = {
  padding: "0.85rem 1.5rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "0.9rem",
  fontWeight: "800",
  cursor: "pointer"
};

const errorBanner = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444",
  borderRadius: "16px",
  marginBottom: "2rem",
  fontWeight: "700",
  maxWidth: "700px"
};

const historyContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem"
};

const allergyAlert = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  background: "#EF4444",
  color: "white",
  padding: "1.5rem 2rem",
  borderRadius: "24px",
  boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.2)"
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

const historyGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 380px",
  gap: "2.5rem"
};

const mainColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem"
};

const sideColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem"
};

const profileCard = {
  background: "white",
  padding: "2.5rem",
  borderRadius: "32px",
  border: "1px solid var(--slate-100)",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const profileHeader = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem"
};

const avatarWrapper = {
  width: "84px",
  height: "84px",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",
  overflow: "hidden",
  border: "4px solid white",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
};

const patientImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const profileMeta = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem"
};

const petName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const speciesTag = {
  fontSize: "0.95rem",
  color: "var(--slate-400)",
  fontWeight: "700"
};

const ownerInfo = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "var(--slate-400)",
  fontSize: "0.95rem"
};

const sectionCard = {
  background: "white",
  borderRadius: "32px",
  border: "1px solid var(--slate-100)",
  overflow: "hidden"
};

const sectionHeader = {
  padding: "1.5rem 2rem",
  background: "var(--slate-50)",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  color: "var(--slate-900)",
  fontSize: "1.25rem",
  borderBottom: "1px solid var(--slate-100)"
};

const sectionTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "800",
  margin: 0
};

const sectionContent = {
  padding: "1rem"
};

const itemWrapper = {
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid var(--slate-50)"
};

const diagnosisItem = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const diagnosisTitle = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const diagnosisNotes = {
  fontSize: "0.9rem",
  color: "var(--slate-500)",
  lineHeight: "1.5",
  margin: 0
};

const itemDate = {
  fontSize: "0.75rem",
  fontWeight: "800",
  color: "var(--slate-300)",
  textTransform: "uppercase"
};

const appointmentItem = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem"
};

const itemHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const itemRef = {
  fontSize: "0.75rem",
  fontWeight: "900",
  color: "var(--slate-300)"
};

const serviceName = {
  fontSize: "1rem",
  fontWeight: "700",
  color: "var(--slate-900)"
};

const prescriptionItem = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem"
};

const medName = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const medMeta = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "0.85rem",
  color: "var(--slate-400)",
  fontWeight: "600"
};

const vaccineItem = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem"
};

const vaccineMeta = {
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem"
};

const vacName = {
  fontSize: "0.95rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const emptySection = {
  padding: "3rem 2rem",
  textAlign: "center",
  color: "var(--slate-300)",
  fontSize: "0.9rem",
  fontWeight: "600"
};

export default VetHistory;
