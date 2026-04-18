import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios"; 
import bgImg from "../../assets/background.jpeg";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    try {
      if (!email) {
        alert("Please enter your email");
        return;
      }

      // CALL BACKEND
      const res = await API.post("/auth/forgot-password", {
        email,
      });

      alert(res.data.message || "Reset link sent ✉️");

    } catch (err) {
      console.error(err.response?.data || err.message);

      alert(
        err.response?.data?.message || "Failed to send reset link 😭"
      );
    }
  };

  return (
    <div style={overlay}>
      <div style={card}>

        <h1 style={title}>Reset Password</h1>
        <p style={subtitle}>
          Enter your email and we'll send you a reset link
        </p>

        <div style={form}>
          <input
            type="email"
            placeholder="email: example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />

          <button style={button} onClick={handleReset}>
            Send Reset Link
          </button>
        </div>

        <p style={text}>
          Remembered your password?{" "}
          <span style={link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

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
  width: "380px",
  padding: "2rem",
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 15px 30px rgba(0,0,0,0.08)",
  textAlign: "center"
};

const title = {
  color: "#6B8F71",
  marginBottom: "0.5rem"
};

const subtitle = {
  color: "#666",
  fontSize: "1rem",
  marginBottom: "1.5rem"
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
};

const input = {
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const button = {
  padding: "0.8rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const text = {
  marginTop: "1.2rem",
  fontSize: "0.9rem"
};

const link = {
  color: "#6B8F71",
  fontWeight: "bold",
  cursor: "pointer"
};

export default ForgotPassword;