import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import ROUTES from "../../config/routes";
import {
  overlay,
  modalCard,
  title,
  subtitle,
  form,
  input,
  button,
  text,
  link
} from "../../styles/authStyles";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    try {
      if (!email) {
        alert("Please enter your email");
        return;
      }

      // call backend
      const res = await API.post("/auth/forgot-password", {
        email,
      });

      alert(res.data.message || "Reset link sent");

    } catch (err) {
      console.error(err.response?.data || err.message);

      alert(
        err.response?.data?.message || "Failed to send reset link"
      );
    }
  };

  return (
    <div style={overlay}>
      <div style={modalCard}>

        <h1 style={{ ...title, color: "var(--primary-green)" }}>Reset Password</h1>
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
          <span style={link} onClick={() => navigate(ROUTES.AUTH.LOGIN)}>
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;