import homeImg from "../assets/home.jpeg";

function Home() {
  return (
    <div style={container}>
      
      {/* NAVBAR */}
      <div style={navbar}>
        <div style={logo}>Pet Paws 🐾</div>

        <div style={navLinks}>
          <button style={loginBtn}>Login</button>
          <button style={signupBtn}>Signup</button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div style={hero}>
        
        {/* LEFT */}
        <div style={heroText}>
          
          <h1 style={heroTitle}>
            Caring for Your Pets with Love & Technology
          </h1>

          <p style={heroDesc}>
            Book appointments, view medical records, and manage your pet’s care
            online with ease.
          </p>

          {/* BUTTONS */}
          <div style={btnRow}>
            <button style={primaryBtn}>Book Appointment</button>
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

          {/* SMALL CARDS */}
          <div style={smallCards}>
            <div style={smallCard}>
              <h4>Consultations</h4>
              <p>Professional care for your pets.</p>
            </div>

            <div style={smallCard}>
              <h4>Grooming</h4>
              <p>Complete grooming services.</p>
            </div>

            <div style={smallCard}>
              <h4>Pharmacy</h4>
              <p>Trusted medicines & supplies.</p>
            </div>
          </div>

          {/* STACKED INFO CARDS */}
          <div style={stackedInfo}>
            <div style={stackCard}>
              <h3>Easy Booking</h3>
              <p>Choose a service and time slot easily.</p>
            </div>

            <div style={stackCard}>
              <h3>Digital Records</h3>
              <p>All medical records stored securely.</p>
            </div>

            <div style={stackCard}>
              <h3>Secure Payments</h3>
              <p>Pay online and track invoices.</p>
            </div>
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div style={heroImageBox}>
          <img src={homeImg} alt="pet" style={heroImg} />

          <div style={imageButtons}>
            <button style={primaryBtn}>Book Appointment</button>
            <button style={secondaryBtn}>Pet Care Hub</button>
            <button style={secondaryBtn}>Contact Us</button>
          </div>
        </div>

      </div>

            <div id="learn-more" style={learnSection}>
        <h2 style={{ color: "#6B8F71" }}>Why Choose PetPaws?</h2>

        <p>
            We provide trusted veterinary care with modern facilities, 
            experienced vets, and personalized treatment for your pets.
        </p>

        <p>
            From routine checkups to advanced treatments, your pet’s health 
            is always our priority.
        </p>
        </div>

      {/* FOOTER */}
      <div style={footer}>
        <div>
          <h4>Pet Paws Animal Hospital</h4>
          <p style={footerText}>Little Rome, Mudukatuwa, Marawila</p>
          <p style={footerText}>Tel: 0766166538 / 0701100438</p>
          <p style={footerText}>Email: petpawsanimalhospital@gmail.com</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <p style={footerText}>Home</p>
          <p style={footerText}>About Us</p>
          <p style={footerText}>Services</p>
          <p style={footerText}>Book Appointment</p>
          <p style={footerText}>Contact Us</p>
        </div>

        <div>
          <h4>Open Hours</h4>
          <p style={footerText}>Mon - Sat</p>
          <p style={footerText}>9 AM - 9 PM</p>
        </div>
      </div>

    </div>
  );
}

/* 🎨 STYLES */

const container = {
  background: "#F7F9F7",
  color: "#1F2937",
  fontFamily: "sans-serif"
};

const navbar = {
  background: "#6B8F71",
  color: "white",
  padding: "1rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const logo = {
  fontSize: "1.5rem",
  fontWeight: "bold"
};

const navLinks = {
  display: "flex",
  gap: "1.5rem",
  alignItems: "center"
};

const loginBtn = {
  background: "#FFFFFF",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const signupBtn = {
  background: "#fff",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const hero = {
  display: "flex",
  padding: "2rem",
  gap: "2rem",
  alignItems: "flex-start"
};

const heroText = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  alignItems: "center",     
  textAlign: "center"
};

const heroTitle = {
  fontSize: "2.3rem",
  color: "#6B8F71",
  lineHeight: "1.2"
};

const heroDesc = {
  fontSize: "0.95rem",
  maxWidth: "500px"
};

const learnSection = {
  padding: "3rem 2rem",
  background: "#ffffff",
  textAlign: "center",
  marginTop: "2rem",
  borderRadius: "16px"
};

const btnRow = {
  display: "flex",
  gap: "1rem",
  justifyContent: "center"
};

const primaryBtn = {
  background: "#6B8F71",
  color: "white",
  border: "none",
  padding: "0.7rem 1.3rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const secondaryBtn = {
  background: "#fff",
  border: "1px solid #6B8F71",
  padding: "0.7rem 1.3rem",
  borderRadius: "8px",
  cursor: "pointer"
};

const smallCards = {
  display: "flex",
  gap: "1rem",
  marginTop: "1rem",
  justifyContent: "center"
};

const smallCard = {
  background: "#fff",
  padding: "1rem",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  width: "150px",
  textAlign: "center"
};

const stackedInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginTop: "1rem",
  maxWidth: "420px",
  alignItems: "center"
};

const stackCard = {
  background: "#fff",
  padding: "1rem",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  textAlign: "center"
};

const heroImageBox = {
  flex: 1,
  position: "relative"
};

const heroImg = {
  width: "100%",
  borderRadius: "16px"
};

const imageButtons = {
  position: "absolute",
  bottom: "20px",
  left: "50%",
  transform: "translateX(-50%)", 
  background: "white",
  padding: "1rem",
  borderRadius: "12px",
  display: "flex",
  gap: "0.5rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

const footerText = {
  margin: "2px 0" 
};

const footer = {
  fontFamily: "times-new-roman",
  background: "#6B8F71",
  color: "white",
  display: "flex",
  justifyContent: "space-around",
  padding: "1rem",
  marginTop: "2rem",
  textAlign: "center",   
  lineHeight: "1.1"
};

export default Home;