import { useState, useEffect, useContext } from "react";
import { FiSearch, FiFilter, FiShoppingBag, FiInfo, FiMapPin } from "react-icons/fi";
import ClientLayout from "../../components/client/ClientLayout";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { AuthContext } from "../../context/AuthContext";

const PRODUCTS = [
    { id: 1, name: "Premium Puppy Kibble", category: "Food", price: "4500", img: "https://images.unsplash.com/photo-1585559604153-f3900ed1477d?auto=format&fit=crop&q=80&w=400", desc: "High-protein for growing puppies" },
    { id: 2, name: "Orthopedic Memory Foam Bed", category: "Accessories", price: "8500", img: "https://images.unsplash.com/photo-1541599540903-216a46ca1dfc?auto=format&fit=crop&q=80&w=400", desc: "Maximum comfort for senior dogs" },
    { id: 3, name: "Feather Wand Pro", category: "Toys", price: "1200", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400", desc: "Engaging play for active cats" },
    { id: 4, name: "Natural Salmon Cat Food", category: "Food", price: "3800", img: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400", desc: "Grain-free and nutrient dense" },
    { id: 5, name: "Rubber Chew Bone", category: "Toys", price: "950", img: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400", desc: "Durable and safe for heavy chewers" },
    { id: 6, name: "Adjustable Harness (Blue)", category: "Accessories", price: "2400", img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400", desc: "Reflective and ergonomic design" },
    { id: 7, name: "Digestive Support Snacks", category: "Food", price: "1500", img: "https://images.unsplash.com/photo-1591768793355-74d7c869c1b1?auto=format&fit=crop&q=80&w=400", desc: "Probiotics for happy tummies" },
    { id: 8, name: "Cat Tower (3-Tier)", category: "Accessories", price: "12000", img: "https://images.unsplash.com/photo-1573865662567-d7de18ff33b4?auto=format&fit=crop&q=80&w=400", desc: "Includes scratch posts and perches" },
];

/**
 * ProductCatalogue Component
 */
function ProductCatalogue() {
    const { user } = useContext(AuthContext);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const categories = ["All", "Food", "Toys", "Accessories"];

    const filteredProducts = PRODUCTS.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    /**
     * Renders the modular shop content.
     */
    const renderContent = () => (
        <div style={container}>
            <header style={header}>
                <h1 style={title}>The PetPaws Boutique</h1>
                <p style={subtitle}>Curated essentials for a healthier, happier pet life.</p>
            </header>

            <div style={controls}>
                <div style={searchWrapper}>
                    <div style={searchBox}>
                        <FiSearch size={20} color="var(--slate-400)" />
                        <input
                            style={searchInput}
                            type="text"
                            placeholder="Search our collection..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={filterGroup}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    ...filterBtn,
                                    background: activeCategory === cat ? "var(--slate-900)" : "white",
                                    color: activeCategory === cat ? "white" : "var(--slate-600)",
                                    borderColor: activeCategory === cat ? "var(--slate-900)" : "var(--slate-200)"
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CLINIC AVAILABILITY BANNER */}
            <div style={infoBanner}>
                <div style={bannerIcon}><FiMapPin /></div>
                <div style={bannerContent}>
                    <h4 style={bannerTitle}>Available in Clinic</h4>
                    <p style={bannerText}>All products listed below are available for immediate purchase at our central facility. Visit us to browse our full range.</p>
                </div>
            </div>

            <div style={productGrid}>
                {filteredProducts.map(product => (
                    <div key={product.id} style={productCard}>
                        <div style={imgContainer}>
                            <img src={product.img} alt={product.name} style={imgStyle} />
                            <span style={categoryBadge}>{product.category}</span>
                        </div>
                        <div style={pInfo}>
                            <h3 style={pName}>{product.name}</h3>
                            <p style={pDesc}>{product.desc}</p>
                            <div style={pFooter}>
                                <div style={priceGroup}>
                                    <span style={pPrice}>Rs. {parseInt(product.price).toLocaleString()}</span>
                                    <span style={priceLabel}>In-Store Only</span>
                                </div>
                                <button style={shopBtn} title="View Details">
                                    <FiShoppingBag size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div style={noResults}>
                    <FiInfo size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
                    <p>We couldn't find any products matching your search criteria.</p>
                </div>
            )}
        </div>
    );

    if (user && user.role === "CLIENT") {
        return <ClientLayout active="shop">{renderContent()}</ClientLayout>;
    }

    return (
        <div style={publicPageWrapper}>
            <Navbar />
            <div style={publicInner}>
                {renderContent()}
            </div>
            <Footer />
        </div>
    );
}

/* 🎨 STYLES */

const publicPageWrapper = {
    background: "var(--slate-50)",
    minHeight: "100vh"
};

const publicInner = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "4rem 0"
};

const container = {
    padding: "0 2rem"
};

const header = {
    textAlign: "center",
    marginBottom: "4rem"
};

const title = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "3rem",
    fontWeight: "800",
    color: "var(--slate-900)",
    marginBottom: "0.75rem"
};

const subtitle = {
    color: "var(--slate-500)",
    fontSize: "1.2rem"
};

const controls = {
    marginBottom: "3rem"
};

const searchWrapper = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem"
};

const searchBox = {
    width: "100%",
    maxWidth: "600px",
    background: "white",
    padding: "1rem 1.5rem",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
    border: "1px solid var(--slate-100)"
};

const searchInput = {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "1.1rem",
    color: "var(--slate-800)",
    background: "transparent"
};

const filterGroup = {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    justifyContent: "center"
};

const filterBtn = {
    padding: "0.75rem 1.75rem",
    borderRadius: "14px",
    border: "1px solid",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "700",
    transition: "all 0.2s"
};

const infoBanner = {
    maxWidth: "1200px",
    margin: "0 auto 3rem",
    background: "var(--primary-green)",
    color: "white",
    borderRadius: "24px",
    padding: "1.5rem 2.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    boxShadow: "0 10px 20px rgba(107, 143, 113, 0.2)"
};

const bannerIcon = {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem"
};

const bannerContent = {
    display: "flex",
    flexDirection: "column"
};

const bannerTitle = {
    fontSize: "1.1rem",
    fontWeight: "800",
    marginBottom: "0.2rem"
};

const bannerText = {
    fontSize: "0.95rem",
    opacity: 0.9
};

const productGrid = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2.5rem",
    paddingBottom: "4rem"
};

const productCard = {
    background: "white",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)",
    border: "1px solid var(--slate-100)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer"
};

const imgContainer = {
    position: "relative",
    height: "240px",
    overflow: "hidden"
};

const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease"
};

const categoryBadge = {
    position: "absolute",
    top: "1.25rem",
    right: "1.25rem",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(4px)",
    padding: "0.5rem 1rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "800",
    color: "var(--slate-900)",
    textTransform: "uppercase"
};

const pInfo = {
    padding: "2rem"
};

const pName = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "var(--slate-900)",
    marginBottom: "0.75rem"
};

const pDesc = {
    fontSize: "0.95rem",
    color: "var(--slate-500)",
    lineHeight: "1.6",
    marginBottom: "2rem",
    minHeight: "3rem"
};

const pFooter = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end"
};

const priceGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem"
};

const pPrice = {
    fontSize: "1.5rem",
    fontWeight: "900",
    color: "var(--primary-green)"
};

const priceLabel = {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "var(--slate-400)",
    textTransform: "uppercase"
};

const shopBtn = {
    background: "var(--slate-50)",
    color: "var(--slate-400)",
    border: "none",
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s"
};

const noResults = {
    textAlign: "center",
    padding: "6rem 2rem",
    color: "var(--slate-400)",
    background: "white",
    borderRadius: "32px",
    border: "1px solid var(--slate-100)",
    maxWidth: "600px",
    margin: "0 auto"
};

export default ProductCatalogue;
