import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import signupImg from "../../assets/signup.jpeg";
import API from "../../api/axios";

import {
  form,
  input,
  button,
  link,
  title,
  subtitle
} from "../../styles/authStyles";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    
    if (!email || !password || !confirmPassword) {
      alert("Please fill all fields!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await API.post("/auth/register", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/create-profile");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Signup failed 😭");
    }
  };

  return (
    <AuthLayout image={signupImg}>
      <div style={right}>
        
        <h2 style={{ ...title, fontSize: "2.5rem" }}>
          Welcome! 🐾
        </h2>

        <p style={{ ...subtitle, fontSize: "1.5rem", color: "#656565" }}>
          Create an account, it's free
        </p>

        <div style={form}>
          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            style={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            style={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            style={input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button style={button} onClick={handleSignup}>
            Sign up
          </button>
        </div>

        <p style={loginText}>
          Already have an account?{" "}
          <span style={link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

      </div>
    </AuthLayout>
  );
}

/* styles */
const right = {
  flex: 1,
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

const loginText = {
  marginTop: "1.2rem",
  textAlign: "center"
};

export default Signup;