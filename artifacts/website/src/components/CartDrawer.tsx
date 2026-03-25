import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { X, Minus, Plus, ShoppingCart, Tag, Trash2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Fish } from "lucide-react";

interface CartDrawerProps {
  onClose: () => void;
  onAuthRequired: () => void;
}

export default function CartDrawer({ onClose, onAuthRequired }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, count, coupon, applyCoupon } = useCart();
  const { isAuthed } = useAuth();
  const [, setLoc] = useLocation();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = items.length > 0 ? 25 : 0;

  const applyCouponCode = async () => {
    if (!couponInput.trim()) return;
    setCouponError(""); setCouponLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), orderAmount: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon({ code: couponInput.trim().toUpperCase(), discount: data.discount, couponId: data.couponId });
        setCouponInput("");
      } else {
        setCouponError(data.message ?? "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const goCheckout = () => {
    if (!isAuthed) { onClose(); onAuthRequired(); return; }
    onClose();
    setLoc("/checkout");
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 150, backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "100%", maxWidth: 420, zIndex: 160,
        background: "#fff",
        display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 40px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingCart size={20} color="var(--primary)" />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--dark)" }}>Your Cart</h2>
            {count > 0 && (
              <span style={{
                background: "var(--primary-light)", color: "var(--primary)",
                borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700,
              }}>{count} items</span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 9,
              background: "var(--gray-100)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--gray-500)",
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {items.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, paddingTop: 60 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--gray-100)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShoppingCart size={34} color="var(--gray-300)" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "var(--dark)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Your cart is empty</p>
                <p style={{ color: "var(--gray-400)", fontSize: 13 }}>Add items from the menu to get started</p>
              </div>
              <button onClick={onClose} className="sg-btn sg-btn-outline" style={{ fontSize: 13, padding: "9px 20px" }}>Browse Menu</button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} style={{
                  display: "flex", gap: 12, padding: 14,
                  background: "var(--gray-50)",
                  borderRadius: 14, border: "1px solid var(--border)",
                }}>
                  {item.image ? (
                    <img
                      src={item.image} alt={item.name}
                      style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560717845-968823efbee1?w=120&q=80&fit=crop"; }}
                    />
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: 10, background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Fish size={22} color="var(--gray-300)" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "var(--dark)", fontWeight: 700, fontSize: 14, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    {item.variantName && <p style={{ color: "var(--gray-400)", fontSize: 12 }}>{item.variantName}</p>}
                    <p style={{ color: "var(--primary)", fontWeight: 700, fontSize: 14, marginTop: 6 }}>EGP {(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: "#fff", border: "1px solid var(--border)",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: "var(--dark)",
                        }}
                      ><Minus size={12} /></button>
                      <span style={{ color: "var(--dark)", fontWeight: 700, fontSize: 14, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: "var(--primary)", border: "none",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff",
                        }}
                      ><Plus size={12} /></button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-300)", padding: 2, display: "flex" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--gray-300)"; }}
                    ><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "16px 20px 24px", borderTop: "1px solid var(--border)" }}>
            {/* Coupon */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Tag size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                    placeholder="Promo code"
                    className="sg-input"
                    style={{ paddingLeft: 34, fontSize: 13 }}
                  />
                </div>
                <button
                  onClick={applyCouponCode}
                  disabled={couponLoading}
                  className="sg-btn sg-btn-dark"
                  style={{ padding: "10px 16px", fontSize: 13, borderRadius: 9, opacity: couponLoading ? 0.7 : 1 }}
                >
                  {couponLoading ? <span className="sg-spinner sg-spinner-white" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "Apply"}
                </button>
              </div>
              {couponError && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>{couponError}</p>}
              {coupon && (
                <p style={{ color: "var(--success)", fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                  {coupon.code} applied — EGP {coupon.discount.toFixed(0)} off
                </p>
              )}
            </div>

            {/* Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--gray-500)" }}>Subtotal</span>
                <span style={{ fontSize: 13, color: "var(--dark)", fontWeight: 600 }}>EGP {subtotal.toFixed(0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--gray-500)" }}>Delivery</span>
                <span style={{ fontSize: 13, color: "var(--dark)", fontWeight: 600 }}>EGP {deliveryFee}</span>
              </div>
              {coupon && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "var(--success)" }}>Discount ({coupon.code})</span>
                  <span style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>- EGP {coupon.discount.toFixed(0)}</span>
                </div>
              )}
              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--dark)" }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--primary)" }}>
                  EGP {(subtotal + deliveryFee - (coupon?.discount ?? 0)).toFixed(0)}
                </span>
              </div>
            </div>

            <button onClick={goCheckout} className="sg-btn sg-btn-primary" style={{ width: "100%", fontSize: 15, padding: "14px", justifyContent: "center", borderRadius: 10 }}>
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
