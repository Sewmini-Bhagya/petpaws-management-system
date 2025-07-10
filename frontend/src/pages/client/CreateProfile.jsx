import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import createImg from "../../assets/create.jpeg";
import bgImg from "../../assets/background.jpeg";
import ROUTES from "../../config/routes";
import {
  overlay,
  card,
  left,
  imageStyle,
  right,
  title,
  subtitle,
  form as formStyle,
  input as inputStyle,
  button as buttonStyle,
  label
} from "../../styles/authStyles";

/**
 * CreateProfile Component
 */
function CreateProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if profile already exists
  useEffect(() => {
    if (user?.first_name) {
      navigate(ROUTES.CLIENT.DASHBOARD, { replace: true });
    }
  }, [user, navigate]);

  /**
   * Submits the client profile data to the backend.
   */
  const handleCreate = async () => {
    if (isSubmitting) return;

    if (!firstName || !lastName || !phone || !city) {
      alert("Please fill all fields!");
      return;
    }

    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(phone)) {
      alert("Enter a valid phone number!");
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");
      console.log("TOKEN:", token);

      const response = await API.post("/profile", {
        first_name: firstName,
        last_name: lastName,
        phone,
        city
      });

      await refreshUser();

      console.log("SUCCESS:", response.data);

      alert("Profile created successfully! Check your email.");

      navigate(ROUTES.CLIENT.DASHBOARD, { replace: true });
    } catch (err) {
      console.error("Profile creation failed:", err.response?.data || err.message);

      if (err.response?.status === 409) {
        alert("Profile already exists for this account");
        navigate(ROUTES.CLIENT.DASHBOARD);
        return;
      }

      alert("Profile creation failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={{ ...card, maxWidth: "860px", minHeight: "560px" }}>
        {/* LEFT FORM */}
        <div style={right}>
          <h2 style={title}>Create Profile</h2>
          <p style={subtitle}>We need your basic details to personalize your experience.</p>

          <div style={formStyle}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={label}>First Name</label>
                <input
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={label}>Last Name</label>
                <input
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={label}>Phone Number</label>
              <input
                placeholder="0771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={label}>City / Residential Area</label>
              <input
                placeholder="Colombo 07"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              style={{
                ...buttonStyle,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                marginTop: "1.5rem"
              }}
              onClick={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Finalizing Registry..." : "Complete Profile"}
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div style={left}>
          <img src={createImg} alt="create profile" style={imageStyle} />
        </div>
      </div>
    </div>
  );
}

export default CreateProfile;

