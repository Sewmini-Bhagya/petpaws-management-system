import { useState } from "react";
import {
  FiCreditCard,
  FiFileText,
  FiDollarSign,
  FiPercent,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight
} from "react-icons/fi";
import API from "../../api/axios";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";

/**
 * ReceptionBilling Component
 */
function ReceptionBilling() {
  const [appointmentId, setAppointmentId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [discountType, setDiscountType] = useState("FLAT");
  const [discountValue, setDiscountValue] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const generateInvoice = async () => {
    if (!appointmentId) return setError("Clinical Appointment ID is required.");
    try {
      setIsLoading(true);
      setError("");
      setMessage("");
      const payload = {
        discount_type: discountType,
        discount_value: discountValue ? Number(discountValue) : undefined,
      };
      const res = await API.post(`/invoices/generate/${appointmentId}`, payload);
      setInvoiceId(String(res.data?.invoice_id || ""));
      setMessage(res.data?.message || "Protocol finalized. Invoice synthesized successfully.");
    } catch (err) {
      console.error("[Billing] invoice generation failed:", err);
      setError(err.response?.data?.message || "Invoice synthesis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const recordPayment = async () => {
    if (!invoiceId || !paymentAmount) return setError("Invoice reference and amount are required.");

    try {
      setIsLoading(true);
      setError("");
      setMessage("");
      const res = await API.post(`/payments/${invoiceId}`, {
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
      });
      setMessage(res.data?.message || "Payment reconciliation complete.");
      setPaymentAmount("");
    } catch (err) {
      console.error("[Billing] payment failed:", err);
      setError(err.response?.data?.message || "Transaction authorization failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReceptionistLayout active="billing">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Financial Terminal</h1>
          <p style={subtitleStyle}>Reconcile clinical services and authorize transaction protocols.</p>
        </div>
      </header>

      {message && (
        <div style={successBanner}>
          <FiCheckCircle />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div style={billingGrid}>
        {/* INVOICE GENERATION */}
        <section style={billingCard}>
          <div style={cardHeader}>
            <div style={iconBadge}><FiFileText /></div>
            <h3 style={cardTitle}>Invoice Synthesis</h3>
          </div>

          <div style={formWrapper}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Appointment Reference</label>
              <div style={inputWrapper}>
                <FiTag style={inputIcon} />
                <input
                  style={inputStyle}
                  placeholder="APP-XXXXXX"
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(e.target.value)}
                />
              </div>
            </div>

            <div style={dualFields}>
              <div style={fieldGroup}>
                <label style={labelStyle}>Discount Protocol</label>
                <select
                  style={selectStyle}
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="FLAT">Flat Amount ($)</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                </select>
              </div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Value</label>
                <div style={inputWrapper}>
                  {discountType === 'FLAT' ? <FiDollarSign style={inputIcon} /> : <FiPercent style={inputIcon} />}
                  <input
                    style={inputStyle}
                    placeholder="0.00"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              style={primaryBtn}
              onClick={generateInvoice}
              disabled={isLoading}
            >
              {isLoading ? "Synthesizing..." : "Generate Invoice Protocol"} <FiArrowRight />
            </button>
          </div>
        </section>

        {/* PAYMENT RECORDING */}
        <section style={{ ...billingCard, background: "var(--slate-900)", color: "white" }}>
          <div style={cardHeader}>
            <div style={{ ...iconBadge, background: "rgba(255,255,255,0.1)", color: "white" }}><FiCreditCard /></div>
            <h3 style={{ ...cardTitle, color: "white" }}>Transaction Authorization</h3>
          </div>

          <div style={formWrapper}>
            <div style={fieldGroup}>
              <label style={{ ...labelStyle, color: "var(--slate-400)" }}>Invoice Reference</label>
              <div style={inputWrapper}>
                <FiTag style={inputIcon} />
                <input
                  style={{ ...inputStyle, background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                  placeholder="INV-XXXXXX"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                />
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={{ ...labelStyle, color: "var(--slate-400)" }}>Authorization Amount</label>
              <div style={inputWrapper}>
                <FiDollarSign style={inputIcon} />
                <input
                  style={{ ...inputStyle, background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={{ ...labelStyle, color: "var(--slate-400)" }}>Method Selection</label>
              <div style={methodGrid}>
                {['CASH', 'CARD', 'ONLINE'].map(m => (
                  <button
                    key={m}
                    style={{
                      ...methodBtn,
                      background: paymentMethod === m ? "var(--primary-green)" : "rgba(255,255,255,0.05)",
                      color: paymentMethod === m ? "white" : "var(--slate-400)"
                    }}
                    onClick={() => setPaymentMethod(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              style={{ ...primaryBtn, background: "white", color: "var(--slate-900)" }}
              onClick={recordPayment}
              disabled={isLoading}
            >
              {isLoading ? "Authorizing..." : "Confirm Transaction"}
            </button>
          </div>
        </section>
      </div>
    </ReceptionistLayout>
  );
}

/* 🎨 STYLES */

const headerWrapper = {
  marginBottom: "3.5rem"
};

const titleGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const titleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "2.5rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const subtitleStyle = {
  color: "var(--slate-500)",
  fontSize: "1.1rem"
};

const successBanner = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "16px",
  marginBottom: "2rem",
  fontWeight: "700"
};

const errorBanner = {
  ...successBanner,
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444"
};

const billingGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "2.5rem",
  maxWidth: "1100px"
};

const billingCard = {
  background: "white",
  padding: "3rem",
  borderRadius: "32px",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)",
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem"
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem"
};

const iconBadge = {
  width: "52px",
  height: "52px",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem"
};

const cardTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const formWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "1.75rem"
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const inputWrapper = {
  position: "relative"
};

const inputIcon = {
  position: "absolute",
  left: "1.1rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--slate-400)"
};

const inputStyle = {
  width: "100%",
  padding: "1rem 1.25rem 1rem 3rem",
  borderRadius: "16px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "1rem",
  color: "var(--slate-900)",
  outline: "none",
  transition: "all 0.2s"
};

const dualFields = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.25rem"
};

const selectStyle = {
  width: "100%",
  padding: "1rem",
  borderRadius: "16px",
  border: "1px solid var(--slate-100)",
  background: "var(--slate-50)",
  fontSize: "0.95rem",
  fontWeight: "600",
  outline: "none",
  cursor: "pointer"
};

const methodGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "0.75rem"
};

const methodBtn = {
  padding: "0.85rem",
  borderRadius: "12px",
  border: "none",
  fontSize: "0.8rem",
  fontWeight: "800",
  cursor: "pointer",
  transition: "all 0.2s"
};

const primaryBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  padding: "1.25rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "20px",
  fontSize: "1rem",
  fontWeight: "800",
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
};

export default ReceptionBilling;
