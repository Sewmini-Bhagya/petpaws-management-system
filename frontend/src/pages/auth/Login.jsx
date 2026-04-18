import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import loginImg from "../../assets/login.jpeg";
import API from "../../api/axios";

import {
  form,
  input,
  forgot,
  button,
  text,
  link,
  title,
  subtitle
} from "../../styles/authStyles";

function Login() {
  const navigate = useNavigate();

  // ✅ STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ LOGIN FUNCTION
  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);

      // ✅ save token
      localStorage.setItem("token", res.data.token);

      // ✅ redirect
      navigate("/client");

    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
      alert("Login failed 😭");
    }
  };

  return (
    <AuthLayout image={loginImg}>
      <h2 style={{title, fontSize: "2.5rem", color: "#6B8F71", marginBottom: "0.1rem" }}>Hello 🐾</h2>

      <p style={{subtitle, fontSize: "1.5rem", color: "#656565" }}>
        Good to see you back!
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

        <span style={forgot} onClick={() => navigate("/forgot-password")}>Forgot password?</span>

        <button style={button} onClick={handleLogin}>
          Login
        </button>
      </div>

      <p style={text}>
        Don't have an account?{" "}
        <span style={link} onClick={() => navigate("/signup")}>
          Sign Up
        </span>
      </p>
    </AuthLayout>
  );
}

export default Login;