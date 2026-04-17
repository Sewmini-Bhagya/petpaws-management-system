import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";


function BookAppointment() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  
  const timeSlots = [
    { time: "9:00 AM", available: true },
    { time: "10:00 AM", available: false },
    { time: "11:00 AM", available: true },
    { time: "1:00 PM", available: false },
    { time: "2:00 PM", available: true },
    { time: "3:00 PM", available: true }
  ];

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Book Appointment 🐾</h2>

        <div style={form}>
          
          <label>Pet</label>
          <select style={input}>
            <option>Select Pet</option>
            <option>Windy</option>
            <option>Max</option>
          </select>

          <label>Service</label>
          <select style={input}>
            <option>Select Service</option>
            <option>Consultation</option>
            <option>Grooming</option>
            <option>Vaccination</option>
            <option>Minor Surgery</option>
            <option>Neutering Surgery</option>
            <option>Major Surgery</option>
            <option>Blood Test</option>
            <option>Hormone Test</option>
            <option>ECG</option>
            <option>Dental Scaling</option>
            <option>Ultrasound Scanning</option>
            <option>Microchipping</option>
          </select>

          <label>Vet</label>
          <select style={input}>
            <option>Select Vet</option>
            <option>Dr. Silva</option>
            <option>Dr. Perera</option>
          </select>

          <label>Date</label>

          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            style={input}
            customInput={<input style={input} />}
          />

          <label>Time Slot</label>

            <div style={timeGrid}>
            {timeSlots.map((slot) => (
                <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                style={{
                    ...timeBtn,
                    background:
                    selectedTime === slot.time ? "#6B8F71" : "#fff",
                    color:
                    selectedTime === slot.time ? "#fff" : "#1F2937",
                    opacity: slot.available ? 1 : 0.4,
                    cursor: slot.available ? "pointer" : "not-allowed"
                }}
                >
                {slot.time}
                </button>
            ))}
            </div>

          <button style={mainBtn}>Confirm Booking</button>
        </div>
      </div>
    </div>
  );
}

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#F7F9F7"
};

const timeGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "0.6rem",
  marginTop: "0.5rem"
};

const timeBtn = {
  padding: "0.6rem",
  borderRadius: "10px",
  border: "1px solid #6B8F71",
  background: "#fff",
  transition: "0.2s ease"
};

const card = {
  width: "400px",
  background: "#fff",
  padding: "2rem",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
};

const title = {
  color: "#6B8F71",
  marginBottom: "1.5rem",
  textAlign: "center"
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem"
};

const input = {
  padding: "0.7rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const mainBtn = {
  marginTop: "1rem",
  padding: "0.8rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer"
};

export default BookAppointment;