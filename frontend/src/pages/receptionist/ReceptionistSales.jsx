import { useEffect, useState } from "react";
import {
  FiShoppingBag,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiCheckCircle,
  FiBox,
  FiArrowRight,
  FiDollarSign,
  FiX
} from "react-icons/fi";
import API from "../../api/axios";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";

/**
 * ReceptionistSales Component
 */
function ReceptionistSales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await API.get("/inventory");
        setProducts(res.data || []);
      } catch (err) {
        console.error("[POS] inventory synchronization failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.inventory_item_id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.inventory_item_id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [
        ...prev,
        {
          id: item.inventory_item_id,
          name: item.item_name,
          qty: 1,
          price: 50.00, // Normalized unit price
          available: item.quantity_available
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, Math.min(item.available, item.qty + delta));
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toFixed(2);
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      setIsProcessing(true);
      const items = cart.map((c) => ({
        inventory_item_id: c.id,
        quantity: c.qty,
        price: c.price,
      }));

      const res = await API.post("/invoices/walk-in", { items });
      setSuccessMsg(`Transaction finalized. Invoice REF-${res.data.invoice_id} generated.`);
      setCart([]);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error("[POS] checkout failed:", err);
      alert("Checkout failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ReceptionistLayout active="sales">
      <header style={headerWrapper}>
        <div style={titleGroup}>
          <h1 style={titleStyle}>Clinical Pharmacy</h1>
          <p style={subtitleStyle}>Process over-the-counter sales and clinical inventory requisitions.</p>
        </div>
      </header>

      {successMsg && (
        <div style={successBanner}>
          <FiCheckCircle />
          <span>{successMsg}</span>
          <button style={closeBtn} onClick={() => setSuccessMsg("")}><FiX /></button>
        </div>
      )}

      <div style={posGrid}>
        {/* INVENTORY CATALOG */}
        <div style={inventoryPanel}>
          <div style={panelHeader}>
            <h3 style={panelTitle}><FiBox /> Available Catalog</h3>
            <span style={countBadge}>{products.length} Products</span>
          </div>

          <div style={catalogGrid}>
            {isLoading ? (
              <div style={loaderStyle}>Synchronizing inventory data...</div>
            ) : (
              products.map((p) => (
                <div key={p.inventory_item_id} style={productCard}>
                  <div style={productThumb}>
                    <FiBox size={32} color="var(--slate-200)" />
                  </div>
                  <div style={productInfo}>
                    <h4 style={productName}>{p.item_name}</h4>
                    <div style={productMeta}>
                      <span style={stockTag}>{p.quantity_available} in stock</span>
                      <span style={priceTag}>$50.00</span>
                    </div>
                    <button
                      style={addBtn}
                      onClick={() => addToCart(p)}
                      disabled={p.quantity_available === 0}
                    >
                      {p.quantity_available === 0 ? "Out of Stock" : <><FiPlus /> Add to Cart</>}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SHOPPING CART */}
        <div style={cartPanel}>
          <div style={panelHeader}>
            <h3 style={panelTitle}><FiShoppingBag /> Requisition Cart</h3>
          </div>

          <div style={cartItemsList}>
            {cart.length === 0 ? (
              <div style={emptyCart}>
                <FiShoppingBag size={48} color="var(--slate-100)" />
                <p>Add products to initialize transaction protocol.</p>
              </div>
            ) : (
              cart.map((c) => (
                <div key={c.id} style={cartItem}>
                  <div style={cartItemMain}>
                    <span style={cartItemName}>{c.name}</span>
                    <span style={cartItemPrice}>${(c.price * c.qty).toFixed(2)}</span>
                  </div>
                  <div style={cartItemControls}>
                    <div style={qtyToggle}>
                      <button style={qtyBtn} onClick={() => updateQty(c.id, -1)}><FiMinus /></button>
                      <span style={qtyValue}>{c.qty}</span>
                      <button style={qtyBtn} onClick={() => updateQty(c.id, 1)}><FiPlus /></button>
                    </div>
                    <button style={deleteBtn} onClick={() => removeFromCart(c.id)}><FiTrash2 /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={cartFooter}>
              <div style={totalRow}>
                <span style={totalLabel}>Total Requisition</span>
                <span style={totalValue}>${calculateTotal()}</span>
              </div>
              <button
                style={checkoutBtn}
                onClick={checkout}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Finalize Transaction"} <FiArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
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

const successBanner = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.25rem 1.5rem",
  background: "rgba(107, 143, 113, 0.1)",
  color: "var(--primary-green)",
  borderRadius: "20px",
  marginBottom: "2.5rem",
  fontWeight: "700",
  position: "relative"
};

const closeBtn = {
  position: "absolute",
  right: "1rem",
  background: "transparent",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  fontSize: "1.1rem"
};

const posGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 380px",
  gap: "3rem",
  alignItems: "flex-start"
};

const inventoryPanel = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem"
};

const panelHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const panelTitle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem"
};

const countBadge = {
  background: "var(--slate-100)",
  color: "var(--slate-500)",
  padding: "0.4rem 0.8rem",
  borderRadius: "999px",
  fontSize: "0.8rem",
  fontWeight: "800"
};

const catalogGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: "1.5rem"
};

const productCard = {
  background: "white",
  borderRadius: "24px",
  overflow: "hidden",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  transition: "all 0.2s"
};

const productThumb = {
  height: "120px",
  background: "var(--slate-50)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const productInfo = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const productName = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  margin: 0
};

const productMeta = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const stockTag = {
  fontSize: "0.8rem",
  fontWeight: "700",
  color: "var(--slate-400)"
};

const priceTag = {
  fontSize: "1rem",
  fontWeight: "900",
  color: "var(--primary-green)"
};

const addBtn = {
  width: "100%",
  padding: "0.85rem",
  background: "var(--slate-900)",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "0.9rem",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem"
};

const cartPanel = {
  background: "white",
  borderRadius: "32px",
  padding: "2.5rem",
  border: "1px solid var(--slate-100)",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  position: "sticky",
  top: "120px"
};

const cartItemsList = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  minHeight: "200px"
};

const emptyCart = {
  textAlign: "center",
  padding: "3rem 1rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  color: "var(--slate-300)",
  fontSize: "0.9rem",
  fontWeight: "600"
};

const cartItem = {
  padding: "1.25rem",
  background: "var(--slate-50)",
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const cartItemMain = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem"
};

const cartItemName = {
  fontSize: "0.95rem",
  fontWeight: "800",
  color: "var(--slate-900)"
};

const cartItemPrice = {
  fontSize: "0.95rem",
  fontWeight: "900",
  color: "var(--slate-900)"
};

const cartItemControls = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const qtyToggle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  background: "white",
  padding: "0.4rem",
  borderRadius: "12px",
  border: "1px solid var(--slate-100)"
};

const qtyBtn = {
  width: "24px",
  height: "24px",
  background: "var(--slate-50)",
  color: "var(--slate-600)",
  border: "none",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "0.8rem"
};

const qtyValue = {
  fontSize: "0.9rem",
  fontWeight: "800",
  color: "var(--slate-900)",
  minWidth: "20px",
  textAlign: "center"
};

const deleteBtn = {
  background: "transparent",
  border: "none",
  color: "#EF4444",
  cursor: "pointer",
  fontSize: "1rem"
};

const cartFooter = {
  marginTop: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  paddingTop: "2rem",
  borderTop: "2px dashed var(--slate-100)"
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const totalLabel = {
  fontSize: "1rem",
  fontWeight: "800",
  color: "var(--slate-400)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const totalValue = {
  fontSize: "1.75rem",
  fontWeight: "900",
  color: "var(--slate-900)",
  fontFamily: "'Outfit', sans-serif"
};

const checkoutBtn = {
  width: "100%",
  padding: "1.25rem",
  background: "var(--primary-green)",
  color: "white",
  border: "none",
  borderRadius: "20px",
  fontSize: "1rem",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  boxShadow: "0 10px 15px -3px rgba(107, 143, 113, 0.3)"
};

const loaderStyle = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "4rem",
  color: "var(--slate-400)"
};

export default ReceptionistSales;