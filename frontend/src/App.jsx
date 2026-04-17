import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";

import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import ClientDashboard from "./pages/client/ClientDashboard";
import BookAppointment from "./pages/client/BookAppointment";
import PetCareHub from "./pages/client/PetCareHub";
import CareGuide from "./pages/client/CareGuide";
import Contact from "./pages/Contact";
import MyPets from "./pages/client/MyPets";
import PetProfile from "./pages/client/PetProfile";
import AddPet from "./pages/client/AddPet";
import MedicalHistory from "./pages/client/MedicalHistory";
import MedicalRecords from "./pages/client/MedicalRecords";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />

          {/* CLIENT */}
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/care-hub" element={<PetCareHub />} />
          <Route path="/care-guide/:breed" element={<CareGuide />} />
          <Route path="/pets" element={<MyPets />} />
          <Route path="/pets/add" element={<AddPet />} />
          <Route path="/pets/:id" element={<PetProfile />} />
          <Route path="/pets/:id/history" element={<MedicalHistory />} />
          <Route path="/pets/:id/records" element={<MedicalRecords />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;