import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShoppingCart, User, Menu, X, ChevronDown, LogOut, Package, Globe } from "lucide-react";

interface NavbarProps {
  onAuthClick: () => void;
  onCartClick: () => void;
}

export default function Navbar({ onAuthClick, onCartClick }: NavbarProps) {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { t, lang, toggleLang, isRTL } = useLanguage();
  const [loc] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [loc]);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/menu", label: t("menu") },
    { href: "/gallery", label: lang === "ar" ? "معرض الصور" : "Gallery" },
    { href: "/orders", label: t("myOrders") },
  ];

  const isActive = (href: string) => href === "/" ? loc === "/" : loc.startsWith(href);

  const navStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: scrolled ? "rgba(255,255,255,0.98)" : "#fff",
    backdropFilter: scrolled ? "blur(20px)" : "none",
    borderBottom: "1px solid var(--border)",
    padding: "0 24px",
    height: scrolled ? 60 : 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    transition: "height 0.25s, box-shadow 0.25s",
    boxShadow: scrolled ? "0 2px 20px rgba(13,45,68,0.09)" : "none",
    direction: isRTL ? "rtl" : "ltr",
  };

  const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <>
      <nav style={navStyle}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <img
            src={LOGO_SRC}
            alt="Sea Gull Restaurant"
            style={{
              height: scrolled ? 38 : 46,
              width: "auto",
              borderRadius: "50%",
              transition: "height 0.25s",
              objectFit: "contain",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling!.removeAttribute("style");
            }}
          />
          <span
            style={{ fontSize: 17, fontWeight: 800, color: "var(--dark)", letterSpacing: "-0.3px", display: "none" }}
          >
            Sea Gull
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }} className="hide-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                color: isActive(link.href) ? "var(--primary)" : "var(--gray-500)",
                fontWeight: isActive(link.href) ? 700 : 500,
                fontSize: 14,
                textDecoration: "none",
                background: isActive(link.href) ? "var(--primary-light)" : "transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.href)) {
                  (e.currentTarget as HTMLElement).style.background = "var(--gray-50)";
                  (e.currentTarget as HTMLElement).style.color = "var(--dark)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.href)) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--gray-500)";
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            title={lang === "en" ? "عربي" : "English"}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "var(--primary-light)", color: "var(--primary)",
              border: `1.5px solid rgba(11,126,164,0.2)`,
              borderRadius: 8, padding: "6px 12px",
              fontSize: 12, fontWeight: 800,
              cursor: "pointer", transition: "all 0.15s",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--primary-light)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}
          >
            <Globe size={13} />
            {lang === "en" ? "عربي" : "EN"}
          </button>

          {/* Cart */}
          <button
            onClick={onCartClick}
            style={{
              position: "relative",
              width: 42, height: 42, borderRadius: 10,
              background: count > 0 ? "var(--primary-light)" : "var(--gray-50)",
              border: `1px solid ${count > 0 ? "rgba(11,126,164,0.25)" : "var(--border)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: count > 0 ? "var(--primary)" : "var(--gray-500)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--primary-light)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = count > 0 ? "var(--primary-light)" : "var(--gray-50)"; (e.currentTarget as HTMLElement).style.color = count > 0 ? "var(--primary)" : "var(--gray-500)"; }}
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span style={{
                position: "absolute", top: -5, insetInlineEnd: -5,
                background: "var(--primary)", color: "#fff",
                borderRadius: "50%", width: 19, height: 19,
                fontSize: 10, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #fff",
              }}>
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--gray-50)",
                  border: "1px solid var(--border)",
                  borderRadius: 10, padding: "7px 12px",
                  cursor: "pointer", color: "var(--dark-2)", fontSize: 13, fontWeight: 600,
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#fff",
                }}>
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hide-mobile" style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name?.split(" ")[0]}</span>
                <ChevronDown size={14} color="var(--gray-400)" />
              </button>
              {userMenuOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setUserMenuOpen(false)} />
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)",
                    insetInlineEnd: 0,
                    background: "#fff", border: "1px solid var(--border)",
                    borderRadius: 14, padding: 8, minWidth: 200, zIndex: 91,
                    boxShadow: "var(--shadow-lg)",
                    direction: isRTL ? "rtl" : "ltr",
                  }}>
                    <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dark)" }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{user.phone}</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", color: "var(--dark-2)", textDecoration: "none", fontSize: 13, borderRadius: 8 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gray-50)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Package size={14} color="var(--gray-500)" /> {t("myOrders")}
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      style={{ width: "100%", textAlign: isRTL ? "right" : "left", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", color: "#EF4444", fontSize: 13, background: "none", border: "none", cursor: "pointer", borderRadius: 8 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <LogOut size={14} /> {t("signOut")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={onAuthClick} className="sg-btn sg-btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>
              <User size={14} /> {t("signIn")}
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="show-mobile"
            style={{
              display: "none", width: 42, height: 42, borderRadius: 10,
              background: "var(--gray-50)", border: "1px solid var(--border)",
              alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dark)",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 98 }} onClick={() => setMobileOpen(false)}>
          <div
            style={{
              position: "absolute", top: 0, left: 0, right: 0,
              background: "#fff", padding: "72px 16px 24px",
              display: "flex", flexDirection: "column", gap: 4,
              boxShadow: "var(--shadow-lg)",
              direction: isRTL ? "rtl" : "ltr",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "14px 16px", borderRadius: 10,
                  color: isActive(link.href) ? "var(--primary)" : "var(--dark-2)",
                  fontWeight: isActive(link.href) ? 700 : 500,
                  fontSize: 16, textDecoration: "none",
                  background: isActive(link.href) ? "var(--primary-light)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
            {/* Language toggle in mobile drawer */}
            <button
              onClick={() => { toggleLang(); setMobileOpen(false); }}
              style={{
                marginTop: 8, padding: "12px 16px", borderRadius: 10,
                background: "var(--primary-light)", color: "var(--primary)",
                border: `1.5px solid rgba(11,126,164,0.2)`,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <Globe size={16} />
              {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
