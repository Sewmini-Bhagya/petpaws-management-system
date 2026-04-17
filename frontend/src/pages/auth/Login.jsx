import AuthLayout from "../../components/AuthLayout";
import loginImg from "../../assets/login.jpeg";
import { useNavigate } from "react-router-dom";

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

  return (
    <AuthLayout image={loginImg}>
      <h2 style={title}>Welcome Back 🐾</h2>
      <p style={subtitle}>
        Login to manage your pets and appointments
      </p>

      <div style={form}>
        <label>Email</label>
            <input type="email" placeholder="example@gmail.com" style={input} />

            <label>Password</label>
            <input type="password" placeholder="••••••••" style={input} />

        <p style={forgot}>Forgot password?</p>

        <button style={button}>Login</button>
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