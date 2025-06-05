import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    // VALIDATIONS
    if (!password || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      alert("Password reset successful");
      navigate(ROUTES.AUTH.LOGIN);

    } catch (err) {
      console.error(err.response?.data || err.message);

      alert(
        err.response?.data?.message || "Invalid or expired link"
      );
    }
  };

  return (
    <div style={overlay}>
      <div style={modalCard}>

        <h1 style={{ ...title, color: "var(--primary-green)" }}>Set New Password</h1>
        <p style={subtitle}>
          Enter your new password below
        </p>

        <div style={form}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={input}
          />

          <button style={button} onClick={handleReset}>
            Reset Password
          </button>
        </div>

        <p style={text}>
          Back to{" "}
          <span style={link} onClick={() => navigate(ROUTES.AUTH.LOGIN)}>
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default ResetPassword;