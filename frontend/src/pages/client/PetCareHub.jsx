import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PetCareHub() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Pet Care Hub 🐾</h2>

        <div style={form}>
          <label>Species</label>
          <select
            style={input}
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            <option>Dog</option>
            <option>Cat</option>
          </select>

          <label>Breed</label>
          <input
            type="text"
            placeholder="Enter breed (e.g. Labrador)"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            style={input}
          />

          <button
            style={mainBtn}
            onClick={() => navigate(`/care-guide/${breed}`)}
          >
            View Care Guide
          </button>
        </div>
      </div>
    </div>
  );
}

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#F7F9F7"
};

const card = {
  width: "450px",
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

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const input = {
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const mainBtn = {
  marginTop: "1rem",
  padding: "0.8rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer"
};

export default PetCareHub;