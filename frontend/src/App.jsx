import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import ROUTES from "./config/routes";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import ProductCatalogue from "./pages/client/ProductCatalogue";

// Auth Pages
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Client Portal
import ClientDashboard from "./pages/client/ClientDashboard";
import CreateProfile from "./pages/client/CreateProfile";
import EditProfile from "./pages/client/EditProfile";
import BookAppointment from "./pages/client/BookAppointment";
import MyPets from "./pages/client/MyPets";
import AddPet from "./pages/client/AddPet";
import PetProfile from "./pages/client/PetProfile";
import MedicalHistory from "./pages/client/MedicalHistory";
import MedicalRecords from "./pages/client/MedicalRecords";
import PetCareHub from "./pages/client/PetCareHub";
import CareGuide from "./pages/client/CareGuide";
import Notifications from "./pages/client/Notifications";
import Feedback from "./pages/client/Feedback";

// Admin Portal
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import RolePermissions from "./pages/admin/RolePermissions";
import InventoryManagement from "./pages/admin/InventoryManagement";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import LoyaltyManagement from "./pages/admin/LoyaltyManagement";

// Receptionist Portal
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import ReceptionAppointments from "./pages/receptionist/ReceptionAppointments";
import ReceptionQueue from "./pages/receptionist/ReceptionQueue";
import ReceptionSearch from "./pages/receptionist/ReceptionSearch";
import ReceptionBilling from "./pages/receptionist/ReceptionBilling";
import ReceptionistSales from "./pages/receptionist/ReceptionistSales";
import ReceptionInvoicePrint from "./pages/receptionist/ReceptionInvoicePrint";

// Vet Portal
import VetDashboard from "./pages/vet/VetDashboard";
import VetAppointments from "./pages/vet/VetAppointments";
import VetHistory from "./pages/vet/VetHistory";
import VetDiagnosis from "./pages/vet/VetDiagnosis";
import VetPrescriptions from "./pages/vet/VetPrescriptions";
import VetSchedule from "./pages/vet/VetSchedule";

/**
 * App Component
 * 
 * The root component of the application. 
 * Orchestrates global providers (Auth) and defines the routing table.
 * All routes are guarded either by public access or Role-Based ProtectedRoute.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.PUBLIC.ABOUT} element={<About />} />
          <Route path={ROUTES.PUBLIC.SERVICES} element={<Services />} />
          <Route path={ROUTES.PUBLIC.CONTACT} element={<Contact />} />
          <Route path={ROUTES.PUBLIC.SHOP} element={<ProductCatalogue />} />
          
          {/* --- AUTH ROUTES --- */}
          <Route path={ROUTES.AUTH.SIGNUP} element={<Signup />} />
          <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
          <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* --- CLIENT ROUTES --- */}
          <Route path={ROUTES.CLIENT.DASHBOARD} element={<ProtectedRoute allowedRoles={["CLIENT"]}><ClientDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.CLIENT.CREATE_PROFILE} element={<ProtectedRoute allowedRoles={["CLIENT"]}><CreateProfile /></ProtectedRoute>} />
          <Route path={ROUTES.CLIENT.EDIT_PROFILE} element={<ProtectedRoute allowedRoles={["CLIENT"]}><EditProfile /></ProtectedRoute>} />
          <Route path={ROUTES.CLIENT.BOOK_APPOINTMENT} element={<ProtectedRoute allowedRoles={["CLIENT"]}><BookAppointment /></ProtectedRoute>} />
          <Route path={ROUTES.CLIENT.PETS} element={<ProtectedRoute allowedRoles={["CLIENT"]}><MyPets /></ProtectedRoute>} />
          <Route path={ROUTES.CLIENT.ADD_PET} element={<ProtectedRoute allowedRoles={["CLIENT"]}><AddPet /></ProtectedRoute>} />
          <Route path="/pets/:id" element={<ProtectedRoute allowedRoles={["CLIENT"]}><PetProfile /></ProtectedRoute>} />
          <Route path="/pets/:id/history" element={<ProtectedRoute allowedRoles={["CLIENT"]}><MedicalHistory /></ProtectedRoute>} />
          <Route path="/pets/:id/records" element={<ProtectedRoute allowedRoles={["CLIENT"]}><MedicalRecords /></ProtectedRoute>} />
          <Route path={ROUTES.CLIENT.CARE_HUB} element={<ProtectedRoute allowedRoles={["CLIENT"]}><PetCareHub /></ProtectedRoute>} />
          <Route path="/care-guide/:breed" element={<ProtectedRoute allowedRoles={["CLIENT"]}><CareGuide /></ProtectedRoute>} />
          <Route path={ROUTES.CLIENT.NOTIFICATIONS} element={<ProtectedRoute allowedRoles={["CLIENT"]}><Notifications /></ProtectedRoute>} />
          <Route path="/feedback/:appointmentId?" element={<ProtectedRoute allowedRoles={["CLIENT"]}><Feedback /></ProtectedRoute>} />

          {/* --- ADMIN ROUTES --- */}
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.USER_MANAGEMENT} element={<ProtectedRoute allowedRoles={["ADMIN"]}><UserManagement /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.PERMISSIONS} element={<ProtectedRoute allowedRoles={["ADMIN"]}><RolePermissions /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.INVENTORY} element={<ProtectedRoute allowedRoles={["ADMIN"]}><InventoryManagement /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.APPOINTMENTS} element={<ProtectedRoute allowedRoles={["ADMIN"]}><AppointmentManagement /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.SERVICES} element={<ProtectedRoute allowedRoles={["ADMIN"]}><ServicesManagement /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.LOYALTY} element={<ProtectedRoute allowedRoles={["ADMIN"]}><LoyaltyManagement /></ProtectedRoute>} />

          {/* --- RECEPTIONIST ROUTES --- */}
          <Route path={ROUTES.RECEPTIONIST.DASHBOARD} element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.RECEPTIONIST.APPOINTMENTS} element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><ReceptionAppointments /></ProtectedRoute>} />
          <Route path={ROUTES.RECEPTIONIST.QUEUE} element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><ReceptionQueue /></ProtectedRoute>} />
          <Route path={ROUTES.RECEPTIONIST.SEARCH} element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><ReceptionSearch /></ProtectedRoute>} />
          <Route path={ROUTES.RECEPTIONIST.BILLING} element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><ReceptionBilling /></ProtectedRoute>} />
          <Route path={ROUTES.RECEPTIONIST.RECORDS} element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "VET"]}><VetHistory /></ProtectedRoute>} />
          <Route path={ROUTES.RECEPTIONIST.SALES} element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><ReceptionistSales /></ProtectedRoute>} />
          <Route path={ROUTES.RECEPTIONIST.INVOICE} element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><ReceptionInvoicePrint /></ProtectedRoute>} />

          {/* --- VET ROUTES --- */}
          <Route path={ROUTES.VET.DASHBOARD} element={<ProtectedRoute allowedRoles={["VET"]}><VetDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.VET.APPOINTMENTS} element={<ProtectedRoute allowedRoles={["VET"]}><VetAppointments /></ProtectedRoute>} />
          <Route path={ROUTES.VET.HISTORY} element={<ProtectedRoute allowedRoles={["VET", "RECEPTIONIST"]}><VetHistory /></ProtectedRoute>} />
          <Route path={ROUTES.VET.DIAGNOSIS} element={<ProtectedRoute allowedRoles={["VET"]}><VetDiagnosis /></ProtectedRoute>} />
          <Route path={ROUTES.VET.PRESCRIPTIONS} element={<ProtectedRoute allowedRoles={["VET"]}><VetPrescriptions /></ProtectedRoute>} />
          <Route path={ROUTES.VET.SCHEDULE} element={<ProtectedRoute allowedRoles={["VET"]}><VetSchedule /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;