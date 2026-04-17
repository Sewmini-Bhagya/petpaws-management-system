import { useParams, useNavigate } from "react-router-dom";
import pfp from "../../assets/pfpexample.jpeg";

function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={overlay}>
      <div style={card}>

        {/* LEFT - IMAGE */}
        <div style={left}>
          <img src={pfp} alt="pet" style={image} />
          <p style={uploadText}>Upload Photo</p>
        </div>

        {/* RIGHT - CONTENT */}
        <div style={right}>
          
          <h2 style={title}>Pet Profile 🐾</h2>

          <div style={infoCard}>
            <h3 style={{ marginBottom: "0.8rem" }}>Windy</h3>

            <p><strong>Date of Birth:</strong> 19/01/2025</p>
            <p><strong>Species:</strong> Cat</p>
            <p><strong>Breed:</strong> Mixed</p>
            <p><strong>Gender:</strong> Female</p>
          </div>

          {/* ACTION BUTTONS */}
          <div style={btnGroup}>
            <button style={btn}>Update Info</button>

            <button
              style={btn}
              onClick={() => navigate(`/pets/${id}/history`)}
            >
              Medical History
            </button>

            <button
              style={btn}
              onClick={() => navigate(`/pets/${id}/records`)}
            >
              Medical Records
            </button>

            <button style={btnSecondary}>
              Upload External Records
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

const overlay = {
  height: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "rgba(0,0,0,0.08)"
};

const card = {
  display: "flex",
  width: "850px",
  height: "480px",
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  overflow: "hidden"
};

const left = {
  flex: 1,
  background: "#F3F4F6",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "1rem"
};

const image = {
  width: "160px",
  height: "160px",
  borderRadius: "50%",
  objectFit: "cover",
  boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
};

const uploadText = {
  fontSize: "0.85rem",
  color: "#6B8F71",
  cursor: "pointer"
};

const right = {
  flex: 1.3,
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center"
};

const title = {
  color: "#6B8F71",
  marginBottom: "1rem",
  marginTop: "0.5rem",   
  textAlign: "center"
};

const infoCard = {
  background: "#F9FAFB",
  padding: "0.1rem 0.1rem",
  borderRadius: "10px",
  marginBottom: "0.5rem",
  width: "70%",
  lineHeight: "1.1"
};

const btnGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem"
};

const btn = {
  padding: "0.6rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%"   
};

const btnSecondary = {
  padding: "0.6rem",
  background: "#E5E7EB",
  color: "#1F2937",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%"
};

export default PetProfile;