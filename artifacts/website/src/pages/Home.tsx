import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Star, Clock, MapPin, Flame, Leaf, ChevronRight, ArrowRight,
  Fish, UtensilsCrossed, Droplets, Users, GlassWater, Cookie,
  Navigation, CheckCircle, Bike, Phone, ChefHat,
  ShoppingBag, Store, HeartHandshake, Plus, Check, ExternalLink,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import ProductModal from "@/components/ProductModal";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1559742811-822873691df8?w=600&q=80&fit=crop";

interface Category { id: number; name: string; }
interface Product {
  id: number; name: string; description: string; price: string;
  discountedPrice?: string; imageUrl: string;
  isVegetarian: boolean; spiceLevel: number; preparationTime: number;
  isFeatured: boolean; isBestSeller: boolean;
}

const HERO_SLIDES = [
  {
    title: "Authentic Seafood,\nDelivered Fresh",
    sub: "Premium seafood from Egypt's finest coastal kitchen, at your door in 30 minutes.",
    img: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1800&fit=crop&auto=format&q=80",
    badge: "Signature Dishes",
  },
  {
    title: "The Ocean\non Your Plate",
    sub: "Handpicked daily catch, prepared by award-winning chefs using traditional recipes.",
    img: "https://images.unsplash.com/photo-1559742811-822873691df8?w=1800&fit=crop&auto=format&q=80",
    badge: "Chef's Specials",
  },
  {
    title: "Free Delivery\nAll This Week",
    sub: "Order above EGP 300 and get free delivery to your door. Limited time offer.",
    img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1800&fit=crop&auto=format&q=80",
    badge: "Limited Offer",
  },
];

const BRANCHES = [
  { id: 4, name: "Sea Gull Sheikh Zayed", area: "Sheikh Zayed, Giza", address: "Beverly Hills, Sheikh Zayed, Giza", phone: "+20 2 3854-1234", hours: "11:00 AM – 2:00 AM", delivery: "20–35 min", lat: 30.0131, lng: 30.9718 },
  { id: 5, name: "Sea Gull Madinaty",     area: "Madinaty, New Cairo", address: "Street 1, Madinaty, New Cairo",   phone: "+20 2 2618-5678", hours: "11:00 AM – 2:00 AM", delivery: "25–40 min", lat: 30.1022, lng: 31.6318 },
  { id: 6, name: "Sea Gull Fifth Settlement", area: "Fifth Settlement, New Cairo", address: "Fifth Settlement, New Cairo", phone: "+20 2 2618-9012", hours: "11:00 AM – 2:00 AM", delivery: "25–40 min", lat: 30.0094, lng: 31.4649 },
  { id: 7, name: "Sea Gull 6th October", area: "6th October, Giza", address: "6th of October City, Giza",         phone: "+20 2 3825-6789", hours: "11:00 AM – 2:00 AM", delivery: "30–45 min", lat: 29.9600, lng: 30.9180 },
];

const REVIEWS = [
  { name: "Ahmed R.", area: "Fifth Settlement", rating: 5, text: "Best seafood in Cairo, hands down. The Mixed Seafood Grill was spectacular — fresh, perfectly cooked, and delivered piping hot in under 35 minutes.", avatar: "AR" },
  { name: "Sara M.", area: "Sheikh Zayed", rating: 5, text: "We order every Friday for family dinner. Quality is always outstanding. The Family Seafood Feast is incredible value and feeds 4–6 people beautifully.", avatar: "SM" },
  { name: "Omar K.", area: "Madinaty", rating: 5, text: "Fresh, delicious, and consistently excellent. The Lobster Bisque is unlike anything else in the city. Highly recommended for special occasions.", avatar: "OK" },
];

const HOW_STEPS = [
  { icon: Navigation, titleKey: "howStep1Title", descKey: "howStep1Desc", title: "Detect your location", desc: "We find your nearest branch automatically, or you choose one manually." },
  { icon: ShoppingBag, title: "Pick your favorites", desc: "Browse our full menu by category, search dishes, and add items to cart." },
  { icon: Bike, title: "Fast doorstep delivery", desc: "Your order is prepared fresh and delivered by our team in 20–45 minutes." },
];

function getCatIcon(name: string) {
  const l = name.toLowerCase();
  if (l.includes("seafood") || l.includes("fish") || l.includes("sultan") || l.includes("calamari")) return Fish;
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

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function imgSrc(url?: string) {
  if (!url || url.trim() === "") return FALLBACK_IMG;
  return url;
}

export default function HomePage({ onAuthRequired: _onAuthRequired }: { onAuthRequired: () => void }) {
  const { addItem } = useCart();
  const { t, isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [adding, setAdding] = useState<number | null>(null);
  const [nearestBranch, setNearestBranch] = useState<number | null>(null);
  const [locDetecting, setLocDetecting] = useState(false);
  const [modalProductId, setModalProductId] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const featView = useInView();
  const howView = useInView();
  const branchView = useInView();
  const reviewView = useInView();

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/categories`).then((r) => r.json()).catch(() => []),
      fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/products?featured=true`).then((r) => r.json()).catch(() => []),
    ]).then(([cats, prods]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      const p = Array.isArray(prods) ? prods : prods?.products ?? [];
      setFeatured(p.slice(0, 8));
    }).finally(() => setLoading(false));

    intervalRef.current = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest = BRANCHES[0];
        let minDist = Infinity;
        for (const b of BRANCHES) {
          const d = haversine(latitude, longitude, b.lat, b.lng);
          if (d < minDist) { minDist = d; nearest = b; }
        }
        setNearestBranch(nearest.id);
        setLocDetecting(false);
      },
      () => setLocDetecting(false)
    );
  }, []);

  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setAdding(product.id);
    addItem({ productId: product.id, name: product.name, price: Number(product.price), quantity: 1, image: imgSrc(product.imageUrl) });
    setTimeout(() => setAdding(null), 900);
  };

  const cur = HERO_SLIDES[slide];
  const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <div style={{ background: "#fff", direction: isRTL ? "rtl" : "ltr" }}>

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 600, maxHeight: 800, overflow: "hidden" }}>
        {HERO_SLIDES.map((s, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, backgroundImage: `url(${s.img})`, backgroundSize: "cover", backgroundPosition: "center", transition: "opacity 1.2s ease", opacity: i === slide ? 1 : 0 }} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.15) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center" }}>
          <div className="sg-container" style={{ padding: "0 24px", width: "100%" }}>
            <div style={{ maxWidth: 580 }}>
              <motion.div key={slide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--primary)", color: "#fff",
                  borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 20,
                }}>
                  {cur.badge}
                </span>
                <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, color: "#fff", lineHeight: 1.08, letterSpacing: "-1px", marginBottom: 20, whiteSpace: "pre-line" }}>
                  {cur.title}
                </h1>
                <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", marginBottom: 36, lineHeight: 1.6, maxWidth: 460 }}>{cur.sub}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/menu" style={{ textDecoration: "none" }}>
                    <button className="sg-btn sg-btn-primary" style={{ fontSize: 15, padding: "14px 28px" }}>
                      {t("orderNow")} <ArrowRight size={16} />
                    </button>
                  </Link>
                  <Link href="/menu" style={{ textDecoration: "none" }}>
                    <button className="sg-btn sg-btn-outline-white" style={{ fontSize: 15, padding: "14px 28px" }}>
                      {t("viewMenu")}
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 3 }}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setSlide(i);
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 6000);
              }}
              style={{
                width: i === slide ? 28 : 8, height: 8, borderRadius: 4,
                background: i === slide ? "var(--primary)" : "rgba(255,255,255,0.4)",
                border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)" }}>
        <div className="sg-container" style={{ padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
            {[
              { icon: <Star size={18} fill="#F59E0B" color="#F59E0B" />, value: "4.9", label: t("rating") },
              { icon: <Clock size={18} color="var(--primary)" />, value: "25–40 min", label: t("deliveryTime") },
              { icon: <Store size={18} color="var(--primary)" />, value: "4", label: t("branches") },
              { icon: <Users size={18} color="var(--primary)" />, value: "10,000+", label: t("happyCustomers") },
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                padding: "20px 16px",
                borderInlineEnd: i < 3 ? "1px solid var(--border)" : "none",
              }}>
                {s.icon}
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "var(--dark)", lineHeight: 1.1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 1 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CATEGORIES ─── */}
      <section style={{ background: "var(--bg-alt)", padding: "56px 24px" }}>
        <div className="sg-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{t("browseByCategory")}</p>
              <h2 className="sg-section-title">{t("whatCraving")}</h2>
            </div>
            <Link href="/menu" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--primary)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              {t("seeAll")} <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
              {[...Array(8)].map((_, i) => <div key={i} className="sg-skeleton" style={{ height: 110, borderRadius: 16 }} />)}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
              {categories.map((cat, idx) => {
                const Icon = getCatIcon(cat.name);
                return (
                  <Link key={cat.id} href={`/menu?category=${cat.id}`} style={{ textDecoration: "none" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      style={{
                        background: "#fff", borderRadius: 16, padding: "18px 10px",
                        textAlign: "center", cursor: "pointer",
                        border: "1.5px solid var(--border)",
                        transition: "all 0.2s",
                      }}
                      whileHover={{ y: -3, boxShadow: "0 4px 16px rgba(11,126,164,0.12)", borderColor: "rgba(11,126,164,0.3)" }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "var(--primary-light)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 10px",
                      }}>
                        <Icon size={20} color="var(--primary)" />
                      </div>
                      <p style={{ color: "var(--dark)", fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{cat.name}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── FEATURED DISHES ─── */}
      <section style={{ padding: "72px 24px", background: "#fff" }} ref={featView.ref}>
        <div className="sg-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{t("featured")}</p>
              <h2 className="sg-section-title">{t("chefsPick")}</h2>
              <p className="sg-section-sub" style={{ marginTop: 4 }}>{t("chefsPickSub")}</p>
            </div>
            <Link href="/menu" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--primary)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              {t("fullMenu")} <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="sg-skeleton" style={{ height: 320, borderRadius: 16 }} />)}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {featured.map((p, idx) => (
                <motion.div
                  key={p.id}
                  className="sg-card"
                  initial={featView.visible ? { opacity: 0, y: 20 } : {}}
                  animate={featView.visible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: idx * 0.07, duration: 0.4 }}
                  style={{ cursor: "pointer" }}
                  onClick={() => setModalProductId(p.id)}
                >
                  {/* Image */}
                  <div style={{ position: "relative", height: 190, background: "var(--gray-100)", overflow: "hidden" }}>
                    <img
                      src={imgSrc(p.imageUrl)}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
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
                      <div style={{ position: "absolute", bottom: 10, insetInlineEnd: 10, background: "rgba(0,0,0,0.65)", borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} color="rgba(255,255,255,0.8)" />
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{p.preparationTime} min</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--dark)", marginBottom: 5, lineHeight: 1.3 }}>{p.name}</h3>
                    <p style={{ fontSize: 12.5, color: "var(--gray-500)", lineHeight: 1.5, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
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
                        onClick={(e) => addToCart(e, p)}
                        className="sg-btn sg-btn-primary"
                        style={{ padding: "8px 16px", fontSize: 13, borderRadius: 8 }}
                      >
                        {adding === p.id ? <><Check size={14} /> {t("added")}</> : <><Plus size={14} /> {t("addToCart")}</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ background: "var(--primary-light)", padding: "72px 24px" }} ref={howView.ref}>
        <div className="sg-container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{t("simpleProcess")}</p>
            <h2 className="sg-section-title">{t("howItWorks")}</h2>
            <p className="sg-section-sub">{t("freshFoodAtDoor")}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={howView.visible ? { opacity: 0, y: 24 } : {}}
                animate={howView.visible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                style={{ textAlign: "center" }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "var(--primary)", margin: "0 auto 20px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(11,126,164,0.3)",
                }}>
                  <step.icon size={28} color="#fff" />
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, background: "var(--dark)", borderRadius: "50%", fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--dark)", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OUR BRANCHES ─── */}
      <section style={{ background: "#fff", padding: "72px 24px" }} ref={branchView.ref}>
        <div className="sg-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{t("locations")}</p>
              <h2 className="sg-section-title">{t("ourBranches")}</h2>
              <p className="sg-section-sub">{t("findNearest")}</p>
            </div>
            <button
              onClick={detectLocation}
              disabled={locDetecting}
              className="sg-btn"
              style={{ background: "var(--dark)", color: "#fff", padding: "10px 20px", fontSize: 13, borderRadius: 10, opacity: locDetecting ? 0.7 : 1 }}
            >
              <Navigation size={15} />
              {locDetecting ? t("detecting") : t("detectLocation")}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {BRANCHES.map((b, i) => {
              const isNearest = nearestBranch === b.id;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`;
              return (
                <motion.div
                  key={b.id}
                  initial={branchView.visible ? { opacity: 0, y: 20 } : {}}
                  animate={branchView.visible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{
                    background: "#fff",
                    border: `2px solid ${isNearest ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: 16, padding: 24, position: "relative",
                    boxShadow: isNearest ? "0 4px 20px rgba(11,126,164,0.14)" : "var(--shadow-sm)",
                    transition: "all 0.3s",
                  }}
                >
                  {isNearest && (
                    <span style={{
                      position: "absolute", top: -12, insetInlineStart: 20,
                      background: "var(--primary)", color: "#fff",
                      borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <Navigation size={10} /> {t("nearestBranch")}
                    </span>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--dark)", marginBottom: 2 }}>{b.name}</h3>
                      <p style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 600 }}>{b.area}</p>
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MapPin size={18} color="var(--primary)" />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                    {[
                      { icon: MapPin, text: b.address },
                      { icon: Clock, text: b.hours },
                      { icon: Bike, text: `Delivery: ${b.delivery}` },
                      { icon: Phone, text: b.phone },
                    ].map(({ icon: Icon, text }, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={13} color="var(--gray-400)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--gray-700)" }}>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href="/menu" style={{ textDecoration: "none", flex: 1 }}>
                      <button className="sg-btn sg-btn-primary" style={{ width: "100%", fontSize: 13, justifyContent: "center" }}>
                        {t("orderFromBranch")}
                      </button>
                    </Link>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 42, height: 42, borderRadius: 10,
                        background: "var(--gray-50)", border: "1px solid var(--border)",
                        color: "var(--gray-500)", textDecoration: "none", flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                      title={t("viewOnMaps")}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--primary-light)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(11,126,164,0.3)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"; (e.currentTarget as HTMLElement).style.color = "var(--gray-500)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── DOWNLOAD APP ─── */}
      <section style={{ background: "var(--dark)", padding: "72px 24px", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: -60, insetInlineEnd: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(11,126,164,0.1)" }} />
        <div style={{ position: "absolute", bottom: -80, insetInlineStart: -40, width: 250, height: 250, borderRadius: "50%", background: "rgba(11,126,164,0.07)" }} />
        <div className="sg-container" style={{ position: "relative" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>{t("mobileApp")}</p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 14, lineHeight: 1.2 }}>
            {t("orderAnywhere")}
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 28, maxWidth: 420 }}>
            {t("mobileAppSub")}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
            {[t("appStore"), t("googlePlay")].map((store) => (
              <button key={store} className="sg-btn" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "12px 20px", fontSize: 13, borderRadius: 10 }}>
                <Phone size={15} /> {store}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[t("realTimeTracking"), t("loyaltyPoints"), t("exclusiveDeals"), t("easyReordering")].map((feat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} color="var(--primary)" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section style={{ background: "var(--bg-alt)", padding: "72px 24px" }} ref={reviewView.ref}>
        <div className="sg-container">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{t("testimonials")}</p>
            <h2 className="sg-section-title">{t("whatCustomersSay")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {REVIEWS.map((r, i) => (
              <motion.div
                key={i}
                initial={reviewView.visible ? { opacity: 0, y: 20 } : {}}
                animate={reviewView.visible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
              >
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {[...Array(r.rating)].map((_, j) => <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontSize: 14, color: "var(--gray-700)", lineHeight: 1.6, marginBottom: 18 }}>"{r.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                    {r.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dark)" }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: "var(--gray-500)" }}>{r.area}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section style={{ background: "var(--primary)", padding: "60px 24px", textAlign: "center" }}>
        <div className="sg-container" style={{ maxWidth: 640 }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, color: "#fff", marginBottom: 12, letterSpacing: "-0.5px" }}>
            {t("readyToExperience")}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, marginBottom: 28, lineHeight: 1.5 }}>
            {t("ctaSub")}
          </p>
          <Link href="/menu" style={{ textDecoration: "none" }}>
            <button className="sg-btn" style={{ background: "#fff", color: "var(--primary)", fontSize: 15, padding: "14px 32px", fontWeight: 700, borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
              {t("orderNow")} <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "var(--dark)", padding: "52px 24px 32px" }}>
        <div className="sg-container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <img src={LOGO_SRC} alt="Sea Gull" style={{ height: 44, width: "auto", borderRadius: "50%", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Sea Gull Restaurant</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 260 }}>
                {t("tagline")}
              </p>
            </div>

            {[
              { title: "Menu", links: ["Seafood", "Grilled", "Salads", "Desserts", "Beverages"] },
              { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
              { title: "Support", links: ["Help Center", "Track Order", "Contact Us", "Privacy Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>{col.title}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map((link) => (
                    <a key={link} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 Sea Gull Restaurant. {t("allRightsReserved")}</p>
            <div style={{ display: "flex", gap: 16 }}>
              {[t("privacy"), t("terms"), t("cookies")].map((item) => (
                <a key={item} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {modalProductId !== null && (
        <ProductModal productId={modalProductId} onClose={() => setModalProductId(null)} />
      )}
    </div>
  );
}
