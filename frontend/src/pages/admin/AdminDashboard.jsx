import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../../components/admin/AdminLayout";
import ROUTES from "../../config/routes";
import APP_CONFIG from "../../config/appConfig";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import {
  dashboardGrid,
  title as titleStyle,
  section,
  sectionHeader,
  listCard,
  feedbackCard,
  cardRow,
  cardContent,
  actionGrid,
  actionBtn,
  reportGrid,
  reportCard,
  metricTitle,
  metricValue,
  btnSmall,
  mutedText,
  errorText,
} from "../../styles/adminDashboardStyles";


const QUICK_ACTIONS = [
  { label: "User Management", route: ROUTES.ADMIN.USER_MANAGEMENT },
  { label: "Manage Inventory", route: ROUTES.ADMIN.INVENTORY },
  { label: "System Services", route: ROUTES.ADMIN.SERVICES },
  { label: "Appointments", route: ROUTES.ADMIN.APPOINTMENTS },
];

/**
 * Sub-component for rendering a single performance metric.
 * @param {Object} props
 * @param {string} props.title - The title of the metric.
 * @param {string|number} props.value - The value to display.
 */
function MetricCard({ title: cardTitle, value }) {
  return (
    <div style={reportCard}>
      <h3 style={metricTitle}>{cardTitle}</h3>
      <p style={metricValue}>{value}</p>
    </div>
  );
}

/**
 * AdminDashboard Component
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Consolidated into a single state object — all data comes from one API call
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get(APP_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Admin dashboard fetch failed:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Safely derive data from the single state object
  const announcements = dashboardData?.announcements || [];
  const feedback = dashboardData?.feedback || [];
  const metrics = [
    {
      title: "Revenue",
      value: `${APP_CONFIG.CURRENCY_SYMBOL} ${dashboardData?.revenue || 0}`,
    },
    { title: "Completed Visits", value: dashboardData?.visits || 0 },
    { title: "In Stock", value: `${dashboardData?.stock || 0} items` },
    { title: "Active Services", value: dashboardData?.services || 0 },
  ];

  // ── Render States ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AdminLayout>
        <p style={mutedText}>Loading dashboard…</p>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <p style={errorText}>{error}</p>
      </AdminLayout>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* HEADER */}
      <h1 style={titleStyle}>Welcome back, {user?.name || "Admin"} 👋</h1>

      <div style={dashboardGrid}>

        {/* LEFT COLUMN */}
        <div>
          {/* Announcements */}
          <div style={section}>
            <div style={sectionHeader}>
              <h2>Announcements</h2>
              <button style={btnSmall}>Add new</button>
            </div>

            {announcements.length === 0 ? (
              <p style={mutedText}>No announcements yet.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.announcement_id} style={listCard}>
                  <div style={cardRow}>
                    <strong>{announcement.title}</strong>
                    <small style={mutedText}>
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <p style={cardContent}>{announcement.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Recent Feedback */}
          <div style={section}>
            <h2>Recent Feedback</h2>

            {feedback.length === 0 ? (
              <p style={mutedText}>No feedback received yet.</p>
            ) : (
              feedback
                .slice(0, APP_CONFIG.DASHBOARD_FEEDBACK_LIMIT)
                .map((item) => (
                  <div key={item.feedback_id} style={feedbackCard}>
                    <div style={cardRow}>
                      <strong>{item.email}</strong>
                      <small>⭐ {item.rating}</small>
                    </div>
                    <p style={cardContent}>{item.comments || "No comment"}</p>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Quick Actions */}
          <div style={section}>
            <h2>Quick Actions</h2>
            <div style={actionGrid}>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.route}
                  style={actionBtn}
                  onClick={() => navigate(action.route)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={section}>
            <h2>Performance Metrics</h2>
            <div style={reportGrid}>
              {metrics.map((metric) => (
                <MetricCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;