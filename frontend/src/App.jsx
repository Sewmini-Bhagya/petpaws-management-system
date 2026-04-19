import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

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
import Services from "./pages/Services";
import About from "./pages/About";
import CreateProfile from "./pages/client/CreateProfile";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import VetDashboard from "./pages/vet/VetDashboard";
import UserManagement from "./pages/admin/UserManagement";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route
            path="/client"
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

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
          <Route path="/create-profile" element={<CreateProfile />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/um" element={<UserManagement />} />

          {/* RECEPTIONIST */}
          <Route path="/recep" element={<ReceptionistDashboard />} />

          {/* VET */}
          <Route path="/vet" element={<VetDashboard />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;