import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiFileText,
  FiUploadCloud,
  FiActivity,
  FiExternalLink,
  FiFolder,
  FiShield,
  FiAlertCircle,
  FiClock,
  FiSearch
} from "react-icons/fi";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";

/**
 * MedicalRecords Component
 */
function MedicalRecords() {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("Vaccination Card");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Retrieves the longitudinal document archive for the patient.
   */
  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const res = await API.get(`/documents/${id}`);
      setRecords(res.data);
    } catch (err) {
      console.error("[Clinical] Failed to fetch medical records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [id]);

  /**
   * Orchestrates the secure upload of medical documentation.
   */
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a clinical document to authorize.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);

    try {
      setIsUploading(true);
      await API.post(`/documents/${id}`, formData);
      alert("Clinical document successfully archived.");
      setFile(null);
      fetchRecords();
    } catch (err) {
      console.error("[Clinical] Document upload failed:", err);
      alert("Authorization failed. Please verify the document protocol.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ClientLayout active="pets">
      <div style={viewportContainer}>
        <header style={headerWrapper}>
          <div style={titleGroup}>
            <h1 style={titleStyle}>Medical Archive</h1>
            <p style={subtitleStyle}>Manage external diagnostic reports, lab findings, and certifications.</p>
          </div>
          <div style={statusBadge}>
            <FiShield />
            <span>Encrypted Repository</span>
          </div>
        </header>

        <div style={mainLayout}>
          {/* ARCHIVAL CONTROL */}
          <aside style={controlPanel}>
            <div style={panelHeader}>
              <FiUploadCloud />
              <h3 style={panelTitle}>Archive Document</h3>
            </div>

            <div style={archivalForm}>
              <div style={fieldGroup}>
                <label style={fieldLabel}>Report Classification</label>
                <select style={selectInput} value={docType} onChange={e => setDocType(e.target.value)}>
                  <option>Vaccination Card</option>
                  <option>Lab Report</option>
                  <option>External Prescription</option>
                  <option>Surgical Record</option>
                  <option>Pathology Results</option>
                  <option>Other Documentation</option>
                </select>
              </div>

              <div style={fieldGroup}>
                <label style={fieldLabel}>Clinical File (PDF/IMG)</label>
                <div style={fileDropzone}>
                  <input
                    type="file"
                    id="doc-upload"
                    onChange={e => setFile(e.target.files[0])}
                    style={hiddenInput}
                  />
                  <label htmlFor="doc-upload" style={dropzoneLabel}>
                    {file ? (
                      <span style={fileName}>{file.name}</span>
                    ) : (
                      <>
                        <FiFolder size={24} />
                        <span>Select clinical file...</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button
                style={{ ...authorizeBtn, opacity: isUploading ? 0.7 : 1 }}
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? "Authorizing..." : <><FiShield /> Authorize Archival</>}
              </button>
            </div>
          </aside>

          {/* RECORD FEED */}
          <section style={feedSection}>
            <div style={feedHeader}>
              <h3 style={feedTitle}>Longitudinal Records</h3>
              <div style={feedSearch}>
                <FiSearch />
                <input style={searchInner} placeholder="Filter records..." />
              </div>
            </div>

            <div style={recordsGrid}>
              {isLoading ? (
                <div style={placeholderMsg}>Synchronizing clinical records...</div>
              ) : records.length === 0 ? (
                <div style={emptyState}>
                  <FiFolder size={64} color="var(--slate-100)" />
                  <p>No documents have been archived for this patient profile.</p>
                </div>
              ) : (
                <div style={recordsList}>
                  {records.map(rec => (
                    <div key={rec.pet_document_id || rec.record_id} style={recordCard}>
                      <div style={iconBox}>
                        <FiFileText />
                      </div>
                      <div style={recMeta}>
                        <h4 style={recType}>{rec.document_type}</h4>
                        <div style={recDetails}>
                          <span style={detailItem}><FiClock /> {new Date(rec.uploaded_at).toLocaleDateString()}</span>
                          <span style={detailItem}><FiShield /> Encrypted</span>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:8000/${rec.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        style={actionBtn}
                      >
                        <FiExternalLink /> Access Report
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const viewportContainer = {
  padding: "4rem",
  maxWidth: "1400px",
  margin: "0 auto"
};

const headerWrapper = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "4rem"
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

const statusBadge = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1.25rem",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "16px",
  fontWeight: "800",
  fontSize: "0.9rem"
};

const mainLayout = {
  display: "grid",
  gridTemplateColumns: "380px 1fr",
  gap: "4rem",
  alignItems: "flex-start"
};

const controlPanel = {
  background: "white",
  borderRadius: "32px",
  border: "1px solid var(--slate-100)",
  padding: "2.5rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.03)",
  position: "sticky",
  top: "120px"
};

const panelHeader = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  color: "var(--slate-900)",
  fontSize: "1.25rem",
  marginBottom: "2rem"
};

const panelTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "800",
  margin: 0
};

const archivalForm = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
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

const selectInput = {
  width: "100%",
  padding: "1rem",
  borderRadius: "16px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "0.95rem",
  color: "var(--slate-900)",
  outline: "none"
};

const fileDropzone = {
  position: "relative"
};

const hiddenInput = {
  position: "absolute",
  width: "1px",
  height: "1px",
  opacity: 0
};

const dropzoneLabel = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  padding: "2.5rem 1.5rem",
  borderRadius: "20px",
  border: "2px dashed var(--slate-100)",
  background: "var(--slate-50)",
  cursor: "pointer",
  color: "var(--slate-400)",
  transition: "all 0.2s",
  textAlign: "center"
};

const fileName = {
  color: "var(--primary-green)",
  fontWeight: "700",
  fontSize: "0.9rem",
  wordBreak: "break-all"
};

const authorizeBtn = {
  width: "100%",
  padding: "1.1rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "18px",
  fontSize: "1rem",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s"
};

const feedSection = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
};

const feedHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const feedTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const feedSearch = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  color: "var(--slate-300)"
};

const searchInner = {
  padding: "0.75rem 1rem 0.75rem 2.5rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-100)",
  background: "white",
  fontSize: "0.9rem",
  width: "240px",
  outline: "none"
};

const recordsGrid = {
  minHeight: "400px"
};

const recordsList = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const recordCard = {
  background: "white",
  padding: "1.75rem",
  borderRadius: "28px",
  border: "1px solid var(--slate-100)",
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.02)",
  transition: "all 0.2s"
};

const iconBox = {
  width: "56px",
  height: "56px",
  background: "var(--slate-50)",
  color: "var(--slate-400)",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem"
};

const recMeta = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const recType = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.15rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const recDetails = {
  display: "flex",
  gap: "1.5rem",
  fontSize: "0.85rem",
  color: "var(--slate-400)",
  fontWeight: "600"
};

const detailItem = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem"
};

const actionBtn = {
  padding: "0.75rem 1.25rem",
  background: "var(--slate-50)",
  color: "var(--slate-900)",
  borderRadius: "14px",
  fontSize: "0.9rem",
  fontWeight: "800",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  transition: "all 0.2s"
};

const placeholderMsg = {
  textAlign: "center",
  padding: "6rem",
  color: "var(--slate-300)",
  fontSize: "1.1rem",
  fontWeight: "600"
};

const emptyState = {
  textAlign: "center",
  padding: "8rem 2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2rem",
  color: "var(--slate-300)",
  background: "white",
  borderRadius: "40px",
  border: "2px dashed var(--slate-50)"
};

export default MedicalRecords;
