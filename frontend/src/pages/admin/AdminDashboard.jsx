import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/admin/dashboard");
        setDashboard(res.data);
        setFeedback(res.data.feedback || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div style={container}>
      <AdminTopbar />

      <div style={main}>
        <AdminSidebar />

        <div style={content}>
          
          {/* HEADER */}
          <h1 style={title}>Hello Admin 👋</h1>

          {/* ANNOUNCEMENTS */}
          <div style={section}>
            <div style={sectionHeader}>
              <h2>Announcements</h2>
              <button style={btnSmall}>Add new</button>
            </div>

            <div style={listCard}></div>
            <div style={listCard}></div>
            <div style={listCard}></div>

            <button style={btnCenter}>View more</button>
          </div>

          {/* CLIENT FEEDBACK */}
          <div style={section}>
            <h2>Client Feedback</h2>

            {feedback.slice(0, 3).map((f) => (
              <div key={f.feedback_id} style={feedbackCard}>
                <strong>{f.email}</strong>
                <p>{f.comments || "No comment"}</p>
                <small>⭐ {f.rating}</small>
              </div>
            ))}

            <button style={btnCenter}>View more</button>
          </div>

          {/* REPORTS */}
          <div style={section}>
            <h2>Reports</h2>

            <div style={reportGrid}>
              <div style={reportCard}>
                <h3>Revenue</h3>
                <p>Rs. {dashboard?.revenue || 0}</p>
              </div>

              <div style={reportCard}>
                <h3>Total Visits</h3>
                <p>{dashboard?.visits || 0}</p>
              </div>

              <div style={reportCard}>
                <h3>Stock</h3>
                <p>{dashboard?.stock || 0} items</p>
              </div>

              <div style={reportCard}>
                <h3>Appointments</h3>
                <p>{dashboard?.appointments || 0}</p>
              </div>

              <div style={reportCard}>
                <h3>Services</h3>
                <p>{dashboard?.services || 0} active</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



const container = {
  minHeight: "100vh",
  background: "#F7F9F7"
};

const main = {
  display: "flex"
};

const content = {
  flex: 1,
  padding: "2rem"
};

const title = {
  fontSize: "2.2rem",
  marginBottom: "1rem"
};

const section = {
  marginBottom: "2.5rem"
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem"
};

const listCard = {
  height: "45px",
  background: "#fff",
  borderRadius: "10px",
  marginBottom: "0.8rem",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const feedbackCard = {
  background: "#fff",
  padding: "1rem",
  borderRadius: "10px",
  marginBottom: "0.8rem",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const reportGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1.2rem",
  marginTop: "1rem"
};

const reportCard = {
  background: "#fff",
  padding: "1.2rem",
  borderRadius: "14px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  textAlign: "center"
};

const btnCenter = {
  display: "block",
  margin: "1rem auto 0",
  padding: "0.5rem 1.2rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const btnSmall = {
  padding: "0.5rem 1rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

export default AdminDashboard;