import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import signupImg from "../../assets/signup.jpeg";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import ROUTES from "../../config/routes";

import {
  form,
  input,
  button,
  link,
  title,
  subtitle,
  label,
  text
} from "../../styles/authStyles";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSignup = async () => {

    if (!email || !password || !confirmPassword) {
      alert("Please fill all fields!");
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
      const res = await API.post("/auth/register", {
        email,
        password,
      });

      await login(res.data);

      navigate(ROUTES.CLIENT.CREATE_PROFILE);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <AuthLayout image={signupImg}>
      <h2 style={{ ...title, color: "var(--primary-green)" }}>Join PetPaws</h2>

      <p style={subtitle}>
        Create an account, it's free
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

          <label style={label}>Confirm Password</label>
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

        <p style={text}>
          Already have an account?{" "}
          <span style={link} onClick={() => navigate(ROUTES.AUTH.LOGIN)}>
            Login
          </span>
        </p>
      </AuthLayout>
    );
}

export default Signup;