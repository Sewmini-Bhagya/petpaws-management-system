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
import InventoryManagement from "./pages/admin/InventoryManagement";

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
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* CLIENT */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/care-hub"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <PetCareHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/care-guide/:breed"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <CareGuide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <MyPets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/add"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <AddPet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/:id"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <PetProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/:id/history"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <MedicalHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/:id/records"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <MedicalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-profile"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <CreateProfile />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/um"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <InventoryManagement />
              </ProtectedRoute>
            }
          />

          {/* RECEPTIONIST */}
          <Route
            path="/recep"
            element={
              <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />

          {/* VET */}
          <Route
            path="/vet"
            element={
              <ProtectedRoute allowedRoles={["VET"]}>
                <VetDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;