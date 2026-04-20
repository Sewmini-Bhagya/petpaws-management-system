import bgImg from "../assets/background.jpeg";

export const overlay = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `url(${bgImg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative"
};


export const card = {
  display: "flex",
  width: "900px",
  height: "520px",
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
  overflow: "hidden"
};

export const left = {
  flex: 1
};

export const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

export const right = {
  flex: 1,
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

export const form = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem"
};

export const input = {
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

export const forgot = {
  fontSize: "0.8rem",
  color: "#6B8F71",
  textAlign: "right",
  cursor: "pointer"
};

export const button = {
  marginTop: "0.8rem",
  padding: "0.8rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

export const text = {
  marginTop: "1.2rem",
  textAlign: "center"
};

export const link = {
  color: "#6B8F71",
  fontWeight: "bold",
  cursor: "pointer"
};

export const title = {
  color: "#6B8F71",
  marginBottom: "0.3rem"
};

export const subtitle = {
  marginBottom: "1.2rem",
  color: "#666",
  fontSize: "0.9rem"
};