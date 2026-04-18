import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

import signupImg from "../../assets/signup.jpeg";

import { link } from "../../styles/authStyles";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {

    if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    if (password !== confirmPassword) {
      alert("Passwords do not match 😭");
      return;
    }

    const res = await API.post("/auth/register", {
      email,
      password,
    });

    console.log(res.data);

    // optional: auto login after signup
    localStorage.setItem("token", res.data.token);

    navigate("/create-profile");
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Signup failed 😭");
  }
};

  return (
    <div style={overlay}>
      <div style={card}>

        {/* LEFT IMAGE */}
        <div style={left}>
          <img src={signupImg} alt="signup" style={image} />
        </div>

        {/* RIGHT FORM */}
        <div style={right}>
          <h2 style={{title, fontSize: "2.5rem", color: "#6B8F71", marginBottom: "0.1rem"}}>Welcome! 🐾</h2>
          <p style={{subtitle, fontSize: "1.5rem", color: "#656565" }}>Create an account, it's free</p>

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
            <input type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            style={input} />

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

      </div>
    </div>
  );
}

const overlay = {
  height: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "rgba(0,0,0,0.1)"
};

const card = {
  display: "flex",
  width: "900px",
  height: "520px",
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  overflow: "hidden"
};

const left = {
  flex: 1,
  background: "#eee"
};

const image = {
  width: "100%",
  height: "100%",
  objectFit: "cover"   
};

const right = {
  flex: 1,
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

const title = {
  color: "#6B8F71",
  marginBottom: "0.5rem"
};

const subtitle = {
  marginBottom: "1.5rem",
  color: "#666"
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem"
};

const input = {
  padding: "0.6rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const button = {
  marginTop: "1rem",
  padding: "0.7rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const loginText = {
  marginTop: "1.2rem",
  textAlign: "center"
};

export default Signup;