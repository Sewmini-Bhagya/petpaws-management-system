import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import API from "../../api/axios";

function BookAppointment() {
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const petsRes = await API.get("/pets");
        setPets(petsRes.data);

        const servicesRes = await API.get("/services");
        setServices(servicesRes.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // FETCH AVAILABLE SLOTS
  const fetchSlots = async (date) => {
    try {
      const formatted = date.toISOString().split("T")[0];

      const res = await API.get(
        `/appointments/available-slots?date=${formatted}`
      );

      setTimeSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // HANDLE BOOKING
  const handleBooking = async () => {
    if (!selectedPet || !selectedService || !selectedDate || !selectedTime) {
      alert("Fill everything 😭");
      return;
    }

    const date = selectedDate.toISOString().split("T")[0];
    const appointment_start = `${date} ${selectedTime}`;

    try {
      await API.post("/appointments", {
        pet_id: selectedPet,
        appointment_start,
        service_ids: [selectedService],
      });

      alert("Appointment booked 🎉");

      // RESET FORM
      setSelectedPet(null);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime("");
      setTimeSlots([]);

    } catch (err) {
      alert(err.response?.data?.message || "Error 😭");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Book Appointment 🐾</h2>

        <div style={form}>
          
          {/* PET SELECTION */}
          <label>Select Pet</label>
          <div style={grid}>
            {pets.map((pet) => (
              <button
                key={pet.pet_id}
                onClick={() => setSelectedPet(pet.pet_id)}
                style={{
                  ...selectBtn,
                  background:
                    selectedPet === pet.pet_id ? "#6B8F71" : "#fff",
                  color:
                    selectedPet === pet.pet_id ? "#fff" : "#1F2937",
                }}
              >
                {pet.pet_name}
              </button>
            ))}
          </div>

          {/* SERVICE */}
          <label>Service</label>
          <select
            style={input}
            value={selectedService || ""}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">Select Service</option>
            {services.map((s) => (
              <option key={s.service_id} value={s.service_id}>
                {s.service_name}
              </option>
            ))}
          </select>

          {/* DATE */}
          <label>Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setSelectedTime("");
              fetchSlots(date);
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select date"
            customInput={<input style={input} />}
          />

          {/* TIME SLOT */}
          <label>Time Slot</label>
          <select
            style={input}
            disabled={!selectedDate}
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">Select Time</option>

            {timeSlots.map((slot) => (
              <option
                key={slot.time}
                value={slot.time}
                disabled={!slot.available}
              >
                {slot.time} {slot.available ? "" : "(Booked)"}
              </option>
            ))}
          </select>

          {/* INFO */}
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Vet will be assigned automatically
          </p>

          {/* BUTTON */}
          <button style={mainBtn} onClick={handleBooking}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🎨 STYLES */

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#F7F9F7",
};

const card = {
  width: "420px",
  background: "#fff",
  padding: "2rem",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const title = {
  color: "#6B8F71",
  marginBottom: "1.5rem",
  textAlign: "center",
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
};

const input = {
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.6rem",
};

const selectBtn = {
  padding: "0.6rem",
  borderRadius: "10px",
  border: "1px solid #6B8F71",
  background: "#fff",
  cursor: "pointer",
};

const mainBtn = {
  marginTop: "1rem",
  padding: "0.8rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

export default BookAppointment;