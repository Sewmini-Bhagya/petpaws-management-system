import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import API from "../../api/axios";

/**
 * LoyaltyManagement Component
 * 
 * Manages client loyalty tiers and rewards. 
 * Fetches real loyalty balances from the database and enables administrative points adjustments.
 */
function LoyaltyManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeMember, setActiveMember] = useState(null);
  const [pointsInput, setPointsInput] = useState("");

  useEffect(() => {
    fetchLoyaltyMembers();
  }, []);

  const fetchLoyaltyMembers = async () => {
    try {
      const res = await API.get("/admin/loyalty");
      setMembers(res.data);
    } catch (err) {
      console.error("[LoyaltyManagement] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const determineLevel = (points) => {
    const pts = Number(points || 0);
    if (pts >= 5000) return "Platinum";
    if (pts >= 2000) return "Gold";
    if (pts >= 500) return "Silver";
    return "Bronze";
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "Platinum": return { bg: "rgba(148, 163, 184, 0.15)", text: "#475569", border: "1px solid #94a3b8" };
      case "Gold": return { bg: "rgba(234, 179, 8, 0.12)", text: "#a16207", border: "1px solid #eab308" };
      case "Silver": return { bg: "rgba(100, 116, 139, 0.1)", text: "#64748b", border: "1px solid #cbd5e1" };
      default: return { bg: "rgba(180, 83, 9, 0.08)", text: "#b45309", border: "1px solid #f59e0b" };
    }
  };

  const handleOpenAdjust = (m) => {
    setActiveMember(m);
    setPointsInput(String(m.loyalty_points || 0));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pointsInput === "" || isNaN(Number(pointsInput))) {
      alert("Please enter a valid points amount.");
      return;
    }

    try {
      await API.put(`/admin/loyalty/${activeMember.client_id}`, {
        loyalty_points: Number(pointsInput)
      });
      setShowModal(false);
      fetchLoyaltyMembers();
    } catch (err) {
      console.error("[LoyaltyManagement] Save failed:", err);
      alert("Failed to adjust points balance.");
    }
  };

  return (
    <AdminLayout>
      <header style={headerContainer}>
        <h1 style={titleStyle}>Loyalty Program</h1>
        <p style={subtitleStyle}>Track and reward our most frequent pet parents</p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "6rem", color: "var(--slate-400)", fontWeight: "600" }}>
          Synchronizing loyalty ledger...
        </div>
      ) : members.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem", color: "var(--slate-400)", fontWeight: "600" }}>
          No registered client accounts found in the system.
        </div>
      ) : (
        <div style={grid}>
          {members.map((u) => {
            const tier = determineLevel(u.loyalty_points);
            const styleBadge = getTierColor(tier);
            const clientName = u.first_name || u.last_name 
              ? `${u.first_name || ""} ${u.last_name || ""}`.trim() 
              : "Unboarded Account";

            return (
              <div key={u.client_id} style={card}>
                <div style={{
                  ...levelBadge,
                  background: styleBadge.bg,
                  color: styleBadge.text,
                  border: styleBadge.border
                }}>{tier} Member</div>
                
                <h3 style={{
                  ...userName,
                  color: (u.first_name || u.last_name) ? "var(--slate-800)" : "var(--slate-400)",
                  fontStyle: (u.first_name || u.last_name) ? "normal" : "italic"
                }}>{clientName}</h3>
                <p style={emailText}>{u.email}</p>

                <div style={pointsContainer}>
                  <span style={pointsValue}>{(u.loyalty_points || 0).toLocaleString()}</span>
                  <span style={pointsLabel}>Points Earned</span>
                </div>

                <button style={primaryBtn} onClick={() => handleOpenAdjust(u)}>Adjust Balance</button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h2 style={modalTitle}>Adjust Loyalty Balance</h2>
            <p style={modalSubtitle}>
              Modify loyalty ledger balance for: <br />
              <strong>{activeMember?.first_name || activeMember?.last_name ? `${activeMember.first_name || ""} ${activeMember.last_name || ""}`.trim() : activeMember?.email}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div style={formGroup}>
                <label style={label}>Loyalty Balance (Points) *</label>
                <input
                  type="number"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  placeholder="e.g. 500"
                  style={input}
                  min="0"
                  required
                />
              </div>

              <div style={modalActions}>
                <button type="button" style={cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={saveBtn}>Confirm adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/* 🎨 STYLES */

const headerContainer = {
  marginBottom: "2.5rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const subtitleStyle = {
  color: "var(--slate-600)",
  fontSize: "1.1rem"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "1.5rem"
};

const card = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "24px",
  textAlign: "center",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--slate-100)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.8rem"
};

const levelBadge = {
  padding: "0.3rem 0.8rem",
  borderRadius: "20px",
  fontSize: "0.75rem",
  fontWeight: "800",
  textTransform: "uppercase"
};

const userName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.25rem",
  fontWeight: "700",
  margin: "0.4rem 0 0 0"
};

const emailText = {
  color: "var(--slate-400)",
  fontSize: "0.85rem",
  margin: "-0.4rem 0 0.5rem 0",
  wordBreak: "break-all"
};

const pointsContainer = {
  display: "flex",
  flexDirection: "column",
  margin: "0.5rem 0 1rem 0"
};

const pointsValue = {
  fontSize: "2.5rem",
  color: "var(--primary-green)",
  fontWeight: "800",
  lineHeight: "1"
};

const pointsLabel = {
  fontSize: "0.8rem",
  color: "var(--slate-400)",
  fontWeight: "600",
  textTransform: "uppercase",
  marginTop: "0.4rem"
};

const primaryBtn = {
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  padding: "0.7rem 1.5rem",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
  width: "100%",
  transition: "opacity 0.2s"
};

// Modal Design Styles
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(15, 23, 42, 0.3)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContent = {
  background: "white",
  borderRadius: "24px",
  padding: "2.5rem",
  width: "440px",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
  border: "1px solid var(--slate-100)"
};

const modalTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.6rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  marginBottom: "0.5rem"
};

const modalSubtitle = {
  color: "var(--slate-600)",
  fontSize: "0.95rem",
  lineHeight: "1.5",
  marginBottom: "1.8rem"
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginBottom: "1.5rem"
};

const label = {
  fontSize: "0.85rem",
  fontWeight: "700",
  color: "var(--slate-700)"
};

const input = {
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-200)",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "inherit"
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.8rem",
  marginTop: "2rem"
};

const cancelBtn = {
  padding: "0.8rem 1.5rem",
  background: "var(--slate-100)",
  color: "var(--slate-700)",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700"
};

const saveBtn = {
  padding: "0.8rem 1.5rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700"
};

export default LoyaltyManagement;