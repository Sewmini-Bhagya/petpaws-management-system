import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import createImg from "../../assets/create.jpeg";
import bgImg from "../../assets/background.jpeg";

function CreateProfile() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      console.log("SUCCESS:", response.data);

      alert("Profile created successfully 🎉 Check your email!");

      navigate("/client");
    } catch (err) {
    console.log("FULL ERROR:", err);

    if (err.response) {
      console.log("STATUS:", err.response.status);
      console.log("DATA:", err.response.data);
    } else {
      console.log("NO RESPONSE (network issue)");
    }

    if (err.response?.status === 409) {
      alert("Profile already exists for this account");
      navigate("/client");
      return;
    }

    alert("Profile creation failed!");
  } finally {
    setIsSubmitting(false);
  }
  };

  return (
    <div style={overlay}>
      <div style={card}>

        {/* LEFT FORM */}
        <div style={left}>
          <h2 style={title}>Create Your Profile 🐾</h2>
          <p  style={{fontSize: "1.5rem", color: "#656565" }}>We need your profile to get started</p>

          <div style={form}>
            <input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={input}
            />

            <input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={input}
            />

            <input
              placeholder="Phone (e.g. 0771234567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={input}
            />

            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={input}
            />

            <button
              style={{ ...button, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
              onClick={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Continue"}
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div style={right}>
          <img src={createImg} alt="create profile" style={image} />
        </div>

      </div>
    </div>
  );
}

/* STYLES */

const overlay = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `url(${bgImg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative"
};

const card = {
  display: "flex",
  width: "900px",
  height: "520px",
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
  overflow: "hidden"
};

const left = {
  flex: 1,
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

const right = {
  flex: 1
};

const image = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const title = {
  color: "#6B8F71",
  marginBottom: "0.5rem",
  
  fontSize: "2.5rem", 
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem"
};

const input = {
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const button = {
  marginTop: "0.8rem",
  padding: "0.8rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer"
};

export default CreateProfile;