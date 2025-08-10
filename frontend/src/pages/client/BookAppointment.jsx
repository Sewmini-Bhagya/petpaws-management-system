import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiHeart, FiActivity } from "react-icons/fi";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";

/**
 * BookAppointment Component
 */
function BookAppointment() {
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const [timeSlots, setTimeSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, servicesRes] = await Promise.all([
          API.get("/pets"),
          API.get("/services")
        ]);
        setPets(petsRes.data);
        setServices(servicesRes.data.filter(s => s.service_name !== "Pet Shop"));
      } catch (err) {
        console.error("[Booking] Initialization failed:", err);
      }
    };
    fetchData();
  }, []);

  /**
   * Toggles service selection with logic to prevent incompatible bookings.
   */
  const toggleService = (id) => {
    const serviceToToggle = services.find(s => s.service_id === id);
    if (!serviceToToggle) return;

    const isGrooming = serviceToToggle.service_name.toLowerCase().includes("grooming");

    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter(s => s !== id));
    } else {
      const hasGrooming = services.some(s => selectedServiceIds.includes(s.service_id) && s.service_name.toLowerCase().includes("grooming"));
      const hasNonGrooming = services.some(s => selectedServiceIds.includes(s.service_id) && !s.service_name.toLowerCase().includes("grooming"));

      if (isGrooming && hasNonGrooming) {
        alert("Standalone Rule: Grooming cannot be combined with medical services.");
        return;
      }

      if (!isGrooming && hasGrooming) {
        alert("Standalone Rule: Medical services cannot be combined with Grooming.");
        return;
      }

      const currentServices = services.filter(s => selectedServiceIds.includes(s.service_id));
      const distinctSpecs = [...new Set([...currentServices, serviceToToggle].map(s => s.required_specialization).filter(s => s !== null))];

      if (distinctSpecs.length > 1) {
        alert("Clinical Rule: General services and Surgeries must be booked separately.");
        return;
      }

      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const formatDateLocal = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Fetches available time slots for the chosen day.
   */
  const fetchSlots = async (date) => {
    try {
      const formatted = formatDateLocal(date);
      const res = await API.get(`/appointments/available-slots?date=${formatted}`);
      setTimeSlots(res.data);
    } catch (err) {
      console.error("[Booking] Slot fetch failed:", err);
    }
  };

  /**
   * Submits the appointment after validating lead-time constraints.
   */
  const handleBooking = async () => {
    if (!selectedPet || selectedServiceIds.length === 0 || !selectedDate || !selectedTime) {
      alert("Please complete all steps before confirming.");
      return;
    }

    const now = new Date();
    const appointmentDate = new Date(`${formatDateLocal(selectedDate)}T${selectedTime}`);

    const selectedServices = services.filter(s => selectedServiceIds.includes(s.service_id));
    const hasSurgery = selectedServices.some(s => s.service_name.toLowerCase().includes("surgery"));
    const hasGrooming = selectedServices.some(s => s.service_name.toLowerCase().includes("grooming"));

    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);

    if (hasSurgery && hoursDiff < 24) {
      alert("Critical: Surgeries require at least 24h lead time.");
      return;
    }

    if (hasGrooming && hoursDiff < 2) {
      alert("Note: Grooming requires at least 2h lead time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post("/appointments", {
        pet_id: selectedPet,
        appointment_start: `${formatDateLocal(selectedDate)} ${selectedTime}`,
        service_ids: selectedServiceIds,
      });

      alert("Appointment Confirmed! We'll see you soon.");
      window.location.reload(); // Simple reset
    } catch (err) {
      alert(err.response?.data?.message || "Booking synchronization failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClientLayout active="appointments">
      <header style={headerContainer}>
        <h1 style={titleStyle}>Book a Visit</h1>
        <p style={subtitleStyle}>Choose your pet and services to schedule a professional consultation.</p>
      </header>

      <div style={bookingContainer}>
        <div style={bookingForm}>

          {/* STEP 1: PET */}
          <section style={stepSection}>
            <div style={stepHeader}>
              <div style={stepIcon}><FiHeart /></div>
              <h3 style={stepTitle}>Select Your Pet</h3>
            </div>
            <div style={petSelector}>
              {pets.map((pet) => (
                <button
                  key={pet.pet_id}
                  onClick={() => setSelectedPet(pet.pet_id)}
                  style={{
                    ...petBadge,
                    background: selectedPet === pet.pet_id ? "var(--primary-green)" : "white",
                    color: selectedPet === pet.pet_id ? "white" : "var(--slate-600)",
                    border: selectedPet === pet.pet_id ? "1px solid var(--primary-green)" : "1px solid var(--slate-200)",
                  }}
                >
                  {pet.pet_name}
                </button>
              ))}
            </div>
          </section>

          {/* STEP 2: SERVICES */}
          <section style={stepSection}>
            <div style={stepHeader}>
              <div style={stepIcon}><FiActivity /></div>
              <h3 style={stepTitle}>Select Services</h3>
            </div>
            <div style={serviceMatrix}>
              {services.map((s) => {
                const isGrooming = s.service_name.toLowerCase().includes("grooming");
                const hasGrooming = services.some(srv => selectedServiceIds.includes(srv.service_id) && srv.service_name.toLowerCase().includes("grooming"));
                const hasNonGrooming = services.some(srv => selectedServiceIds.includes(srv.service_id) && !srv.service_name.toLowerCase().includes("grooming"));
                const isDisabled = (isGrooming && hasNonGrooming) || (!isGrooming && hasGrooming);
                const isSelected = selectedServiceIds.includes(s.service_id);

                return (
                  <div
                    key={s.service_id}
                    onClick={() => !isDisabled && toggleService(s.service_id)}
                    style={{
                      ...serviceCard,
                      background: isSelected ? "rgba(107, 143, 113, 0.05)" : "white",
                      borderColor: isSelected ? "var(--primary-green)" : "var(--slate-100)",
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer"
                    }}
                  >
                    <div style={{ ...checkbox, background: isSelected ? "var(--primary-green)" : "transparent" }}>
                      {isSelected && <FiCheckCircle color="white" size={14} />}
                    </div>
                    <div style={serviceInfo}>
                      <span style={serviceName}>{s.service_name}</span>
                      <span style={servicePrice}>Rs. {s.base_price?.toLocaleString() || "1,000"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={infoAlert}>
              <FiAlertCircle size={16} />
              <span>Grooming is a standalone service and cannot be combined with medical treatments.</span>
            </div>
          </section>

          {/* STEP 3: SCHEDULE */}
          <section style={stepSection}>
            <div style={stepHeader}>
              <div style={stepIcon}><FiCalendar /></div>
              <h3 style={stepTitle}>Date & Time</h3>
            </div>
            <div style={dateTimeGrid}>
              <div style={inputGroup}>
                <label style={inputLabel}>Preferred Date</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setSelectedTime("");
                    fetchSlots(date);
                  }}
                  minDate={new Date()}
                  filterDate={(date) => date.getDay() !== 0}
                  customInput={<input style={customDateInput} />}
                  placeholderText="Select a day"
                />
              </div>

              <div style={inputGroup}>
                <label style={inputLabel}>Available Slot</label>
                <div style={slotSelector}>
                  <select
                    style={customTimeInput}
                    disabled={!selectedDate}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Choose Time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.time} value={slot.time} disabled={!slot.available}>
                        {slot.time.substring(0, 5)} {slot.available ? "" : "(Fully Booked)"}
                      </option>
                    ))}
                  </select>
                  <FiClock style={slotIcon} />
                </div>
              </div>
            </div>
          </section>

          <button
            style={{
              ...confirmBtn,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "wait" : "pointer"
            }}
            onClick={handleBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Finalizing Booking..." : "Confirm My Appointment"}
          </button>
        </div>

        {/* SUMMARY ASIDE */}
        <aside style={bookingSummary}>
          <h4 style={summaryTitle}>Booking Summary</h4>
          <div style={summaryList}>
            <div style={summaryItem}>
              <span style={summaryLabel}>Patient</span>
              <span style={summaryValue}>{pets.find(p => p.pet_id === selectedPet)?.pet_name || "Not selected"}</span>
            </div>
            <div style={summaryItem}>
              <span style={summaryLabel}>Services</span>
              <span style={summaryValue}>
                {selectedServiceIds.length > 0
                  ? services.filter(s => selectedServiceIds.includes(s.service_id)).map(s => s.service_name).join(", ")
                  : "None selected"}
              </span>
            </div>
            <div style={summaryItem}>
              <span style={summaryLabel}>Scheduled For</span>
              <span style={summaryValue}>
                {selectedDate ? `${selectedDate.toLocaleDateString()} at ${selectedTime || "..."}` : "Select date"}
              </span>
            </div>
          </div>
          <div style={priceSummary}>
            <span>Estimated Total</span>
            <span style={totalPrice}>Rs. {services.filter(s => selectedServiceIds.includes(s.service_id)).reduce((acc, s) => acc + (s.base_price || 1000), 0).toLocaleString()}</span>
          </div>
        </aside>
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "3rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const subtitleStyle = {
  color: "var(--slate-500)",
  fontSize: "1.1rem"
};

const bookingContainer = {
  display: "flex",
  gap: "3rem",
  alignItems: "flex-start"
};

const bookingForm = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "3rem"
};

const stepSection = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const stepHeader = {
  display: "flex",
  alignItems: "center",
  gap: "1rem"
};

const stepIcon = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  background: "var(--slate-100)",
  color: "var(--primary-green)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem"
};

const stepTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "700",
  color: "var(--slate-900)"
};

const petSelector = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem"
};

const petBadge = {
  padding: "0.75rem 1.5rem",
  borderRadius: "14px",
  fontSize: "0.9rem",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s"
};

const serviceMatrix = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: "1rem"
};

const serviceCard = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem",
  borderRadius: "16px",
  border: "1px solid",
  transition: "all 0.2s"
};

const checkbox = {
  width: "22px",
  height: "22px",
  borderRadius: "6px",
  border: "2px solid var(--slate-200)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const serviceInfo = {
  display: "flex",
  flexDirection: "column"
};

const serviceName = {
  fontSize: "0.95rem",
  fontWeight: "700",
  color: "var(--slate-800)"
};

const servicePrice = {
  fontSize: "0.8rem",
  color: "var(--slate-500)",
  fontWeight: "600"
};

const infoAlert = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  background: "var(--slate-50)",
  padding: "1rem",
  borderRadius: "12px",
  fontSize: "0.85rem",
  color: "var(--slate-600)",
  border: "1px solid var(--slate-100)"
};

const dateTimeGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem"
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const inputLabel = {
  fontSize: "0.85rem",
  fontWeight: "700",
  color: "var(--slate-500)",
  textTransform: "uppercase"
};

const customDateInput = {
  width: "100%",
  padding: "1rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-200)",
  background: "white",
  fontSize: "0.95rem",
  color: "var(--slate-900)",
  outline: "none"
};

const slotSelector = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const customTimeInput = {
  width: "100%",
  padding: "1rem",
  paddingRight: "2.5rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-200)",
  background: "white",
  fontSize: "0.95rem",
  color: "var(--slate-900)",
  outline: "none",
  appearance: "none",
  cursor: "pointer"
};

const slotIcon = {
  position: "absolute",
  right: "1rem",
  color: "var(--slate-400)",
  pointerEvents: "none"
};

const confirmBtn = {
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  padding: "1.25rem",
  borderRadius: "18px",
  fontSize: "1.1rem",
  fontWeight: "800",
  marginTop: "2rem",
  boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
  transition: "all 0.2s"
};

const bookingSummary = {
  width: "350px",
  background: "white",
  borderRadius: "28px",
  padding: "2.5rem",
  position: "sticky",
  top: "100px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)"
};

const summaryTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.2rem",
  fontWeight: "800",
  marginBottom: "2rem",
  color: "var(--slate-900)"
};

const summaryList = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  marginBottom: "2.5rem"
};

const summaryItem = {
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem"
};

const summaryLabel = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--slate-400)",
  textTransform: "uppercase"
};

const summaryValue = {
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "var(--slate-800)",
  lineHeight: "1.4"
};

const priceSummary = {
  borderTop: "1px solid var(--slate-100)",
  paddingTop: "1.5rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const totalPrice = {
  fontSize: "1.5rem",
  color: "var(--primary-green)"
};

export default BookAppointment;