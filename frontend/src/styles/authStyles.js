import bgImg from "../assets/background.jpeg";

/**
 * Authentication Design System
 * 
 * Orchestrates the visual language for the entry-level authentication suite.
 * Implements a high-fidelity split-screen architecture with refined
 * typography and premium interaction tokens.
 */

export const overlay = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `url(${bgImg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  padding: "1rem"
};

export const card = {
  display: "flex",
  width: "100%",
  maxWidth: "840px",
  minHeight: "540px",
  background: "white",
  borderRadius: "32px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.1)"
};

export const modalCard = {
  width: "100%",
  maxWidth: "460px",
  background: "white",
  borderRadius: "32px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
  padding: "3.5rem 2.5rem",
  display: "flex",
  flexDirection: "column",
  textAlign: "center"
};

export const left = {
  flex: 1,
  position: "relative",
  display: "flex"
};

export const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

export const right = {
  flex: 1.1,
  padding: "3rem 2.5rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  background: "white"
};

export const title = {
  fontFamily: "'Outfit', sans-serif",
  color: "var(--slate-900)",
  fontSize: "2.25rem",
  fontWeight: "800",
  marginBottom: "0.5rem",
  letterSpacing: "-0.02em"
};

export const subtitle = {
  marginBottom: "2rem",
  color: "var(--slate-500)",
  fontSize: "1rem",
  fontWeight: "500",
  lineHeight: "1.6"
};

export const form = {
  display: "flex",
  flexDirection: "column",
  gap: "1.2rem"
};

export const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

export const label = {
  fontSize: "0.85rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  paddingLeft: "0.2rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

export const input = {
  width: "100%",
  padding: "0.9rem 1.1rem",
  borderRadius: "16px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "1rem",
  color: "var(--slate-900)",
  transition: "all 0.25s",
  outline: "none",
  fontWeight: "600"
};

export const forgot = {
  fontSize: "0.9rem",
  color: "var(--primary-green)",
  textAlign: "right",
  cursor: "pointer",
  fontWeight: "700",
  marginTop: "-0.25rem",
  transition: "opacity 0.2s"
};

export const button = {
  marginTop: "1rem",
  padding: "1rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "1.1rem",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.2)"
};

export const text = {
  marginTop: "1.75rem",
  textAlign: "center",
  fontSize: "0.95rem",
  color: "var(--slate-500)",
  fontWeight: "500"
};

export const link = {
  color: "var(--primary-green)",
  fontWeight: "800",
  cursor: "pointer",
  marginLeft: "0.4rem",
  textDecoration: "none"
};