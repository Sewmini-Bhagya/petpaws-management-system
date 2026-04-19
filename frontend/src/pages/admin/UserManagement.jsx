import API from "../../api/axios";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminSidebar from "../../components/admin/AdminSidebar";

function UserManagement() {
  return (
    <div style={container}>

      <div style={container}>
      <AdminTopbar />

      <div style={main}>
        <AdminSidebar />

        {/* CONTENT */}
        <div style={content}>

          <h1 style={title}>User Management</h1>

          {/* SEARCH */}
          <div style={searchRow}>
            <input
              placeholder="Search by email or role..."
              style={searchInput}
            />
          </div>

          {/* TABLE */}
          <table style={table}>
            <thead style={thead}>
              <tr>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>

              {/* EMPTY STATE */}
              <tr>
                <td colSpan="4" style={emptyRow}>
                  No users found
                </td>
              </tr>

              {/* SAMPLE ROW (for screenshot) */}
              <tr style={{ background: "#cbd5c0" }}>
                <td style={td}>user@email.com</td>
                <td style={td}>Client</td>
                <td style={{ ...td, color: "green", fontWeight: "500" }}>
                  Active
                </td>
                <td style={td}>
                  <button style={editBtn}>Edit</button>
                  <button style={dangerBtn}>Deactivate</button>
                </td>
              </tr>

            </tbody>
          </table>

        </div>
      </div>
      </div>
    </div>
  );
}

/* LAYOUT BASE */

const container = {
  minHeight: "100vh",
  background: "#F7F9F7"
};

const content = {
  flex: 1,
  padding: "2rem"
};

const thead = {
  background: "#6B8F71",
  color: "white"
};

const th = {
  padding: "12px",
  fontWeight: "500",
  textAlign: "left"
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
  textAlign: "left"
};

const title = {
  fontSize: "2.3rem",
  marginBottom: "1.5rem"
};

const searchRow = {
  marginBottom: "1.2rem"
};

const searchInput = {
  width: "300px",
  padding: "0.7rem",
  borderRadius: "10px",
  border: "1px solid #ccc"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const emptyRow = {
  textAlign: "center",
  padding: "1rem",
  color: "#777"
};

const editBtn = {
  padding: "0.3rem 0.6rem",
  marginRight: "0.5rem",
  background: "#6B8F71",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const dangerBtn = {
  padding: "0.3rem 0.6rem",
  background: "#d9534f",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const main = {
  display: "flex"
};


export default UserManagement;