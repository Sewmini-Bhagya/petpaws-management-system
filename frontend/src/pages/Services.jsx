import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Footer from "../components/Footer";

import consultImg from "../assets/consultation.jpeg";
import vaccineImg from "../assets/vaccination.jpeg";
import minorImg from "../assets/minor.jpeg";
import neuterImg from "../assets/neuter.jpeg";
import majorImg from "../assets/major.jpeg";
import bloodImg from "../assets/blood.jpeg";
import hormoneImg from "../assets/hormone.jpeg";
import ecgImg from "../assets/ecg.jpeg";
import dentalImg from "../assets/dental.jpeg";
import ultraImg from "../assets/ultrasound.jpeg";
import chipImg from "../assets/micro.jpeg";
import groomImg from "../assets/grooming.jpeg";
import hospitalImg from "../assets/hospitalize.jpeg";
import boardingImg from "../assets/boarding.jpeg";
import shopImg from "../assets/shop.jpeg";

const services = [
  { name: "Consultation", desc: "General health checkups and advice", img: consultImg },
  { name: "Vaccinations", desc: "Protect your pets from diseases", img: vaccineImg },
  { name: "Minor Surgeries", desc: "Safe and quick procedures", img: minorImg },
  { name: "Neutering Surgery", desc: "Population control & health benefits", img: neuterImg },
  { name: "Major Surgery", desc: "Advanced surgical treatments", img: majorImg },
  { name: "Blood Tests", desc: "Accurate lab diagnostics", img: bloodImg },
  { name: "Hormone Tests", desc: "Detect hormonal imbalances", img: hormoneImg },
  { name: "ECG", desc: "Heart monitoring services", img: ecgImg },
  { name: "Dental Scaling", desc: "Oral care & cleaning", img: dentalImg },
  { name: "Ultrasound", desc: "Internal diagnostics imaging", img: ultraImg },
  { name: "Microchipping", desc: "Permanent pet identification", img: chipImg },
  { name: "Pet Grooming", desc: "Clean and hygienic care", img: groomImg },
  { name: "Hospitalization", desc: "24/7 medical supervision", img: hospitalImg },
  { name: "Boarding", desc: "Safe stay while you're away", img: boardingImg },
  { name: "Pet Shop", desc: "Food, toys, and essentials", img: shopImg }
];

function Services() {
    const navigate = useNavigate();
  useEffect(() => {
      window.scrollTo(0, 0);
      }, []);
  return (
    <div style={container}>
      
      <h1 style={title}>Our Services 🐾</h1>
      
      <div style={grid}>
      {services.map((service, index) => (
        <div key={index} style={card}>
            
            <img src={service.img} alt={service.name} style={imgStyle} />

            <h3>{service.name}</h3>
            <p style={desc}>{service.desc}</p>

            <button
            style={bookBtn}
            onClick={() => navigate("/signup")}
            >
            Book
            </button>

        </div>
))}
</div>

      <Footer />
    </div>
  );
}

/* styles */

const container = {
  background: "#F7F9F7",
  minHeight: "100vh",
  padding: "2rem",
};

const title = {
  fontSize: "3rem",
  textAlign: "center",
  color: "#6B8F71",
  marginBottom: "2rem"
};

const bookBtn = {
  marginTop: "0.8rem",
  padding: "0.5rem 1rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "0.2s"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "2rem"
};

const card = {
  background: "#fff",
  padding: "1.2rem",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const imgStyle = {
  width: "100%",
  height: "140px",
  objectFit: "cover",
  borderRadius: "10px",
  marginBottom: "1rem"
};

const desc = {
  fontSize: "0.9rem",
  color: "#555"
};

export default Services;