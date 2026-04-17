import { useParams } from "react-router-dom";
import { useState } from "react";
import { breedData } from "../../data/breeds";

function CareGuide() {
  const { breed } = useParams();
  const data = breedData[breed];

  const [activeTab, setActiveTab] = useState("puppy");

  if (!data) {
    return (
      <div style={container}>
        <h2>No data available for "{breed}" 😢</h2>
      </div>
    );
  }

  // detect correct age keys (dog vs cat)
  const ageKeys = Object.keys(data);

  return (
    <div style={container}>
      <div style={card}>
        
        <h1 style={title}>{breed} Care Guide 🐾</h1>

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
                  activeTab === age ? "#fff" : "#1F2937"
              }}
            >
              {age.toUpperCase()}
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
              <p>{value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#F7F9F7",
  padding: "2rem"
};

const card = {
  width: "500px",
  background: "#fff",
  padding: "2rem",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
};

const title = {
  textAlign: "center",
  color: "#6B8F71",
  marginBottom: "1.5rem"
};

const tabs = {
  display: "flex",
  justifyContent: "center",
  gap: "0.5rem",
  marginBottom: "1.5rem"
};

const tabBtn = {
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "0.2s"
};

const content = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const section = {
  background: "#F9FAFB",
  padding: "1rem",
  borderRadius: "10px"
};

const sectionTitle = {
  color: "#6B8F71",
  marginBottom: "0.3rem"
};

export default CareGuide;