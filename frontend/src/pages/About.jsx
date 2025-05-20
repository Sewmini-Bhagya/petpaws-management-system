import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../config/routes";
import aboutImg from "../assets/about.jpeg";

/**
 * About Component
 * 
 * Tells the story of PetPaws and highlights our values and mission.
 */
function About() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={pageContainer}>
      <Navbar />
      <div style={overlay}>
        <div style={card}>
          {/* LEFT IMAGE */}
          <div style={left}>
            <img src={aboutImg} alt="about" style={image} />
          </div>

          {/* RIGHT CONTENT */}
          <div style={right}>
            <h1 style={title}>About Us</h1>

            <p style={text}>
              At Pet Paws Animal Hospital, we believe pets are family. 
              Our mission is to provide compassionate, high-quality care 
              in a calm and welcoming environment.
            </p>

            <p style={text}>
              With modern equipment and an experienced team, we ensure your 
              pets receive the best treatment... whether it's a routine checkup 
              or advanced medical care.
            </p>

            {/* WHY SECTION */}
            <div style={whySection}>
              <h2 style={whyTitle}>Why Choose Us?</h2>

              <div style={whyCard}>
                <p>Compassionate and gentle care</p>
                <p>Modern equipment and treatments</p>
                <p>Stress-free experience for pets & owners</p>
                <p>Quick, reliable service</p>
              </div>
            </div>

            {/* BUTTONS */}
            <div style={btnRow}>
              <button style={secondaryBtn} onClick={() => navigate(ROUTES.PUBLIC.SERVICES)}>
                View Services
              </button>

              <button style={primaryBtn} onClick={() => navigate(ROUTES.AUTH.SIGNUP)}>
                Book Appointment
              </button>

              <button style={backBtn} onClick={() => navigate(-1)}>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const pageContainer = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh"
};

/* styles */
const overlay = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#F7F9F7",
  padding: "2rem"
};

const card = {
  display: "flex",
  width: "900px",
  maxWidth: "100%",
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  overflow: "hidden"
};

const left = {
  flex: 1
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
  justifyContent: "center",
  gap: "1rem",
  alignItems: "center"
};

const title = {
  color: "var(--primary-green)"
};

const text = {
  lineHeight: "1.6",
  color: "#444",
};

const whySection = {
  marginTop: "1rem",
  textAlign: "center",
  width: "100%"
};

const whyCard = {
  background: "var(--slate-50)",
  padding: "1rem",
  borderRadius: "10px",
  lineHeight: "1.5",
  maxWidth: "400px",
  margin: "0 auto"
};

const whyTitle = {
  color: "var(--primary-green)",
  marginBottom: "0.5rem"
};

const btnRow = {
  display: "flex",
  gap: "0.8rem",
  marginTop: "1.5rem",
  flexWrap: "wrap",
  justifyContent: "center"
};

const primaryBtn = {
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  padding: "0.6rem 1.2rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const secondaryBtn = {
  background: "#fff",
  border: "1px solid var(--primary-green)",
  padding: "0.6rem 1.2rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const backBtn = {
  background: "#ddd",
  border: "none",
  padding: "0.6rem 1.2rem",
  borderRadius: "8px",
  cursor: "pointer"
};


export default About;