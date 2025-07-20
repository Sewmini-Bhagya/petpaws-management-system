import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiPlus, FiArrowRight, FiInfo } from "react-icons/fi";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";
import ROUTES from "../../config/routes";
import APP_CONFIG from "../../config/appConfig";

/**
 * MyPets Component
 */
function MyPets() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await API.get("/pets");
        setPets(res.data);
      } catch (err) {
        console.error("[MyPets] Fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  return (
    <ClientLayout active="pets">
      <header style={headerContainer}>
        <div>
          <h1 style={titleStyle}>My Pet Family</h1>
          <p style={subtitleStyle}>Manage profiles and medical records for your furry companions.</p>
        </div>
        <button style={primaryBtn} onClick={() => navigate(ROUTES.CLIENT.ADD_PET)}>
          <FiPlus /> Register New Pet
        </button>
      </header>

      {isLoading ? (
        <div style={loader}>Synchronizing pet directory...</div>
      ) : pets.length === 0 ? (
        <div style={emptyState}>
          <div style={emptyIcon}><FiInfo size={40} /></div>
          <h2 style={emptyTitle}>No pets registered yet</h2>
          <p style={emptyText}>Start your journey by adding your first pet to the PetPaws registry.</p>
          <button style={emptyBtn} onClick={() => navigate(ROUTES.CLIENT.ADD_PET)}>Add Pet Now</button>
        </div>
      ) : (
        <div style={petGrid}>
          {pets.map((pet) => (
            <div
              key={pet.pet_id}
              style={petCard}
              onClick={() => navigate(`/pets/${pet.pet_id}`)}
            >
              <div style={cardImageWrapper}>
                <img
                  src={
                    pet.profile_picture
                      ? `${APP_CONFIG.SERVER_URL}/uploads/pets/${pet.profile_picture}`
                      : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300"
                  }
                  alt={pet.pet_name}
                  style={petImg}
                />
                <div style={cardBadge}>{pet.species}</div>
              </div>

              <div style={cardBody}>
                <div style={cardHeader}>
                  <h3 style={petName}>{pet.pet_name}</h3>
                  <div style={arrowBtn}><FiArrowRight /></div>
                </div>
                <div style={petDetails}>
                  <div style={detailItem}>
                    <span style={detailLabel}>Breed</span>
                    <span style={detailValue}>{pet.breed || "Mixed"}</span>
                  </div>
                  <div style={detailItem}>
                    <span style={detailLabel}>Gender</span>
                    <span style={detailValue}>{pet.gender || "Not specified"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* ADD NEW PLACEHOLDER CARD */}
          <div style={addPetCard} onClick={() => navigate(ROUTES.CLIENT.ADD_PET)}>
            <div style={addIconCircle}><FiPlus size={32} /></div>
            <span style={addText}>Add Another Pet</span>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "3rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const subtitleStyle = {
  color: "var(--slate-500)",
  fontSize: "1.1rem"
};

const primaryBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  padding: "0.9rem 1.5rem",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.2)",
  transition: "transform 0.2s"
};

const petGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "2rem"
};

const petCard = {
  background: "white",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
  border: "1px solid var(--slate-100)",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
};

const cardImageWrapper = {
  height: "220px",
  position: "relative",
  overflow: "hidden"
};

const petImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.5s ease"
};

const cardBadge = {
  position: "absolute",
  top: "1.25rem",
  right: "1.25rem",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(4px)",
  padding: "0.4rem 0.8rem",
  borderRadius: "10px",
  fontSize: "0.75rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  textTransform: "uppercase"
};

const cardBody = {
  padding: "1.5rem"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.25rem"
};

const petName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.4rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const arrowBtn = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "var(--slate-50)",
  color: "var(--slate-400)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s"
};

const petDetails = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem"
};

const detailItem = {
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem"
};

const detailLabel = {
  fontSize: "0.7rem",
  color: "var(--slate-400)",
  fontWeight: "700",
  textTransform: "uppercase"
};

const detailValue = {
  fontSize: "0.9rem",
  color: "var(--slate-700)",
  fontWeight: "600"
};

const addPetCard = {
  background: "transparent",
  border: "2px dashed var(--slate-200)",
  borderRadius: "28px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  cursor: "pointer",
  minHeight: "350px",
  transition: "all 0.2s"
};

const addIconCircle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: "var(--slate-100)",
  color: "var(--slate-400)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s"
};

const addText = {
  fontSize: "1rem",
  fontWeight: "700",
  color: "var(--slate-400)"
};

const emptyState = {
  textAlign: "center",
  padding: "6rem 2rem",
  background: "white",
  borderRadius: "32px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
  border: "1px solid var(--slate-100)"
};

const emptyIcon = {
  color: "var(--slate-200)",
  marginBottom: "1.5rem"
};

const emptyTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const emptyText = {
  color: "var(--slate-500)",
  fontSize: "1.1rem",
  maxWidth: "400px",
  margin: "0 auto 2rem"
};

const emptyBtn = {
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  padding: "1rem 2.5rem",
  borderRadius: "14px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.2)"
};

const loader = {
  textAlign: "center",
  padding: "5rem",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

export default MyPets;