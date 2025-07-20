import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCamera, FiPlus, FiChevronLeft } from "react-icons/fi";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";
import ROUTES from "../../config/routes";

/**
 * AddPet Component
 */
function AddPet() {
  const navigate = useNavigate();
  const [petName, setPetName] = useState("");
  const [dob, setDob] = useState(null);
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [preview, setPreview] = useState(null);
  const [allergies, setAllergies] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handles local image selection and preview generation.
   */
  const handleImage = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const formatDateLocal = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Orchestrates the pet creation and image upload workflow.
   */
  const handleSave = async () => {
    if (!petName || !dob || !species || !breed || !gender) {
      alert("Please complete all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await API.post("/pets", {
        pet_name: petName,
        date_of_birth: formatDateLocal(dob),
        species,
        breed,
        gender
      });

      const petId = res.data.pet_id;

      if (preview) {
        const formData = new FormData();
        const fileInput = document.querySelector('input[type="file"]');
        formData.append("image", fileInput.files[0]);

        await API.post(`/pets/${petId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      alert("Your pet has been registered successfully!");
      navigate(ROUTES.CLIENT.PETS);
    } catch (err) {
      console.error("[AddPet] Registration failed:", err);
      alert(err.response?.data?.message || "Failed to register pet.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ClientLayout active="pets">
      <header style={headerContainer}>
        <button style={backBtn} onClick={() => navigate(ROUTES.CLIENT.PETS)}>
          <FiChevronLeft /> Back to Gallery
        </button>
        <h1 style={titleStyle}>Register New Pet</h1>
        <p style={subtitleStyle}>Complete the profile to begin tracking their health journey.</p>
      </header>

      <div style={formWrapper}>
        <div style={formCard}>
          {/* PROFILE IMAGE UPLOAD */}
          <div style={imageUploadSection}>
            <label style={imageLabel}>
              <div style={imageCircle}>
                {preview ? (
                  <img src={preview} alt="preview" style={circleImg} />
                ) : (
                  <div style={placeholderIcon}><FiCamera size={32} /></div>
                )}
                <div style={addBadge}><FiPlus size={16} /></div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ display: "none" }}
              />
            </label>
            <span style={imageHelper}>Upload Profile Picture</span>
          </div>

          <div style={formGrid}>
            <div style={inputGroup}>
              <label style={labelStyle}>Pet Name *</label>
              <input
                placeholder="e.g. Buddy"
                style={inputStyle}
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Date of Birth *</label>
              <DatePicker
                selected={dob}
                onChange={(date) => setDob(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select DOB"
                maxDate={new Date()}
                customInput={<input style={inputStyle} />}
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Species *</label>
              <select
                style={inputStyle}
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              >
                <option value="">Select Species</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Breed *</label>
              <input
                placeholder="e.g. Golden Retriever"
                style={inputStyle}
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Gender *</label>
              <select
                style={inputStyle}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div style={{ ...inputGroup, gridColumn: "span 2" }}>
              <label style={labelStyle}>Medical Allergies / Notes</label>
              <textarea
                placeholder="Specify any food or medicine allergies..."
                style={textareaStyle}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
          </div>

          <button
            style={{
              ...saveBtn,
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? "wait" : "pointer"
            }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving Profile..." : "Register Pet Profile"}
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "3rem",
  textAlign: "center"
};

const backBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "transparent",
  border: "none",
  color: "var(--slate-500)",
  fontSize: "0.9rem",
  fontWeight: "700",
  cursor: "pointer",
  margin: "0 auto 1.5rem",
  transition: "color 0.2s"
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

const formWrapper = {
  display: "flex",
  justifyContent: "center"
};

const formCard = {
  width: "100%",
  maxWidth: "700px",
  background: "white",
  borderRadius: "32px",
  padding: "3rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)"
};

const imageUploadSection = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "3rem"
};

const imageLabel = {
  cursor: "pointer",
  position: "relative"
};

const imageCircle = {
  width: "140px",
  height: "140px",
  borderRadius: "42px",
  background: "var(--slate-50)",
  border: "2px dashed var(--slate-200)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  transition: "all 0.2s"
};

const placeholderIcon = {
  color: "var(--slate-300)"
};

const circleImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const addBadge = {
  position: "absolute",
  bottom: "-5px",
  right: "-5px",
  width: "32px",
  height: "32px",
  background: "var(--primary-green)",
  color: "white",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "4px solid white",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
};

const imageHelper = {
  fontSize: "0.85rem",
  color: "var(--slate-400)",
  fontWeight: "700",
  textTransform: "uppercase",
  marginTop: "1rem",
  letterSpacing: "0.02em"
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem"
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const labelStyle = {
  fontSize: "0.85rem",
  fontWeight: "700",
  color: "var(--slate-600)",
  textTransform: "uppercase"
};

const inputStyle = {
  padding: "1rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-200)",
  fontSize: "0.95rem",
  color: "var(--slate-900)",
  outline: "none",
  background: "white",
  transition: "border-color 0.2s"
};

const textareaStyle = {
  padding: "1rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-200)",
  fontSize: "0.95rem",
  color: "var(--slate-900)",
  outline: "none",
  background: "white",
  minHeight: "100px",
  resize: "none",
  fontFamily: "inherit"
};

const saveBtn = {
  width: "100%",
  marginTop: "2.5rem",
  padding: "1.25rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "18px",
  fontSize: "1.1rem",
  fontWeight: "800",
  boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
  transition: "all 0.2s"
};

export default AddPet;