import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiEdit3, FiCamera, FiCheck, FiX, FiCalendar, FiActivity, FiShield, FiAlertTriangle } from "react-icons/fi";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";
import APP_CONFIG from "../../config/appConfig";
import ROUTES from "../../config/routes";

/**
 * PetProfile Component
 */
function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editForm, setEditForm] = useState({
    pet_name: "",
    date_of_birth: "",
    species: "",
    breed: "",
    gender: "",
    allergies: ""
  });

  const fetchPet = async () => {
    try {
      const res = await API.get(`/pets/${id}`);
      setPet(res.data);
      setEditForm({
        pet_name: res.data.pet_name,
        date_of_birth: res.data.date_of_birth?.split("T")[0],
        species: res.data.species,
        breed: res.data.breed,
        gender: res.data.gender,
        allergies: res.data.allergies || ""
      });
    } catch (err) {
      console.error("[PetProfile] Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [id]);

  const handleUpload = async () => {
    if (!image) return alert("Please select a photo first.");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      await API.post(`/pets/${id}/upload`, formData);
      alert("Profile photo synchronized.");
      setImage(null);
      fetchPet();
    } catch (err) {
      console.error("[PetProfile] Upload failed:", err);
      alert("Image synchronization failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/pets/${id}`, editForm);
      alert("Profile updated successfully.");
      setIsEditing(false);
      fetchPet();
    } catch (err) {
      console.error("[PetProfile] Update failed:", err);
      alert("Synchronization failed.");
    }
  };

  if (!pet) return <ClientLayout active="pets"><div style={loader}>Retrieving pet profile...</div></ClientLayout>;

  return (
    <ClientLayout active="pets">
      <header style={headerContainer}>
        <button style={backBtn} onClick={() => navigate(ROUTES.CLIENT.PETS)}>
          <FiChevronLeft /> Pet Gallery
        </button>
      </header>

      <div style={profileGrid}>
        {/* LEFT COLUMN: IDENTITY & MEDIA */}
        <aside style={mediaCol}>
          <div style={profilePhotoWrapper}>
            <img
              src={
                pet.profile_picture
                  ? `${APP_CONFIG.SERVER_URL}/uploads/pets/${pet.profile_picture}`
                  : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300"
              }
              alt={pet.pet_name}
              style={profileImage}
            />
            <div style={editPhotoBadge} onClick={() => document.getElementById('photoInput').click()}>
              <FiCamera size={18} />
            </div>
            <input
              type="file"
              id="photoInput"
              style={{ display: "none" }}
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <h2 style={displayName}>{pet.pet_name}</h2>
          <span style={speciesTag}>{pet.species}</span>

          {image && (
            <div style={uploadPreview}>
              <p style={previewText}>New photo: {image.name}</p>
              <button style={uploadBtn} onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Confirm Photo"}
              </button>
            </div>
          )}

          <div style={quickStats}>
            <div style={statItem}>
              <FiCalendar />
              <span>{new Date(pet.date_of_birth).toLocaleDateString()}</span>
            </div>
            <div style={statItem}>
              <FiActivity />
              <span>{pet.breed || "Mixed Breed"}</span>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: DETAILS & FORMS */}
        <main style={detailsCol}>
          <div style={sectionHeader}>
            <h3 style={sectionTitle}>Comprehensive Profile</h3>
            {!isEditing ? (
              <button style={actionBtn} onClick={() => setIsEditing(true)}>
                <FiEdit3 /> Edit Details
              </button>
            ) : (
              <div style={editActions}>
                <button style={saveBtn} onClick={handleUpdate}><FiCheck /> Save</button>
                <button style={cancelBtn} onClick={() => setIsEditing(false)}><FiX /> Cancel</button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div style={infoMatrix}>
              <div style={infoCard}>
                <label style={infoLabel}>Pet Identity</label>
                <div style={infoValue}>{pet.pet_name}</div>
              </div>
              <div style={infoCard}>
                <label style={infoLabel}>Biological Age</label>
                <div style={infoValue}>{calculateAge(pet.date_of_birth)} old</div>
              </div>
              <div style={infoCard}>
                <label style={infoLabel}>Primary Classification</label>
                <div style={infoValue}>{pet.species}</div>
              </div>
              <div style={infoCard}>
                <label style={infoLabel}>Breed / Heritage</label>
                <div style={infoValue}>{pet.breed || "Mixed Heritage"}</div>
              </div>
              <div style={infoCard}>
                <label style={infoLabel}>Gender</label>
                <div style={infoValue}>{pet.gender}</div>
              </div>

              {pet.allergies && (
                <div style={{ ...allergyAlert, gridColumn: "span 2" }}>
                  <div style={alertIcon}><FiAlertTriangle /></div>
                  <div style={alertContent}>
                    <span style={alertTitle}>Critical Allergy Protocol</span>
                    <span style={alertValue}>{pet.allergies}</span>
                  </div>
                </div>
              )}

              <div style={clinicalLinks}>
                <button style={outlineBtn} onClick={() => navigate(`/pets/${id}/history`)}>
                  <FiShield /> View Medical History
                </button>
                <button style={outlineBtn} onClick={() => navigate(`/pets/${id}/records`)}>
                  <FiActivity /> Access Clinical Records
                </button>
              </div>
            </div>
          ) : (
            <div style={editMatrix}>
              <div style={fieldGroup}>
                <label style={fieldLabel}>Pet Name</label>
                <input style={fieldInput} value={editForm.pet_name} onChange={e => setEditForm({ ...editForm, pet_name: e.target.value })} />
              </div>
              <div style={fieldGroup}>
                <label style={fieldLabel}>Birth Date</label>
                <input style={fieldInput} type="date" value={editForm.date_of_birth} onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })} />
              </div>
              <div style={fieldGroup}>
                <label style={fieldLabel}>Species</label>
                <input style={fieldInput} value={editForm.species} onChange={e => setEditForm({ ...editForm, species: e.target.value })} />
              </div>
              <div style={fieldGroup}>
                <label style={fieldLabel}>Breed</label>
                <input style={fieldInput} value={editForm.breed} onChange={e => setEditForm({ ...editForm, breed: e.target.value })} />
              </div>
              <div style={{ ...fieldGroup, gridColumn: "span 2" }}>
                <label style={fieldLabel}>Medical Allergies</label>
                <textarea style={fieldTextarea} value={editForm.allergies} onChange={e => setEditForm({ ...editForm, allergies: e.target.value })} />
              </div>
            </div>
          )}
        </main>
      </div>
    </ClientLayout>
  );
}

/**
 * Utility to compute the age string from a DOB.
 */
function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years}y ${months}m`;
}

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "2rem"
};

const backBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "transparent",
  border: "none",
  color: "var(--slate-500)",
  fontSize: "0.95rem",
  fontWeight: "700",
  cursor: "pointer",
  transition: "color 0.2s"
};

const profileGrid = {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  gap: "4rem",
  alignItems: "flex-start"
};

const mediaCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
};

const profilePhotoWrapper = {
  position: "relative",
  marginBottom: "1.5rem"
};

const profileImage = {
  width: "220px",
  height: "220px",
  borderRadius: "64px",
  objectFit: "cover",
  border: "8px solid white",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
};

const editPhotoBadge = {
  position: "absolute",
  bottom: "10px",
  right: "10px",
  width: "48px",
  height: "48px",
  background: "var(--primary-green)",
  color: "white",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: "4px solid white",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.3)"
};

const displayName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.25rem"
};

const speciesTag = {
  fontSize: "0.9rem",
  fontWeight: "800",
  color: "var(--primary-green)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "rgba(107, 143, 113, 0.1)",
  padding: "0.4rem 1rem",
  borderRadius: "12px"
};

const uploadPreview = {
  marginTop: "1.5rem",
  width: "100%",
  padding: "1rem",
  background: "white",
  borderRadius: "16px",
  border: "1px solid var(--slate-100)"
};

const previewText = {
  fontSize: "0.8rem",
  color: "var(--slate-500)",
  marginBottom: "0.75rem",
  wordBreak: "break-all"
};

const uploadBtn = {
  width: "100%",
  padding: "0.75rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "700",
  cursor: "pointer"
};

const quickStats = {
  marginTop: "2rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "100%"
};

const statItem = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "var(--slate-500)",
  fontSize: "0.9rem",
  fontWeight: "600"
};

const detailsCol = {
  background: "white",
  borderRadius: "32px",
  padding: "3rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)",
  border: "1px solid var(--slate-100)"
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2.5rem"
};

const sectionTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const actionBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "var(--slate-50)",
  color: "var(--slate-600)",
  border: "none",
  padding: "0.6rem 1.25rem",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s"
};

const infoMatrix = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem"
};

const infoCard = {
  background: "var(--slate-50)",
  padding: "1.5rem",
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem"
};

const infoLabel = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center"
};

const infoValue = {
  fontSize: "1.1rem",
  fontWeight: "700",
  color: "var(--slate-800)"
};

const allergyAlert = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  background: "#EF4444",
  color: "white",
  padding: "1.25rem 1.5rem",
  borderRadius: "24px",
  boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.1)"
};

const alertIcon = {
  fontSize: "1.5rem",
  display: "flex"
};

const alertContent = {
  display: "flex",
  flexDirection: "column"
};

const alertTitle = {
  fontSize: "0.7rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  opacity: 0.9
};

const alertValue = {
  fontSize: "1.2rem",
  fontWeight: "900",
  fontFamily: "'Outfit', sans-serif"
};

const clinicalLinks = {
  gridColumn: "span 2",
  display: "flex",
  gap: "1rem",
  marginTop: "1rem"
};

const outlineBtn = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  background: "white",
  border: "2px solid var(--slate-100)",
  padding: "1.25rem",
  borderRadius: "16px",
  color: "var(--slate-700)",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s"
};

const editMatrix = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem"
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const fieldLabel = {
  fontSize: "0.85rem",
  fontWeight: "700",
  color: "var(--slate-500)",
  textTransform: "uppercase"
};

const fieldInput = {
  padding: "1rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-200)",
  fontSize: "1rem",
  outline: "none"
};

const fieldTextarea = {
  padding: "1rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-200)",
  fontSize: "1rem",
  outline: "none",
  minHeight: "100px",
  resize: "none"
};

const editActions = {
  display: "flex",
  gap: "0.75rem"
};

const saveBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  padding: "0.6rem 1.25rem",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer"
};

const cancelBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "var(--slate-100)",
  color: "var(--slate-600)",
  border: "none",
  padding: "0.6rem 1.25rem",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer"
};

const loader = {
  padding: "5rem",
  textAlign: "center",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

export default PetProfile;