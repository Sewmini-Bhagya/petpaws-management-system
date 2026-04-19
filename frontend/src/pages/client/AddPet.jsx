import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import bg from "../../assets/background.jpeg";

function AddPet() {
  const [petName, setPetName] = useState("");
  const [dob, setDob] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [preview, setPreview] = useState(null);

  const handleImage = (e) => {
  const selected = e.target.files[0];

  if (selected) {
    setPreview(URL.createObjectURL(selected));
  }
};

  const handleSave = () => {
    alert(`${petName || "Pet"} added successfully 🐾`);
  };

  return (
    <div style={overlay}>
      <div style={card}>

        <h1 style={title}>Add New Pet 🐾</h1>

        {/* PROFILE IMAGE */}
        <label style={label}>Profile Picture</label>

        <div style={imageWrapper}>
          <label style={circle}>
            {preview ? (
              <img src={preview} alt="preview" style={circleImg} />
            ) : (
              <span style={plus}>+</span>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div style={form}>

          <div>
            <label style={label}>Pet Name</label>
            <input
              style={input}
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
            />
          </div>

          {/* DATE */}
          <label style={label}>Date of Birth</label>
          <DatePicker
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select date"
            customInput={<input style={input} />}
          />

          <div>
            <label style={label}>Species</label>
            <input
              placeholder="e.g. Dog"
              style={input}
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Breed</label>
            <input
              style={input}
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Gender</label>
            <select
              style={input}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <button style={btn} onClick={handleSave}>
            Save Pet
          </button>

        </div>
      </div>
    </div>
  );
}

/* STYLES */

const baseFont = "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif";

const overlay = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `url(${bg})`,
  backgroundSize: "cover",
  backgroundPosition: "center"
};

const card = {
  height: "80vh",
  width: "420px",
  padding: "2rem",
  background: "rgba(255,255,255,0.95)",
  borderRadius: "16px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
};

const title = {
  textAlign: "center",
  color: "#6B8F71",
  marginBottom: "1rem",
  marginTop: "0.5rem"
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem"
};

const label = {
  fontSize: "0.85rem",
  color: "#555",
  marginBottom: "2px",
  fontFamily: baseFont
};

const input = {
  width: "100%",
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const btn = {
  marginTop: "0.5rem",
  padding: "0.8rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width:"30%",
  alignSelf: "center"
};

/* PROFILE IMAGE */

const imageWrapper = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "1rem"
};

const circle = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  border: "2px dashed #6B8F71",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  overflow: "hidden"
};

const plus = {
  fontSize: "2rem",
  color: "#6B8F71"
};

const circleImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

export default AddPet;