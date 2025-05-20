import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { 
  FiArrowRight, 
  FiShield, 
  FiHeart, 
  FiStar, 
  FiActivity, 
  FiScissors, 
  FiPackage,
  FiCheckCircle,
  FiCalendar,
  FiCreditCard
} from "react-icons/fi";
import homeImg from "../assets/home.jpeg";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ROUTES from "../config/routes";

/**
 * Home Component
 * 
 * The main landing page for the PetPaws application. 
 * Provides an overview of services and easy access to booking/auth.
 */
function Home() {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={container}>
      <Navbar />

      {/* HERO SECTION */}
      <section style={hero}>
        
        {/* LEFT CONTENT */}
        <div style={heroText}>
          <div style={badge}>
            <FiStar style={{ color: "var(--primary-green)" }} />
            <span>Top-Rated Veterinary Care</span>
          </div>
          
          <h1 style={heroTitle}>
            Caring for Your Pets with Love & Technology
          </h1>

          <p style={heroDesc}>
            Join thousands of happy pet owners who trust PetPaws for seamless appointment booking, 
            digital medical records, and expert clinical guidance.
          </p>

          <div style={btnRow}>
            <button style={primaryBtn} onClick={() => navigate(ROUTES.AUTH.SIGNUP)}>
              Book Appointment <FiArrowRight />
            </button>
            <button
              style={secondaryBtn}
              onClick={() =>
                document.getElementById("learn-more").scrollIntoView({
                  behavior: "smooth"
                })
              }
            >
              Learn More
            </button>
          </div>

          {/* FEATURE GRID */}
          <div style={featureGrid}>
            <div style={featureCard}>
              <div style={featureIcon}><FiActivity /></div>
              <div style={featureMeta}>
                <h4 style={featureLabel}>Consultations</h4>
                <p style={featureSub}>Expert clinical exams</p>
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIcon}><FiScissors /></div>
              <div style={featureMeta}>
                <h4 style={featureLabel}>Grooming</h4>
                <p style={featureSub}>Complete pet styling</p>
              </div>
            </div>

            <div style={featureCard}>
              <div style={featureIcon}><FiPackage /></div>
              <div style={featureMeta}>
                <h4 style={featureLabel}>Pharmacy</h4>
                <p style={featureSub}>Supplies & Medicine</p>
              </div>
            </div>
          </div>

          {/* INFO STACK */}
          <div style={infoStack}>
            <div style={infoItem}>
              <FiCheckCircle style={infoIcon} />
              <div style={infoText}>
                <h3 style={infoTitle}>Easy Digital Booking</h3>
                <p style={infoPara}>Schedule visits in seconds with real-time availability.</p>
              </div>
            </div>

            <div style={infoItem}>
              <FiCheckCircle style={infoIcon} />
              <div style={infoText}>
                <h3 style={infoTitle}>Secured EMR Access</h3>
                <p style={infoPara}>Your pet's medical history, always available in your pocket.</p>
              </div>
            </div>

            <div style={infoItem}>
              <FiCheckCircle style={infoIcon} />
              <div style={infoText}>
                <h3 style={infoTitle}>Unified Billing</h3>
                <p style={infoPara}>Transparent pricing and digital invoices for every visit.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div style={heroImageBox}>
          <div style={imageWrapper}>
            <img src={homeImg} alt="Healthy Pet" style={heroImg} />
            <div style={imageOverlay} />
          </div>

          <div style={imageActionGroup}>
            <button style={actionBtnPrimary} onClick={() => navigate(ROUTES.AUTH.SIGNUP)}>
              Book Now
            </button>
            <button style={actionBtn} onClick={() => navigate(ROUTES.CLIENT.CARE_HUB)}>
              Care Hub
            </button>
            <button style={actionBtn} onClick={() => navigate(ROUTES.PUBLIC.CONTACT)}>
              Support
            </button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section id="learn-more" style={whySection}>
        <div style={whyHeader}>
          <h2 style={sectionTitle}>Why PetPaws?</h2>
          <p style={sectionSubtitle}>We combine medical excellence with a stress-free digital experience.</p>
        </div>

        <div style={cardsGrid}>
          <div style={modernCard}>
            <div style={modernIcon}><FiHeart /></div>
            <h3 style={cardTitle}>Compassionate Care</h3>
            <p style={cardDesc}>
              Every patient is treated as family. We prioritize your pet's comfort and emotional well-being 
              in every procedure.
            </p>
          </div>

          <div style={modernCard}>
            <div style={modernIcon}><FiShield /></div>
            <h3 style={cardTitle}>Modern Equipment</h3>
            <h3 style={cardTitle}>Modern Facilities</h3>
            <p style={cardDesc}>
              Our hospital is equipped with state-of-the-art diagnostic and surgical technology for 
              precise results.
            </p>
          </div>

          <div style={modernCard}>
            <div style={modernIcon}><FiStar /></div>
            <h3 style={cardTitle}>Simple & Honest</h3>
            <p style={cardDesc}>
              From transparent pricing to clear medical advice, we keep the complex world of vet care 
              simple for you.
            </p>
          </div>
        </div>

        <div style={trustBanner}>
          <FiStar style={{ color: "#FBBF24" }} />
          <span>Trusted by 5,000+ happy pet owners across the region.</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* 🎨 STYLES */

const container = {
  background: "white",
  color: "var(--slate-900)",
  overflowX: "hidden"
};

const hero = {
  display: "flex",
  padding: "6rem 10%",
  gap: "6rem",
  alignItems: "center",
  background: "linear-gradient(135deg, var(--slate-50) 0%, white 100%)",
  minHeight: "90vh"
};

const heroText = {
  flex: 1.2,
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  textAlign: "left"
};

const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.6rem 1.25rem",
  background: "white",
  borderRadius: "50px",
  border: "1px solid var(--slate-100)",
  fontSize: "0.9rem",
  fontWeight: "700",
  width: "fit-content",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  color: "var(--slate-600)"
};

const heroTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "4rem",
  fontWeight: "900",
  color: "var(--primary-green)",
  lineHeight: "1.1",
  letterSpacing: "-0.03em"
};

const heroDesc = {
  fontSize: "1.25rem",
  color: "var(--slate-500)",
  lineHeight: "1.7",
  maxWidth: "600px"
};

const btnRow = {
  display: "flex",
  gap: "1.5rem",
  marginTop: "1rem"
};

const primaryBtn = {
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  padding: "1.25rem 2.5rem",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "1.1rem",
  fontWeight: "800",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
};

const secondaryBtn = {
  background: "white",
  border: "1px solid var(--slate-200)",
  color: "var(--slate-900)",
  padding: "1.25rem 2.5rem",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "1.1rem",
  fontWeight: "800",
  transition: "all 0.2s"
};

const featureGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1.5rem",
  marginTop: "2rem"
};

const featureCard = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  padding: "1.5rem",
  background: "white",
  borderRadius: "24px",
  border: "1px solid var(--slate-50)",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
};

const featureIcon = {
  fontSize: "1.75rem",
  color: "var(--primary-green)",
  background: "rgba(107, 143, 113, 0.1)",
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "15px"
};

const featureMeta = {
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem"
};

const featureLabel = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const featureSub = {
  fontSize: "0.8rem",
  color: "var(--slate-400)",
  fontWeight: "600"
};

const infoStack = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  marginTop: "1.5rem"
};

const infoItem = {
  display: "flex",
  gap: "1.25rem",
  alignItems: "flex-start"
};

const infoIcon = {
  color: "var(--primary-green)",
  fontSize: "1.5rem",
  marginTop: "0.2rem"
};

const infoText = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem"
};

const infoTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const infoPara = {
  fontSize: "0.95rem",
  color: "var(--slate-500)",
  lineHeight: "1.5"
};

const heroImageBox = {
  flex: 1,
  position: "relative",
  display: "flex",
  justifyContent: "center"
};

const imageWrapper = {
  position: "relative",
  width: "100%",
  borderRadius: "40px",
  overflow: "hidden",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
};

const heroImg = {
  width: "100%",
  height: "auto",
  display: "block",
  transform: "scale(1.05)"
};

const imageOverlay = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 100%)"
};

const imageActionGroup = {
  position: "absolute",
  bottom: "-30px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "white",
  padding: "1rem",
  borderRadius: "28px",
  display: "flex",
  gap: "1rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  border: "1px solid var(--slate-100)",
  width: "90%",
  maxWidth: "500px"
};

const actionBtn = {
  flex: 1,
  padding: "1rem",
  background: "var(--slate-50)",
  border: "1px solid var(--slate-100)",
  color: "var(--slate-700)",
  borderRadius: "18px",
  fontSize: "0.9rem",
  fontWeight: "800",
  cursor: "pointer",
  transition: "all 0.2s"
};

const actionBtnPrimary = {
  ...actionBtn,
  background: "var(--primary-green)",
  color: "white",
  border: "none"
};

const whySection = {
  padding: "10rem 10%",
  background: "white",
  textAlign: "center"
};

const whyHeader = {
  marginBottom: "5rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem"
};

const sectionTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "3.5rem",
  fontWeight: "900",
  color: "var(--primary-green)",
  letterSpacing: "-0.02em"
};

const sectionSubtitle = {
  fontSize: "1.25rem",
  color: "var(--slate-400)",
  maxWidth: "600px",
  lineHeight: "1.6"
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2.5rem"
};

const modernCard = {
  background: "var(--slate-50)",
  padding: "3.5rem 2.5rem",
  borderRadius: "40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid var(--slate-50)"
};

const modernIcon = {
  width: "80px",
  height: "80px",
  background: "white",
  color: "var(--primary-green)",
  borderRadius: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2.5rem",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
};

const cardTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const cardDesc = {
  fontSize: "1.1rem",
  color: "var(--slate-500)",
  lineHeight: "1.7"
};

const trustBanner = {
  marginTop: "5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  fontSize: "1.1rem",
  fontWeight: "700",
  color: "var(--slate-400)"
};

export default Home;