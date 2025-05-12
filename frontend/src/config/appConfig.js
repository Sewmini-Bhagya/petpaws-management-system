/**
 * Global application configuration.
 * Put app-wide settings here so they are easy to find and change in one place.
 */
const APP_CONFIG = {
  /** API Base URL - Configured via environment variables with a safe fallback */
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  SERVER_URL: "http://localhost:8000",

  /** Currency symbol displayed across all money values in the app */
  CURRENCY_SYMBOL: "Rs.",

  /** Maximum number of feedback items to show on the dashboard */
  DASHBOARD_FEEDBACK_LIMIT: 3,

  /** Common API endpoints used throughout the application */
  ENDPOINTS: {
    ADMIN_DASHBOARD: "/admin/dashboard",
  },
};

export default APP_CONFIG;
