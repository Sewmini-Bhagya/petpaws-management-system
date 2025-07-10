import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import editImg from "../../assets/create.jpeg"; // Reuse same image for now
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
 * EditProfile Component
 */
function EditProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Submits the updated profile data to the backend.
   */
  const handleUpdate = async () => {
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

      await API.put("/profile", {
        first_name: firstName,
        last_name: lastName,
        phone,
        city
      });

      await refreshUser();
      alert("Profile updated successfully!");
      navigate(ROUTES.CLIENT.DASHBOARD);
    } catch (err) {
      console.error("Profile update failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Profile update failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div style={overlay}>
      <div style={{ ...card, maxWidth: "860px", minHeight: "560px" }}>
        {/* LEFT FORM */}
        <div style={right}>
          <h2 style={title}>Edit Profile</h2>
          <p style={subtitle}>Update your contact information below.</p>

          <div style={formStyle}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={label}>First Name</label>
                <input
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={label}>Last Name</label>
                <input
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={label}>Phone Number</label>
              <input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={label}>City</label>
              <input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                style={{
                  ...buttonStyle,
                  flex: 1,
                  background: "var(--slate-200)",
                  color: "var(--slate-700)",
                  marginTop: 0
                }}
                onClick={() => navigate(ROUTES.CLIENT.DASHBOARD)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...buttonStyle,
                  flex: 2,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  marginTop: 0
                }}
                onClick={handleUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div style={left}>
          <img src={editImg} alt="edit profile" style={imageStyle} />
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
