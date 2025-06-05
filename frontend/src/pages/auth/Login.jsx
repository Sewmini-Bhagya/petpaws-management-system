import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import loginImg from "../../assets/login.jpeg";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import ROUTES from "../../config/routes";

import {
  form,
  input,
  forgot,
  button,
  text,
  link,
  title,
  subtitle,
  label
} from "../../styles/authStyles";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // LOGIN FUNCTION
  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);

      // Save token + load current user
      const currentUser = await login(res.data.token);

      // Role-based redirect
      const role = (currentUser?.role_name || currentUser?.role || "").toUpperCase();
      console.log("DETERMINED ROLE:", role);
      if (role === "ADMIN") navigate(ROUTES.ADMIN.DASHBOARD);
      else if (role === "RECEPTIONIST") navigate(ROUTES.RECEPTIONIST.DASHBOARD);
      else if (role === "VET") navigate(ROUTES.VET.DASHBOARD);
      else navigate(ROUTES.CLIENT.DASHBOARD);

    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed!");
    }
  };

  return (
    <AuthLayout image={loginImg}>
      <h2 style={{ ...title, color: "var(--primary-green)" }}>Welcome Back</h2>

      <p style={subtitle}>
        Good to see you back!
      </p>

        <div style={form}>
          <label style={label}>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            style={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            style={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span style={forgot} onClick={() => navigate(ROUTES.AUTH.FORGOT_PASSWORD)}>Forgot password?</span>

          <button
            type="button"
            style={button}
            onClick={handleLogin}
          >
            Login
          </button>
        </div>

        <p style={text}>
          Don't have an account?{" "}
          <span style={link} onClick={() => navigate(ROUTES.AUTH.SIGNUP)}>
            Sign Up
          </span>
        </p>
      </AuthLayout>
  );
}

export default Login;