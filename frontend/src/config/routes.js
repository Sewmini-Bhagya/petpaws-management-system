/**
 * Central route configuration for the PetPaws application.
 * Always import routes from here instead of hardcoding strings in components.
 */
const ROUTES = {
  // Admin
  ADMIN: {
    DASHBOARD: "/admin",
    USER_MANAGEMENT: "/admin/user-management",
    INVENTORY: "/inventory",
    SERVICES: "/admin/services",
    APPOINTMENTS: "/admin/appointments",
    LOYALTY: "/admin/loyalty",
    PERMISSIONS: "/admin/permissions",
  },

  // Client
  CLIENT: {
    DASHBOARD: "/client",
    BOOK_APPOINTMENT: "/book",
    PETS: "/pets",
    ADD_PET: "/pets/add",
    CARE_HUB: "/care-hub",
    NOTIFICATIONS: "/notifications",
    SHOP: "/shop",
    FEEDBACK: "/feedback",
    CREATE_PROFILE: "/create-profile",
    EDIT_PROFILE: "/edit-profile",
  },

  // Receptionist
  RECEPTIONIST: {
    DASHBOARD: "/recep",
    APPOINTMENTS: "/recep/appointments",
    QUEUE: "/recep/queue",
    SEARCH: "/recep/search",
    RECORDS: "/recep/records",
    BILLING: "/recep/billing",
    SALES: "/recep/sales",
    INVOICE: "/recep/invoice",
  },

  // Vet
  VET: {
    DASHBOARD: "/vet",
    APPOINTMENTS: "/vet/appointments",
    HISTORY: "/vet/history",
    DIAGNOSIS: "/vet/diagnosis",
    PRESCRIPTIONS: "/vet/prescriptions",
    SCHEDULE: "/vet/schedule",
  },

  // Auth / Public
  AUTH: {
    LOGIN: "/login",
    SIGNUP: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
  },

  PUBLIC: {
    ABOUT: "/about",
    SERVICES: "/services",
    CONTACT: "/contact",
    SHOP: "/shop",
  },

  HOME: "/",
};

export default ROUTES;
