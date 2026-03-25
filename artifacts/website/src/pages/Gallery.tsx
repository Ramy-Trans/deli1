import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Smartphone, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const BASE = import.meta.env.BASE_URL;

const DISHES = [
  { file: "menu_screen-01_1774394948475.jpg", name: "Salmon Lemon", nameAr: "سالمون ليمون", desc: "Grilled salmon fillet in lemon butter sauce with sautéed vegetables" },
  { file: "menu_screen-02_1774394948476.jpg", name: "Salmon Teriyaki", nameAr: "سالمون ترياكي", desc: "Teriyaki-glazed salmon with stir-fried vegetables and sesame" },
  { file: "menu_screen-03_1774394948476.jpg", name: "Alexander Fish", nameAr: "سمك الكسندر", desc: "Sea bass fillet prepared Alexandria-style with aromatic spices" },
  { file: "menu_screen-04_1774394948476.jpg", name: "Beef Stroganoff", nameAr: "بيف استرجانوف", desc: "Tender beef strips in creamy mushroom sauce served over pasta" },
  { file: "menu_screen-05_1774394948477.jpg", name: "Chicken Crispy", nameAr: "تشكن كرسبي", desc: "Golden crispy chicken fillet with house-made dipping sauce" },
  { file: "menu_screen-06_1774394948477.jpg", name: "Creamy Seafood", nameAr: "كريمي سي فود", desc: "Mixed seafood medley in a rich creamy white sauce" },
  { file: "menu_screen-07_1774394948477.jpg", name: "Truffle Risotto", nameAr: "روزيتو ترافل", desc: "Creamy arborio rice with black truffle oil and parmesan" },
  { file: "menu_screen-08_1774394948478.jpg", name: "White Del Pasta", nameAr: "باستا وايت ديل", desc: "Pasta in delicate white sauce with premium seafood toppings" },
  { file: "menu_screen-09_1774394948478.jpg", name: "Crab Pasta", nameAr: "كراب باستا", desc: "Tagliatelle pasta with fresh crab meat in tomato-cream sauce" },
  { file: "menu_screen-10_1774394948479.jpg", name: "Truffle Pasta", nameAr: "باستا ترافل", desc: "Pappardelle pasta with black truffle cream and wild mushrooms" },
  { file: "menu_screen-11_1774394948479.jpg", name: "Boom Shrimp", nameAr: "بوم شرمب", desc: "Crispy tempura shrimp tossed in signature boom sauce" },
  { file: "menu_screen-12_1774394948479.jpg", name: "Arancini Seafood", nameAr: "ارانشي سي فود", desc: "Crispy risotto balls stuffed with mixed seafood and cheese" },
  { file: "menu_screen-13_1774394948479.jpg", name: "Seafood Fondue", nameAr: "فوندو ديب سي فود", desc: "Warm cheese fondue dip with fresh seafood and bread" },
  { file: "menu_screen-14_1774394948480.jpg", name: "Fritto Misto", nameAr: "فريتو ميستو", desc: "Classic Italian mixed seafood fry with calamari, shrimp and fish" },
  { file: "menu_screen-15_1774394948480.jpg", name: "Sea Gull Sandwich", nameAr: "ساندوتش سي جل", desc: "Our signature sandwich with crispy fish fillet and house sauce" },
  { file: "menu_screen-16_1774394948484.jpg", name: "California Salad", nameAr: "كاليفورنيا سالاد", desc: "Fresh greens with avocado, corn, crab and citrus dressing" },
];

export default function GalleryPage() {
  const { lang, isRTL } = useLanguage();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + DISHES.length) % DISHES.length : 0));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % DISHES.length : 0));

  return (
    <div style={{ direction: isRTL ? "rtl" : "ltr", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, var(--dark) 0%, #0B7EA4 100%)", padding: "72px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(11,126,164,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(11,126,164,0.2) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <Smartphone size={14} color="#fff" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "1px", textTransform: "uppercase" }}>App Gallery</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>
            {lang === "ar" ? "أطباقنا المميزة" : "Our Signature Dishes"}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", maxWidth: 540, margin: "0 auto 32px" }}>
            {lang === "ar"
              ? "تصفح قائمتنا المتنوعة من خلال تطبيقنا. اطلب الآن واستمتع بأفضل المأكولات البحرية."
              : "Explore our full menu through the Sea Gull app. Discover fresh seafood, pasta, and more — delivered in under 45 minutes."}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: lang === "ar" ? "طبق طازج" : "Fresh Dishes", val: "16+" },
              { label: lang === "ar" ? "تقييم" : "App Rating", val: "4.9", icon: <Star size={12} fill="#FFD700" color="#FFD700" /> },
              { label: lang === "ar" ? "دقيقة" : "Min Delivery", val: "30" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  {s.icon}
                  <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.val}</p>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {DISHES.map((dish, i) => (
            <div
              key={i}
              onClick={() => setLightbox(i)}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 2px 12px rgba(13,45,68,0.08)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(13,45,68,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(13,45,68,0.08)";
              }}
            >
              <div style={{ position: "relative", paddingTop: "62.5%", overflow: "hidden", background: "var(--dark)" }}>
                <img
                  src={`${BASE}menu-screens/${dish.file}`}
                  alt={dish.name}
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
              </div>
              <div style={{ padding: "14px 16px 16px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--dark)", marginBottom: 2 }}>
                  {lang === "ar" ? dish.nameAr : dish.name}
                </h3>
                {lang === "ar" && (
                  <p style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, marginBottom: 4 }}>{dish.name}</p>
                )}
                <p style={{ fontSize: 12.5, color: "var(--gray-500)", lineHeight: 1.5 }}>
                  {dish.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Download CTA */}
        <div style={{
          marginTop: 64,
          background: "linear-gradient(135deg, var(--dark) 0%, #0B7EA4 100%)",
          borderRadius: 24,
          padding: "48px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Smartphone size={30} color="#fff" />
            </div>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>
              {lang === "ar" ? "اطلب الآن عبر تطبيقنا" : "Order Now via the Sea Gull App"}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", maxWidth: 480, margin: "0 auto 28px" }}>
              {lang === "ar"
                ? "حمّل التطبيق واستمتع بتجربة طلب سهلة وسريعة مع تتبع طلبك لحظة بلحظة."
                : "Download the app for the easiest way to browse our full menu, track your order, and collect loyalty points."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "#fff", color: "var(--dark)",
                  borderRadius: 12, padding: "12px 24px",
                  textDecoration: "none", fontWeight: 800, fontSize: 14,
                }}
              >
                <svg viewBox="0 0 814 1000" style={{ width: 18, height: 18, flexShrink: 0 }} fill="currentColor">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-110.1c-41.9-62.9-78.5-163.2-78.5-259 0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
                {lang === "ar" ? "آب ستور" : "App Store"}
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.15)", color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  borderRadius: 12, padding: "12px 24px",
                  textDecoration: "none", fontWeight: 800, fontSize: 14,
                }}
              >
                <svg viewBox="0 0 512 512" style={{ width: 18, height: 18, flexShrink: 0 }} fill="currentColor">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l232.4-232.4L47 0zm412.6 222.7L380.3 174 295 259.3l85.3 85.3 81.8-46.8c23.4-13.4 23.4-51.5-.5-65.1zm-269 26.9l-195 195c3.2 1.1 6.6 1.9 10.1 1.9 8.7 0 17.5-2.7 24.2-7.4l214.4-123-53.7-66.5z"/>
                </svg>
                {lang === "ar" ? "جوجل بلاي" : "Google Play"}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setLightbox(null)}
        >
          <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: "fixed", left: 20, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 301 }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 301 }}>
            <ChevronRight size={24} />
          </button>
          <button onClick={() => setLightbox(null)} style={{ position: "fixed", top: 20, right: 20, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 301 }}>
            <X size={20} />
          </button>
          <div style={{ maxWidth: 700, width: "100%", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={`${BASE}menu-screens/${DISHES[lightbox].file}`}
              alt={DISHES[lightbox].name}
              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 16 }}
            />
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                {lang === "ar" ? DISHES[lightbox].nameAr : DISHES[lightbox].name}
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{DISHES[lightbox].desc}</p>
              <p style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{lightbox + 1} / {DISHES.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
