import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { FiStar, FiCheckCircle, FiChevronLeft, FiMessageCircle } from "react-icons/fi";
import { FaPaw } from "react-icons/fa";
import ClientLayout from "../../components/client/ClientLayout";
import ROUTES from "../../config/routes";

/**
 * FeedbackForm Component
 */
function FeedbackForm() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Dispatches the feedback payload to the administrative audit logs.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await API.post("/feedback", {
        appointment_id: appointmentId || null,
        rating,
        comments
      });
      setSubmitted(true);
    } catch (err) {
      console.error("[Feedback] Submission failed:", err);
      alert("Synchronization failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <ClientLayout active="feedback">
        <div style={container}>
          <div style={successCard}>
            <div style={successIconWrapper}>
              <FiCheckCircle size={80} />
            </div>
            <h2 style={titleStyle}>Feedback Received</h2>
            <p style={subtitleStyle}>Your insights help us elevate the standard of care for our community.</p>
            <button style={primaryBtn} onClick={() => navigate(ROUTES.CLIENT.DASHBOARD)}>Return to Dashboard</button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout active="feedback">
      <header style={headerContainer}>
        <button style={backBtn} onClick={() => navigate(ROUTES.CLIENT.DASHBOARD)}>
          <FiChevronLeft /> Dashboard
        </button>
      </header>

      <div style={container}>
        <div style={formCard}>
          <div style={logoWrapper}>
            <FaPaw size={28} />
            <span style={brandName}>PetPaws Quality Assurance</span>
          </div>

          <h2 style={titleStyle}>Review Your Visit</h2>
          <p style={subtitleStyle}>{appointmentId ? `Tell us about your experience during appointment #${appointmentId}` : "Tell us about your overall experience with the PetPaws clinic"}</p>

          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={ratingSection}>
              <label style={labelStyle}>Global Satisfaction</label>
              <div style={starTrack}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    size={42}
                    onClick={() => setRating(s)}
                    style={{
                      cursor: "pointer",
                      fill: s <= rating ? "#FBBF24" : "none",
                      color: s <= rating ? "#FBBF24" : "var(--slate-200)",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: s <= rating ? "scale(1.1)" : "scale(1)"
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={commentSection}>
              <label style={labelStyle}>Additional Observations</label>
              <div style={textareaWrapper}>
                <FiMessageCircle style={textareaIcon} />
                <textarea
                  style={textareaStyle}
                  placeholder="Share details about the service, facilities, or medical staff..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            </div>

            <button style={submitBtn} type="submit" disabled={isLoading}>
              {isLoading ? "Synchronizing..." : "Submit Quality Report"}
            </button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "1rem"
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
  cursor: "pointer"
};

const container = {
  display: "flex",
  justifyContent: "center",
  padding: "3rem 0"
};

const formCard = {
  width: "100%",
  maxWidth: "600px",
  background: "white",
  padding: "4rem",
  borderRadius: "32px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)",
  textAlign: "center"
};

const successCard = {
  ...formCard,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem"
};

const logoWrapper = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  color: "var(--primary-green)",
  marginBottom: "2.5rem"
};

const brandName = {
  fontSize: "0.9rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--slate-400)"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.25rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "1rem"
};

const subtitleStyle = {
  color: "var(--slate-500)",
  fontSize: "1.1rem",
  lineHeight: "1.6",
  marginBottom: "3rem",
  maxWidth: "400px",
  margin: "0 auto 3rem"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem",
  textAlign: "left"
};

const labelStyle = {
  fontSize: "0.85rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "1rem"
};

const starTrack = {
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
  background: "var(--slate-50)",
  padding: "2rem",
  borderRadius: "24px"
};

const textareaWrapper = {
  position: "relative"
};

const textareaIcon = {
  position: "absolute",
  top: "1.25rem",
  left: "1.25rem",
  color: "var(--slate-300)",
  fontSize: "1.2rem"
};

const textareaStyle = {
  width: "100%",
  minHeight: "160px",
  padding: "1.25rem 1.25rem 1.25rem 3.5rem",
  borderRadius: "20px",
  border: "1px solid var(--slate-200)",
  background: "white",
  fontSize: "1rem",
  color: "var(--slate-900)",
  outline: "none",
  resize: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s"
};

const submitBtn = {
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  padding: "1.25rem",
  borderRadius: "18px",
  fontSize: "1.1rem",
  fontWeight: "800",
  cursor: "pointer",
  width: "100%",
  boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
  transition: "all 0.2s"
};

const primaryBtn = {
  ...submitBtn,
  width: "auto",
  padding: "1.25rem 3rem"
};

const successIconWrapper = {
  color: "var(--primary-green)",
  marginBottom: "1rem"
};

export default FeedbackForm;
