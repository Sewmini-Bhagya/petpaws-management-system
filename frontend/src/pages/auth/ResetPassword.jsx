import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    // VALIDATIONS
    if (!password || !confirmPassword) {
      alert("Fill all fields 😭");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match 😭");
      return;
    }

    try {
      await API.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      alert("Password reset successful 🎉");
      navigate("/login");

    } catch (err) {
      console.error(err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
        "Invalid or expired link 😭"
      );
    }
  };

  return (
    <div style={overlay}>
      <div style={card}>

        <h1 style={title}>Set New Password</h1>
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
          <span style={link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

/* styles */

const overlay = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#F7F9F7"
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
  gap: "0.8rem"
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

export default ResetPassword;