import { useEffect, useState, useCallback } from "react";
import {
  Search, Flame, Leaf, Fish, X, UtensilsCrossed,
  Droplets, Users, GlassWater, Cookie, ChefHat,
  HeartHandshake, Plus, Check, Clock, SlidersHorizontal,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import ProductModal from "@/components/ProductModal";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1559742811-822873691df8?w=600&q=80&fit=crop";

interface Category { id: number; name: string; }
interface Product {
  id: number; name: string; description: string; price: string;
  discountedPrice?: string; imageUrl: string; categoryId: number;
  isVegetarian: boolean; spiceLevel: number; preparationTime: number;
  isFeatured: boolean; isBestSeller: boolean;
}

function getCatIcon(name: string) {
  const l = name.toLowerCase();
  if (l.includes("seafood") || l.includes("fish")) return Fish;
  if (l.includes("grill") || l.includes("bbq") || l.includes("shrimp") || l.includes("prawn")) return Flame;
  if (l.includes("salad")) return Leaf;
  if (l.includes("soup")) return Droplets;
  if (l.includes("family") || l.includes("meal")) return Users;
  if (l.includes("kids") || l.includes("children")) return HeartHandshake;
  if (l.includes("dessert") || l.includes("sweet")) return Cookie;
  if (l.includes("drink") || l.includes("beverage") || l.includes("juice")) return GlassWater;
  if (l.includes("pasta") || l.includes("rice") || l.includes("mixed")) return ChefHat;
  return UtensilsCrossed;
}

function imgSrc(url?: string) {
  if (!url || url.trim() === "") return FALLBACK_IMG;
  return url;
}

export default function MenuPage() {
  const { addItem } = useCart();
  const { t, isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    return c ? Number(c) : null;
  });
  const [vegOnly, setVegOnly] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [modalProductId, setModalProductId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    let url = `${import.meta.env.VITE_API_URL ?? ""}/api/products?limit=200`;
    if (selectedCat) url += `&categoryId=${selectedCat}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    try {
      const data = await fetch(url).then((r) => r.json());
      setProducts(Array.isArray(data) ? data : data?.products ?? []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [selectedCat, search]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const filtered = vegOnly ? products.filter((p) => p.isVegetarian) : products;

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    setAdding(p.id);
    addItem({ productId: p.id, name: p.name, price: Number(p.price), quantity: 1, image: imgSrc(p.imageUrl) });
    setTimeout(() => setAdding(null), 900);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", direction: isRTL ? "rtl" : "ltr" }}>

      {/* Page header */}
      <div style={{ background: "var(--dark)", padding: "40px 24px 32px" }}>
        <div className="sg-container">
          <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 6 }}>
            {t("ourMenu")}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>{t("freshFromSea")}</p>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 60, zIndex: 40,
        padding: "14px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <div className="sg-container">
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
              <Search size={15} style={{ position: "absolute", insetInlineStart: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchDishes")}
                className="sg-input"
                style={{ paddingInlineStart: 38, paddingInlineEnd: search ? 36 : 14 }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", insetInlineEnd: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", display: "flex", alignItems: "center" }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Veg filter */}
            <button
              onClick={() => setVegOnly((p) => !p)}
              className="sg-btn"
              style={{
                padding: "9px 14px", fontSize: 13, borderRadius: 9,
                border: `1.5px solid ${vegOnly ? "var(--success)" : "var(--border)"}`,
                background: vegOnly ? "#F0FDF4" : "transparent",
                color: vegOnly ? "var(--success)" : "var(--gray-500)",
                fontWeight: 600,
              }}
            >
              <Leaf size={14} /> {t("vegetarian")}
            </button>
          </div>
        </div>
      </div>

      <div className="sg-page-content">
        {/* Category tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 28 }}>
          {[{ id: null, name: t("allItems") }, ...categories].map((cat) => {
            const active = cat.id === selectedCat || (cat.id === null && selectedCat === null);
            const Icon = cat.id ? getCatIcon(cat.name) : SlidersHorizontal;
            return (
              <button
                key={cat.id ?? "all"}
                onClick={() => setSelectedCat(cat.id)}
                style={{
                  flexShrink: 0, padding: "8px 16px", borderRadius: 10,
                  border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
                  background: active ? "var(--primary-light)" : "#fff",
                  color: active ? "var(--primary)" : "var(--gray-600)",
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  cursor: "pointer", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <Icon size={13} /> {cat.name}
              </button>
            );
          })}
        </div>

        {/* Count */}
        {!loading && (
          <p style={{ color: "var(--gray-400)", fontSize: 13, marginBottom: 20 }}>
            {filtered.length} {filtered.length !== 1 ? "items" : "item"}
          </p>
        )}

        {/* Products grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {[...Array(8)].map((_, i) => <div key={i} className="sg-skeleton" style={{ height: 300, borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <UtensilsCrossed size={28} color="var(--gray-300)" />
            </div>
            <p style={{ color: "var(--gray-700)", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t("noItemsFound")}</p>
            <p style={{ color: "var(--gray-400)", fontSize: 13 }}>{t("noItemsFoundSub")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {filtered.map((p) => (
              <div
                key={p.id}
                className="sg-card"
                style={{ cursor: "pointer" }}
                onClick={() => setModalProductId(p.id)}
              >
                {/* Image */}
                <div style={{ position: "relative", height: 190, background: "var(--gray-100)", overflow: "hidden" }}>
                  <img
                    src={imgSrc(p.imageUrl)}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s" }}
                    loading="lazy"
                    onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = "scale(1.04)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = "scale(1)"; }}
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                  />
                  {/* Tags */}
                  <div style={{ position: "absolute", top: 10, insetInlineStart: 10, display: "flex", gap: 4 }}>
                    {p.isBestSeller && <span className="sg-tag sg-tag-best">{t("bestSeller")}</span>}
                    {p.isVegetarian && <span className="sg-tag sg-tag-veg"><Leaf size={9} /> {t("veg")}</span>}
                    {p.spiceLevel > 0 && <span className="sg-tag sg-tag-spicy"><Flame size={9} /> {t("spicy")}</span>}
                  </div>
                  {p.preparationTime > 0 && (
                    <div style={{
                      position: "absolute", bottom: 10, insetInlineEnd: 10,
                      background: "rgba(0,0,0,0.6)", borderRadius: 6,
                      padding: "3px 8px", display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <Clock size={10} color="rgba(255,255,255,0.8)" />
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{p.preparationTime} min</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--dark)", marginBottom: 5, lineHeight: 1.3 }}>{p.name}</h3>
                  <p style={{
                    fontSize: 12.5, color: "var(--gray-500)", lineHeight: 1.5, marginBottom: 14,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{p.description}</p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      {p.discountedPrice && Number(p.discountedPrice) < Number(p.price) ? (
                        <>
                          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--primary)" }}>EGP {Number(p.discountedPrice).toFixed(0)}</span>
                          <span style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through", marginInlineStart: 6 }}>EGP {Number(p.price).toFixed(0)}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 17, fontWeight: 800, color: "var(--dark)" }}>EGP {Number(p.price).toFixed(0)}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="sg-btn sg-btn-primary"
                      style={{ padding: "8px 16px", fontSize: 13, borderRadius: 8 }}
                    >
                      {adding === p.id ? <><Check size={14} /> {t("added")}</> : <><Plus size={14} /> {t("addToCart")}</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {modalProductId !== null && (
        <ProductModal productId={modalProductId} onClose={() => setModalProductId(null)} />
      )}
    </div>
  );
}
