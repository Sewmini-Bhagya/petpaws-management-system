import { useState } from "react";
import { 
  FiPrinter, 
  FiFileText, 
  FiDownload, 
  FiCheckCircle, 
  FiClock,
  FiCreditCard,
  FiActivity,
  FiArrowRight,
  FiAlertCircle
} from "react-icons/fi";
import API from "../../api/axios";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";

/**
 * ReceptionInvoicePrint Component
 */
function ReceptionInvoicePrint() {
  const [invoiceId, setInvoiceId] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadInvoice = async () => {
    if (!invoiceId) return setError("Invoice reference code is required.");
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get(`/invoices/${invoiceId}/print`);
      setInvoice(res.data);
    } catch (err) {
      console.error("[Billing] invoice retrieval failed:", err);
      setInvoice(null);
      setError("Failed to locate clinical record for this reference.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isPaid = (invoice?.summary?.remaining || 0) <= 0;

  return (
    <ReceptionistLayout active="invoice">
      <div className="no-print">
        <header style={headerWrapper}>
          <div style={titleGroup}>
            <h1 style={titleStyle}>Document Terminal</h1>
            <p style={subtitleStyle}>Retrieve and authorize clinical financial records for physical distribution.</p>
          </div>
        </header>

        <div style={terminalToolbar}>
          <div style={inputGroup}>
            <FiFileText style={inputIcon} />
            <input 
              style={terminalInput} 
              placeholder="INV-XXXXXX" 
              value={invoiceId} 
              onChange={(e) => setInvoiceId(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && loadInvoice()}
            />
          </div>
          <button style={loadBtn} onClick={loadInvoice} disabled={isLoading}>
            {isLoading ? "Fetching..." : "Retrieve Record"}
          </button>
          <button style={printBtn} onClick={handlePrint} disabled={!invoice}>
            <FiPrinter /> Authorize Print
          </button>
        </div>

        {error && (
          <div style={errorBanner}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}
      </div>

      {invoice && (
        <div style={invoiceWrapper}>
          <div style={invoiceHeader}>
            <div style={brandGroup}>
              <div style={logoCircle}><FiActivity /></div>
              <div>
                <h2 style={brandName}>PetPaws Clinic</h2>
                <span style={brandTagline}>Professional Veterinary Care</span>
              </div>
            </div>
            <div style={metaGroup}>
              <div style={metaBlock}>
                <span style={metaLabel}>Invoice ID</span>
                <span style={metaValue}>REF-{invoice.invoice?.invoice_id}</span>
              </div>
              <div style={metaBlock}>
                <span style={metaLabel}>Date Generated</span>
                <span style={metaValue}>{new Date(invoice.generated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div style={summaryGrid}>
            <div style={summaryCard}>
              <span style={summaryLabel}>Total Reconciliation</span>
              <span style={summaryValue}>Rs. {Number(invoice.summary?.total || invoice.invoice?.total_amount || 0).toFixed(2)}</span>
            </div>
            <div style={summaryCard}>
              <span style={summaryLabel}>Amount Collected</span>
              <span style={{ ...summaryValue, color: "var(--primary-green)" }}>Rs. {Number(invoice.summary?.paid || 0).toFixed(2)}</span>
            </div>
            <div style={summaryCard}>
              <span style={summaryLabel}>Balance Due</span>
              <span style={{ ...summaryValue, color: isPaid ? "var(--slate-400)" : "#EF4444" }}>Rs. {Number(invoice.summary?.remaining || 0).toFixed(2)}</span>
            </div>
          </div>

          <div style={detailsGrid}>
            <div style={detailSection}>
              <h3 style={sectionTitle}>Clinical Service Line Items</h3>
              <div style={itemList}>
                {(invoice.services || []).length === 0 ? (
                  <p style={emptyText}>No clinical services recorded.</p>
                ) : (
                  (invoice.services || []).map((s, idx) => (
                    <div key={idx} style={dataRow}>
                      <span style={rowDesc}>{s.description || `Clinical Service #${s.service_id}`}</span>
                      <span style={rowAmount}>Rs. {Number(s.amount || 0).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={detailSection}>
              <h3 style={sectionTitle}>Transaction History</h3>
              <div style={itemList}>
                {(invoice.payments || []).length === 0 ? (
                  <p style={emptyText}>No transactions authorized.</p>
                ) : (
                  (invoice.payments || []).map((p, idx) => (
                    <div key={idx} style={dataRow}>
                      <div style={paymentMeta}>
                        <FiCreditCard />
                        <span style={rowDesc}>{p.payment_method || "Direct Authorization"}</span>
                      </div>
                      <span style={rowAmount}>Rs. {Number(p.amount || 0).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={invoiceFooter}>
            <div style={statusSeal}>
              {isPaid ? (
                <><FiCheckCircle /> PAID IN FULL</>
              ) : (
                <><FiClock /> PAYMENT PENDING</>
              )}
            </div>
            <p style={disclaimer}>This is a computer-generated clinical record. Authorized by PetPaws Management.</p>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #root { padding: 0 !important; }
          main { margin: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </ReceptionistLayout>
  );
}

/* 🎨 STYLES */

const headerWrapper = {
  marginBottom: "3rem"
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

const terminalToolbar = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  background: "white",
  padding: "1rem",
  borderRadius: "24px",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
  marginBottom: "3rem",
  maxWidth: "700px"
};

const inputGroup = {
  position: "relative",
  flex: 1
};

const inputIcon = {
  position: "absolute",
  left: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--slate-400)"
};

const terminalInput = {
  width: "100%",
  padding: "0.85rem 1rem 0.85rem 2.75rem",
  borderRadius: "14px",
  border: "1px solid var(--slate-50)",
  background: "var(--slate-50)",
  fontSize: "1rem",
  outline: "none"
};

const loadBtn = {
  padding: "0.85rem 1.5rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "0.9rem",
  fontWeight: "800",
  cursor: "pointer"
};

const printBtn = {
  ...loadBtn,
  background: "var(--primary-green)",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem"
};

const errorBanner = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#EF4444",
  borderRadius: "16px",
  marginBottom: "2rem",
  fontWeight: "700",
  maxWidth: "700px"
};

const invoiceWrapper = {
  background: "white",
  borderRadius: "32px",
  padding: "4rem",
  maxWidth: "850px",
  margin: "0 auto",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "4rem"
};

const invoiceHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
};

const brandGroup = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem"
};

const logoCircle = {
  width: "56px",
  height: "56px",
  background: "var(--primary-green)",
  color: "white",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.75rem"
};

const brandName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const brandTagline = {
  fontSize: "0.9rem",
  color: "var(--slate-400)",
  fontWeight: "600"
};

const metaGroup = {
  display: "flex",
  gap: "3rem"
};

const metaBlock = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  textAlign: "right"
};

const metaLabel = {
  fontSize: "0.75rem",
  fontWeight: "800",
  color: "var(--slate-300)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const metaValue = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2rem",
  background: "var(--slate-50)",
  padding: "2.5rem",
  borderRadius: "24px"
};

const summaryCard = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};

const summaryLabel = {
  fontSize: "0.8rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase"
};

const summaryValue = {
  fontSize: "1.5rem",
  fontWeight: "900",
  color: "var(--slate-900)",
  fontFamily: "'Outfit', sans-serif"
};

const detailsGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "3rem"
};

const detailSection = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem"
};

const sectionTitle = {
  fontSize: "1rem",
  fontWeight: "900",
  color: "var(--slate-900)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "2px solid var(--slate-900)",
  paddingBottom: "0.75rem",
  width: "fit-content"
};

const itemList = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const dataRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.5rem 0"
};

const rowDesc = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "var(--slate-600)"
};

const rowAmount = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const paymentMeta = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  color: "var(--slate-400)"
};

const invoiceFooter = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  marginTop: "2rem",
  paddingTop: "3rem",
  borderTop: "1px solid var(--slate-100)"
};

const statusSeal = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 2rem",
  borderRadius: "12px",
  background: "var(--slate-900)",
  color: "white",
  fontSize: "0.9rem",
  fontWeight: "900",
  letterSpacing: "0.1em"
};

const disclaimer = {
  fontSize: "0.85rem",
  color: "var(--slate-400)",
  fontWeight: "500"
};

const emptyText = {
  fontSize: "0.9rem",
  color: "var(--slate-300)",
  fontStyle: "italic"
};

export default ReceptionInvoicePrint;
