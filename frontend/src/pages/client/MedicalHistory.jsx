function MedicalHistory() {
  return (
    <div style={container}>
      <h1>Medical History 🩺</h1>

      <div style={card}>
        <p>• Vaccination - 2024</p>
        <p>• Deworming - 2025</p>
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

export default MedicalHistory;

