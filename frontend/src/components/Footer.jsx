import { useNavigate } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";

function Footer() {
  const navigate = useNavigate();

  return (
    <div style={footer}>
      
      {/* COLUMN 1 */}
      <div style={column}>
        <h4>Pet Paws Animal Hospital</h4>

        <p style={footerText}>
          Caring for your companions with gentle, trusted veterinary care 
          since 2021, where every paw is treated like family
        </p>
      </div>

      {/* COLUMN 2 */}
      <div style={column}>
        <h4>Quick Links</h4>

        <p style={footerLink} onClick={() => {
          navigate("/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          Home
        </p>

        <p style={footerLink} onClick={() => {
          navigate("/about");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          About Us
        </p>

        <p style={footerLink} onClick={() => navigate("/services")}>
          Services
        </p>

        <p style={footerLink} onClick={() => navigate("/signup")}>
          Book Appointment
        </p>

        <p style={footerLink} onClick={() => navigate("/contact")}>
          Contact Us
        </p>
      </div>

      {/* COLUMN 3 */}
      <div style={column}>
        <h4>Get in Touch</h4>

        <p style={footerText}>
          <a href="mailto:petpaws.clinic@gmail.com" style={linkStyle}>
            petpawsanimalhospital@gmail.com
          </a>
        </p>

        <p style={footerText}>
          <a href="tel:0766166538" style={linkStyle}>0766166538</a> /{" "}
          <a href="tel:0701100438" style={linkStyle}>0701100438</a>
        </p>

        <p style={footerText}>
          <a
            href="https://maps.google.com/?q=Pet+Paws+Animal+Hospital+Marawila"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            Little Rome, Mudukatuwa, Marawila
          </a>
        </p>

        {/*FaceBook*/}
        <div style={{ marginTop: "0.5rem" }}>
          <p>Follow Us:</p> 
          <a
            href="https://facebook.com/petpawmarawila"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            <FaFacebook style={{ size: "30", marginTop: "0rem" }} />
          </a>
        </div>
      </div>

    </div>
  );
}

/* STYLES */

const footer = {
  fontFamily: "times-new-roman",
  background: "#6B8F71",
  color: "white",
  display: "flex",
  justifyContent: "space-around",
  padding: "1rem",
  marginTop: "2rem",
  textAlign: "center",
  lineHeight: "1.4",
  flexWrap: "wrap"
};

const column = {
  maxWidth: "250px"
};

const footerText = {
  margin: "4px 0"
};

const footerLink = {
  margin: "4px 0",
  cursor: "pointer"
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  cursor: "pointer"
};

export default Footer;