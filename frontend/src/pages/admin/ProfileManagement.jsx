import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminSidebar from "../../components/admin/AdminSidebar";

function ProfileManagement() {
  return (
    <div style={container}>

      <AdminTopbar />

      <div style={main}>

        <AdminSidebar />

        <div style={content}>

          <h1 style={title}>Profile Management</h1>

          <input
            placeholder="Search client by name, email or phone..."
            style={searchInput}
          />

          <div style={grid}>

            {/* CLIENT LIST */}
            <div style={card}>
              <h3>Clients</h3>
              <div style={listItem}>No clients found</div>
            </div>

            {/* DETAILS */}
            <div>

              <div style={card}>
                <h3>Client Details</h3>
                <p><strong>Name:</strong> —</p>
                <p><strong>Email:</strong> —</p>
                <p><strong>Phone:</strong> —</p>

                <button style={btn}>Edit Profile</button>
              </div>

              <div style={card}>
                <h3>Pets</h3>
                <div style={petItem}>No pets found</div>
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
  fontSize: "2.3rem",
  marginBottom: "1rem"
};

const searchInput = {
  width: "350px",
  padding: "0.7rem",
  borderRadius: "10px",
  border: "1px solid #ccc",
  marginBottom: "1.5rem"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  gap: "1.5rem"
};

const card = {
  background: "#fff",
  padding: "1.2rem",
  borderRadius: "14px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  marginBottom: "1.2rem"
};

const listItem = {
  padding: "0.6rem",
  borderBottom: "1px solid #eee",
  color: "#777"
};

const petItem = {
  padding: "0.6rem",
  borderBottom: "1px solid #eee"
};

const btn = {
  marginTop: "1rem",
  padding: "0.5rem 1rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

export default ProfileManagement;