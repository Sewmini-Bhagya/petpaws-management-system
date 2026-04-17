import { useNavigate } from "react-router-dom";
import homeImg from "../../assets/home.jpeg";

function MyPets() {
  const navigate = useNavigate();

  const pets = [
    { id: 1, name: "Windy", breed: "Labrador" },
    { id: 2, name: "Milo", breed: "Persian" }
  ];

  return (
    <div style={container}>
      
      {/* LEFT SIDE */}
      <div style={left}>
        <h1 style={title}>My Pets 🐾</h1>

        <div style={list}>
          {pets.map((pet) => (
            <div
              key={pet.id}
              style={petBtn}
              onClick={() => navigate(`/pets/${pet.id}`)}
            >
              {pet.name}
            </div>
          ))}

          {/* ADD NEW (same style) */}
          <div
            style={{ ...petBtn, background: "#fff", color: "#1F2937" }}
            onClick={() => navigate("/pets/add")}
          >
            + Add New
          </div>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div style={right}>
        <img src={homeImg} alt="pets" style={image} />
      </div>

    </div>
  );
}


const container = {
  display: "flex",
  height: "100vh",
  background: "#F7F9F7",
  padding: "2rem 4rem",   
  gap: "1.5rem",          
  alignItems: "center"
};

const left = {
  flex: 1.3,              
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

const right = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const title = {
  color: "#6B8F71",
  marginBottom: "2rem"
};

const list = {
  display: "flex",
  flexDirection: "column",
  gap: "1.2rem",
  width: "100%",          
  maxWidth: "400px"       
};

const petBtn = {
  padding: "1.2rem",
  background: "#6B8F71",
  color: "white",
  borderRadius: "14px",
  cursor: "pointer",
  textAlign: "center",
  fontWeight: "500",
  width: "100%",          
  fontSize: "1rem"
};

const image = {
  width: "100%",
  maxWidth: "450px",
  borderRadius: "20px",
  objectFit: "cover",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
};

export default MyPets;