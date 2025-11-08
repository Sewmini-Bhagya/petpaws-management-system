import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiPhone,
  FiMail,
  FiChevronRight,
  FiAlertCircle
} from "react-icons/fi";
import API from "../../api/axios";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";

/**
 * ReceptionSearch Component
 */
function ReceptionSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const res = await API.get(`/reception/search?q=${encodeURIComponent(q.trim())}`);
      setResults(res.data || []);
    } catch (err) {
      console.error("[Registry] search query failed:", err);
      setError("Failed to retrieve registry records.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReceptionistLayout active="search">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Registry Lookup</h1>
          <p style={subtitleStyle}>Navigate the clinical database to locate client and patient records.</p>
        </div>
      </header>

      <div style={searchTerminal}>
        <div style={searchBar}>
          <FiSearch style={searchIcon} />
          <input
            style={searchInput}
            placeholder="Search by client name, patient ID, or phone number..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button style={searchBtn} onClick={search} disabled={isLoading}>
            {isLoading ? "Querying..." : "Search"}
          </button>
        </div>

        {error && (
          <div style={errorBanner}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <div style={resultsFeed}>
          {isLoading ? (
            <div style={loaderStyle}>Searching clinical registry...</div>
          ) : results.length === 0 ? (
            q.trim() && !isLoading && (
              <div style={emptyState}>
                <FiSearch size={48} color="var(--slate-200)" />
                <p>No matching records found in the registry.</p>
              </div>
            )
          ) : (
            results.map((r) => (
              <div
                key={`${r.client_id}-${r.pet_id || "x"}`}
                style={resultCard}
                onClick={() => r.pet_id && navigate(`/recep/records?pet_id=${r.pet_id}`)}
              >
                <div style={clientSection}>
                  <div style={profileHeader}>
                    <div style={userAvatar}><FiUser /></div>
                    <div style={profileInfo}>
                      <h4 style={clientName}>{r.client_name?.trim() || "Unregistered Client"}</h4>
                      <div style={contactRow}>
                        <span style={contactItem}><FiPhone /> {r.phone || "N/A"}</span>
                        <span style={contactItem}><FiMail /> {r.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {r.pet_name && (
                  <div style={patientSection}>
                    <div style={petBadge}>
                      <FiHeart style={heartIcon} />
                      <div style={petDetails}>
                        <span style={petLabel}>Associated Patient</span>
                        <span style={petValue}>{r.pet_name}</span>
                      </div>
                    </div>
                    <FiChevronRight style={arrowIcon} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ReceptionistLayout>
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

const searchTerminal = {
  maxWidth: "900px",
  margin: "0 auto"
};

const searchBar = {
  display: "flex",
  alignItems: "center",
  background: "white",
  padding: "0.75rem",
  borderRadius: "24px",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)",
  gap: "1rem",
  marginBottom: "3rem"
};

const searchIcon = {
  fontSize: "1.5rem",
  color: "var(--slate-400)",
  marginLeft: "1rem"
};

const searchInput = {
  flex: 1,
  border: "none",
  background: "transparent",
  fontSize: "1.1rem",
  color: "var(--slate-900)",
  outline: "none",
  padding: "0.5rem 0"
};

const searchBtn = {
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  padding: "0.85rem 2rem",
  borderRadius: "16px",
  fontSize: "1rem",
  fontWeight: "800",
  cursor: "pointer",
  transition: "all 0.2s"
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
  fontWeight: "700"
};

const resultsFeed = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem"
};

const resultCard = {
  background: "white",
  borderRadius: "28px",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  transition: "all 0.2s"
};

const clientSection = {
  padding: "2rem"
};

const profileHeader = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem"
};

const userAvatar = {
  width: "64px",
  height: "64px",
  background: "var(--slate-50)",
  color: "var(--slate-400)",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.75rem"
};

const profileInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem"
};

const clientName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.35rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const contactRow = {
  display: "flex",
  gap: "1.5rem",
  marginTop: "0.25rem"
};

const contactItem = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
  color: "var(--slate-500)",
  fontWeight: "600"
};

const patientSection = {
  background: "var(--slate-50)",
  padding: "1.5rem 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderTop: "1px solid var(--slate-100)"
};

const petBadge = {
  display: "flex",
  alignItems: "center",
  gap: "1rem"
};

const heartIcon = {
  color: "var(--primary-green)",
  fontSize: "1.25rem"
};

const petDetails = {
  display: "flex",
  flexDirection: "column"
};

const petLabel = {
  fontSize: "0.7rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const petValue = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const arrowIcon = {
  color: "var(--slate-300)",
  fontSize: "1.25rem"
};

const loaderStyle = {
  textAlign: "center",
  padding: "4rem",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

const emptyState = {
  textAlign: "center",
  padding: "6rem 2rem",
  color: "var(--slate-400)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem"
};

export default ReceptionSearch;
