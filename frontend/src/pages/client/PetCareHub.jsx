import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiStar, FiChevronRight, FiHeart } from "react-icons/fi";
import { FaPaw } from "react-icons/fa";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";
import ROUTES from "../../config/routes";

/**
 * PetCareHub Component
 */
function PetCareHub() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await API.get("/pets");
        setPets(res.data);
        if (res.data.length > 0) {
          setSelectedPetId(res.data[0].pet_id);
        }
      } catch (err) {
        console.error("[CareHub] synchronization failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPets();
  }, []);

  /**
   * Routes the user to the dynamically synthesized care guide.
   */
  const handleViewGuide = () => {
    if (!selectedPetId) return alert("Security: Please authorize a pet profile selection.");

    const selectedPet = pets.find(p => p.pet_id === parseInt(selectedPetId));
    if (selectedPet) {
      const sanitizedBreed = selectedPet.breed ? selectedPet.breed.trim() : "Unknown";
      navigate(`/care-guide/${sanitizedBreed}?petId=${selectedPet.pet_id}`);
    }
  };

  return (
    <ClientLayout active="dashboard">
      <div style={pageWrapper}>
        <div style={contentCard}>
          <div style={visualHeader}>
            <div style={iconBadge}><FiBookOpen /></div>
            <h2 style={titleStyle}>Pet Care Intelligence</h2>
            <p style={subtitleStyle}>Synthesizing personalized care protocols based on clinical history and breed heritage.</p>
          </div>

          {isLoading ? (
            <div style={loaderStyle}>Synchronizing profiles...</div>
          ) : pets.length === 0 ? (
            <div style={emptyContainer}>
              <div style={emptyIcon}><FaPaw size={48} /></div>
              <p style={emptyText}>No active pet profiles found. Create a profile to access care intelligence.</p>
              <button style={primaryBtn} onClick={() => navigate(ROUTES.CLIENT.ADD_PET)}>Initialize Pet Profile</button>
            </div>
          ) : (
            <div style={formWrapper}>
              <div style={fieldGroup}>
                <label style={labelStyle}>Identity Selection</label>
                <div style={selectWrapper}>
                  <select
                    style={selectInput}
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                  >
                    {pets.map(pet => (
                      <option key={pet.pet_id} value={pet.pet_id}>
                        {pet.pet_name} — {pet.breed || "Biological Heritage Unknown"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={insightBanner}>
                <div style={insightIcon}><FiStar /></div>
                <div style={insightText}>
                  Our algorithms analyze clinical records to tailor nutritional, behavioral, and preventative health insights specifically for your pet.
                </div>
              </div>

              <button
                style={primaryBtn}
                onClick={handleViewGuide}
              >
                Synthesize Care Guide <FiChevronRight />
              </button>
            </div>
          )}

          <div style={footerVisual}>
            <FiHeart style={{ color: "var(--primary-green)", opacity: 0.5 }} />
            <span>Powered by PetPaws Veterinary Intelligence</span>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const pageWrapper = {
  display: "flex",
  justifyContent: "center",
  padding: "4rem 0"
};

const contentCard = {
  width: "100%",
  maxWidth: "540px",
  background: "white",
  padding: "4rem",
  borderRadius: "32px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)",
  textAlign: "center"
};

const visualHeader = {
  marginBottom: "3rem"
};

const iconBadge = {
  width: "64px",
  height: "64px",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.75rem",
  margin: "0 auto 1.5rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.75rem"
};

const subtitleStyle = {
  color: "var(--slate-500)",
  fontSize: "1rem",
  lineHeight: "1.6",
  maxWidth: "360px",
  margin: "0 auto"
};

const formWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  textAlign: "left"
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const selectWrapper = {
  position: "relative"
};

const selectInput = {
  width: "100%",
  padding: "1.25rem",
  borderRadius: "18px",
  border: "1px solid var(--slate-200)",
  fontSize: "1.05rem",
  fontWeight: "700",
  color: "var(--slate-800)",
  background: "var(--slate-50)",
  cursor: "pointer",
  appearance: "none",
  outline: "none"
};

const insightBanner = {
  background: "rgba(107, 143, 113, 0.05)",
  padding: "1.5rem",
  borderRadius: "20px",
  display: "flex",
  gap: "1rem",
  alignItems: "flex-start",
  border: "1px solid rgba(107, 143, 113, 0.1)"
};

const insightIcon = {
  color: "var(--primary-green)",
  fontSize: "1.25rem",
  flexShrink: 0
};

const insightText = {
  fontSize: "0.9rem",
  lineHeight: "1.5",
  color: "var(--slate-600)",
  fontWeight: "500"
};

const primaryBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  padding: "1.25rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "18px",
  fontSize: "1.1rem",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
  transition: "all 0.2s"
};

const emptyContainer = {
  padding: "2rem 0"
};

const emptyIcon = {
  color: "var(--slate-100)",
  marginBottom: "1.5rem"
};

const emptyText = {
  color: "var(--slate-400)",
  fontSize: "1.1rem",
  marginBottom: "2rem"
};

const footerVisual = {
  marginTop: "4rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  fontSize: "0.8rem",
  fontWeight: "700",
  color: "var(--slate-300)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const loaderStyle = {
  padding: "3rem",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

export default PetCareHub;