function AddPet() {
  return (
    <div style={container}>
      <h1>Add New Pet 🐾</h1>

      <div style={card}>
        <input placeholder="Pet Name" style={input} />
        <input placeholder="Breed" style={input} />
        <input placeholder="Age" style={input} />

        <button style={btn}>Save</button>
      </div>
    </div>
  );
}

const container = {
  padding: "2rem",
  background: "#F7F9F7",
  minHeight: "100vh"
};

const card = {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const btn = {
  background: "#6B8F71",
  color: "white",
  border: "none",
  padding: "0.7rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const input = {
  display: "block",
  width: "100%",
  marginBottom: "1rem",
  padding: "0.6rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

export default AddPet;