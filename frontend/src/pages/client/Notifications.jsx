import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiInfo, FiCheckCircle, FiChevronLeft, FiClock } from "react-icons/fi";
import API from "../../api/axios";
import ClientLayout from "../../components/client/ClientLayout";
import ROUTES from "../../config/routes";

/**
 * Notifications Component
 */
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  /**
   * Synchronizes the notification feed with the backend.
   */
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/client/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("[Notifications] Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates the read status of a personalized alert.
   */
  const markAsRead = async (id, type) => {
    if (type === 'announcement') return;
    try {
      await API.put(`/client/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error("[Notifications] Status sync failed:", err);
    }
  };

  return (
    <ClientLayout active="dashboard">
      <header style={headerContainer}>
        <button style={backBtn} onClick={() => navigate(ROUTES.CLIENT.DASHBOARD)}>
          <FiChevronLeft /> Dashboard
        </button>
        <h1 style={titleStyle}>Activity Center</h1>
        <p style={subtitleStyle}>Stay synchronized with your pet's health milestones and hospital alerts.</p>
      </header>

      <div style={feedWrapper}>
        {isLoading ? (
          <div style={loader}>Synchronizing activity feed...</div>
        ) : notifications.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyIcon}><FiBell size={48} /></div>
            <h3 style={emptyTitle}>Clear Skies!</h3>
            <p style={emptyText}>You're all caught up. New health alerts and hospital news will appear here.</p>
          </div>
        ) : (
          <div style={notificationList}>
            {notifications.map((n) => (
              <div
                key={`${n.type}-${n.id}`}
                style={{
                  ...notificationCard,
                  background: n.is_read ? "white" : "rgba(107, 143, 113, 0.03)",
                  borderColor: !n.is_read ? "rgba(107, 143, 113, 0.2)" : "var(--slate-100)"
                }}
                onClick={() => markAsRead(n.id, n.type)}
              >
                <div style={{
                  ...iconCircle,
                  background: n.type === 'announcement' ? "var(--slate-100)" : "rgba(107, 143, 113, 0.1)",
                  color: n.type === 'announcement' ? "var(--slate-600)" : "var(--primary-green)"
                }}>
                  {n.type === 'announcement' ? <FiInfo /> : <FiBell />}
                </div>

                <div style={notificationBody}>
                  <div style={cardHeader}>
                    <h3 style={{
                      ...itemTitle,
                      color: n.is_read ? "var(--slate-600)" : "var(--slate-900)"
                    }}>
                      {n.title}
                    </h3>
                    <div style={metaGroup}>
                      <FiClock size={12} />
                      <span style={itemDate}>{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p style={itemMessage}>{n.message}</p>

                  {n.type === 'personal' && !n.is_read && (
                    <div style={unreadIndicator}>
                      <span style={dot}></span>
                      New Alert
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "3rem"
};

const backBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "transparent",
  border: "none",
  color: "var(--slate-500)",
  fontSize: "0.9rem",
  fontWeight: "700",
  cursor: "pointer",
  marginBottom: "1.5rem"
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

const feedWrapper = {
  maxWidth: "900px"
};

const notificationList = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const notificationCard = {
  display: "flex",
  padding: "1.5rem",
  borderRadius: "24px",
  border: "1px solid",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  gap: "1.5rem",
  alignItems: "flex-start"
};

const iconCircle = {
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem",
  flexShrink: 0
};

const notificationBody = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const itemTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "700"
};

const metaGroup = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  color: "var(--slate-400)"
};

const itemDate = {
  fontSize: "0.8rem",
  fontWeight: "600"
};

const itemMessage = {
  color: "var(--slate-500)",
  lineHeight: "1.6",
  fontSize: "0.95rem"
};

const unreadIndicator = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "0.5rem",
  fontSize: "0.75rem",
  fontWeight: "800",
  color: "var(--primary-green)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const dot = {
  width: "6px",
  height: "6px",
  background: "var(--primary-green)",
  borderRadius: "50%"
};

const loader = {
  padding: "4rem",
  textAlign: "center",
  color: "var(--slate-400)",
  fontSize: "1.1rem"
};

const emptyState = {
  textAlign: "center",
  padding: "6rem 2rem",
  background: "white",
  borderRadius: "32px",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)"
};

const emptyIcon = {
  color: "var(--slate-100)",
  marginBottom: "1.5rem"
};

const emptyTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const emptyText = {
  color: "var(--slate-500)",
  fontSize: "1.1rem",
  maxWidth: "400px",
  margin: "0 auto"
};

export default Notifications;
