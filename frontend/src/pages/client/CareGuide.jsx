import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { breedData } from "../../data/breeds";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";

/**
 * CareGuide Component
 */
function CareGuide() {
  const { breed } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const petId = queryParams.get("petId");

  const [activeTab, setActiveTab] = useState("adult");
  const [pet, setPet] = useState(null);

  // Case-insensitive lookup
  const normalizedBreed = breed.toLowerCase().replace(/\s+/g, '');
  const dataKey = Object.keys(breedData).find(
    k => k.toLowerCase() === normalizedBreed || k.toLowerCase().replace(/\s+/g, '') === normalizedBreed
  );

  const data = dataKey ? breedData[dataKey] : null;

  useEffect(() => {
    const fetchPetContext = async () => {
      if (!petId) return;
      try {
        const res = await API.get(`/pets/${petId}`);
        const petData = res.data;
        setPet(petData);

        // Calculate life stage
        const dob = new Date(petData.date_of_birth);
        const now = new Date();
        const ageInMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());

        if (petData.species.toLowerCase() === "cat") {
          if (ageInMonths < 12) setActiveTab("kitten");
          else if (ageInMonths < 120) setActiveTab("adult");
          else setActiveTab("senior");
        } else {
          if (ageInMonths < 18) setActiveTab("puppy");
          else if (ageInMonths < 84) setActiveTab("adult");
          else setActiveTab("senior");
        }
      } catch (err) {
        console.error("Failed to fetch pet context", err);
      }
    };
    fetchPetContext();
  }, [petId]);

  if (!data) {
    return (
      <ClientLayout active="dashboard">
        <div style={container}>
          <div style={card}>
            <h2 style={title}>Guide Missing</h2>
            <p style={{ textAlign: "center" }}>No specialized data available for "{breed}" yet.</p>
            <p style={{ textAlign: "center", marginTop: "1rem", color: "#666" }}>General {pet?.species || "pet"} care advice: Ensure regular vaccinations, high-quality nutrition, and annual vet checkups.</p>
            <button style={backBtn} onClick={() => window.history.back()}>Go Back</button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const ageKeys = Object.keys(data);

  return (
    <ClientLayout active="dashboard">
      <div style={container}>
        <div style={card}>

          <h1 style={title}>{pet ? `${pet.pet_name}'s ` : ""}{breed} Care Guide</h1>
          {pet && <p style={subtitle}>Personalized for a {pet.age_display || ""} {pet.species}</p>}

          {/* TABS */}
          <div style={tabs}>
            {ageKeys.map((age) => (
              <button
                key={age}
                onClick={() => setActiveTab(age)}
                style={{
                  ...tabBtn,
                  background:
                    activeTab === age ? "#6B8F71" : "#E5E7EB",
                  color:
                    activeTab === age ? "#fff" : "#1F2937",
                  fontWeight: activeTab === age ? "600" : "400"
                }}
              >
                {age.toUpperCase()}
                {activeTab === age && " *"}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div style={content}>
            {Object.entries(data[activeTab]).map(([key, value]) => (
              <div key={key} style={section}>
                <h3 style={sectionTitle}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </h3>
                <p style={sectionBody}>{value}</p>
              </div>
            ))}
          </div>

          <button style={backBtn} onClick={() => window.history.back()}>Back to Hub</button>
        </div>
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const container = {
  display: "flex",
  justifyContent: "center",
  padding: "4rem 2rem"
};

const card = {
  width: "100%",
  maxWidth: "700px",
  background: "#fff",
  padding: "3.5rem",
  borderRadius: "32px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)"
};

const title = {
  fontFamily: "'Outfit', sans-serif",
  textAlign: "center",
  fontSize: "2.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const subtitle = {
  textAlign: "center",
  color: "var(--slate-500)",
  marginBottom: "2.5rem",
  fontSize: "1rem",
  fontWeight: "500"
};

const tabs = {
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
  marginBottom: "3rem",
  background: "var(--slate-50)",
  padding: "0.5rem",
  borderRadius: "20px"
};

const tabBtn = {
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "700",
  transition: "all 0.2s"
};

const content = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const section = {
  background: "var(--slate-50)",
  padding: "1.5rem",
  borderRadius: "20px",
  border: "1px solid var(--slate-100)"
};

const sectionTitle = {
  fontFamily: "'Outfit', sans-serif",
  color: "var(--primary-green)",
  marginBottom: "0.75rem",
  fontSize: "1.1rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const sectionBody = {
  color: "var(--slate-600)",
  lineHeight: "1.7",
  fontSize: "1rem",
  margin: 0
};

const backBtn = {
  width: "100%",
  marginTop: "3rem",
  padding: "1.1rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "1rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s"
};

export default CareGuide;