/**
 * Admin Dashboard Styles
 * 
 * Centralized style definitions for the Admin portal's main overview page.
 * Uses a two-column grid for metrics and real-time feedback.
 */

export const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "2.5rem",
  marginTop: "2rem",
};

export const title = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "#0F172A",
  marginBottom: "1.5rem",
};

export const section = {
  marginBottom: "3rem",
};

export const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
};

export const listCard = {
  background: "#fff",
  padding: "1.25rem",
  borderRadius: "16px",
  marginBottom: "1rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  borderLeft: "5px solid #6B8F71",
  transition: "transform 0.2s",
};

export const feedbackCard = {
  background: "#fff",
  padding: "1.25rem",
  borderRadius: "16px",
  marginBottom: "1rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

export const cardRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.5rem",
};

export const cardContent = {
  fontSize: "0.95rem",
  color: "#475569",
  lineHeight: "1.6",
};

export const actionGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
  marginTop: "1.5rem",
};

export const actionBtn = {
  padding: "1.25rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "16px",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "700",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.2)",
  transition: "all 0.2s",
};

export const reportGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "1.25rem",
  marginTop: "1.25rem",
};

export const reportCard = {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "20px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
  textAlign: "center",
  border: "1px solid #F1F5F9"
};

export const metricTitle = {
  fontSize: "0.8rem",
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: "700",
  marginBottom: "0.75rem",
};

export const metricValue = {
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "#1E293B",
};

export const btnSmall = {
  padding: "0.6rem 1.2rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.85rem"
};

export const mutedText = {
  color: "#94A3B8",
  fontSize: "0.85rem",
};

export const errorText = {
  color: "#EF4444",
  fontSize: "0.9rem",
  marginTop: "1.5rem",
  fontWeight: "500"
};
