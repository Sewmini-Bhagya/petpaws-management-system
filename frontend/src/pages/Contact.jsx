import { useEffect } from "react";
import { FaPaw, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Contact Component
 * 
 * Provides contact information, clinic location, and frequently asked questions.
 */
function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={pageContainer}>
      <Navbar />
      <div style={container}>
        
        {/* HEADER */}
        <div style={header}>
          <div style={logo}><FaPaw size={32} color="var(--primary-green)" /></div>
          <div>
            <h2 style={title}>Contact & Help</h2>
            <p style={subtitle}>
              We're here to help you with any questions or concerns
            </p>
          </div>
        </div>

      {/* CONTACT FORM */}
      <div style={card}>
        <h3>Send us a message</h3>

        <div style={row}>
          <input placeholder="Your Name" style={input} />
          <input placeholder="Your Email" style={input} />
        </div>

        <textarea
          placeholder="Your Message"
          style={textarea}
        />

        <div style={{ textAlign: "right" }}>
          <button style={button}>Send Message</button>
        </div>
      </div>

      {/* EMERGENCY */}
      <div style={card}>
        <h3>Find Us</h3>

        <p style={hospital}>Pet Paws Animal Hospital</p>
        <p style={info}><FaPhone /> 0766166538 / 0701100438</p>
        <p style={info}><FaMapMarkerAlt /> Little Rome, Mudukatuwa, Marawila</p>
        <p style={info}><FaClock /> Open Mon-Sat: 9 AM- 9 PM</p>
      </div>

      {/* FAQ */}
      <div style={card}>
        <h3>Frequently Asked Questions</h3>

        <div style={faqItem}>
          <p style={question}>What are your working hours?</p>
          <p style={answer}>
            We're open Monday to Saturday, from 9:00 AM to 9:00 PM.
          </p>
        </div>

        <div style={faqItem}>
          <p style={question}>Do you offer emergency services?</p>
          <p style={answer}>
            Unfortunately, No. But call anytime, we'll do the best we can.
          </p>
        </div>

        <div style={faqItem}>
          <p style={question}>Can I book appointments online?</p>
          <p style={answer}>
            Absolutely! Use your dashboard to book, manage, and reschedule appointments easily.
          </p>
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

const container = {
  padding: "2rem",
  background: "#F7F9F7",
  minHeight: "100vh"
};



const header = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "2rem"
};

const logo = {
  width: "45px",
  height: "45px",
  borderRadius: "12px",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",   
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

const title = {
  color: "var(--primary-green)",
  margin: 0
};

const subtitle = {
  margin: 0,
  color: "#666",
  fontSize: "0.9rem"
};

const card = {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  marginBottom: "1.5rem"
};

const row = {
  display: "flex",
  gap: "1rem",
  marginBottom: "1rem"
};

const input = {
  flex: 1,
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ddd"
};

const textarea = {
  width: "100%",
  height: "120px",
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ddd",
  marginBottom: "1rem"
};

const button = {
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  padding: "0.7rem 1.2rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const hospital = {
  fontWeight: "bold",
  color: "var(--primary-green)"
};

const info = {
  margin: "4px 0"
};

const faqItem = {
  marginBottom: "1rem"
};

const question = {
  fontWeight: "bold",
  color: "var(--primary-green)",
  marginBottom: "2px"
};

const answer = {
  margin: 0,
  fontSize: "0.9rem",
  color: "#444"
};

export default Contact;