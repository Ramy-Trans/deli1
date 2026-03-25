import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { MapPin, CreditCard, Banknote, ChevronLeft, Check, Fish, UtensilsCrossed } from "lucide-react";

interface Branch { id: number; name: string; address: string; }

export default function CheckoutPage() {
  const { items, coupon, clearCart } = useCart();
  const { user, token } = useAuth();
  const [, setLoc] = useLocation();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [address, setAddress] = useState({ street: "", city: "", notes: "" });
  const [payMethod, setPayMethod] = useState<"cash" | "card">("cash");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setLoc("/"); return; }
    fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/branches`).then((r) => r.json()).then((b) => {
      setBranches(Array.isArray(b) ? b : []);
      if (b?.[0]) setSelectedBranch(b[0].id);
    }).catch(() => {});
  }, [token]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = 25;
  const grandTotal = subtotal + deliveryFee - (coupon?.discount ?? 0);

  const place = async () => {
    setError("");
    if (!address.street) { setError("Please enter your delivery address"); return; }
    if (!selectedBranch) { setError("Please select a branch"); return; }
    setLoading(true);
    try {
      const body = {
        branchId: selectedBranch,
        deliveryAddress: `${address.street}${address.city ? ", " + address.city : ""}`,
        deliveryNotes: address.notes || null,
        paymentMethod: payMethod,
        couponId: coupon?.couponId ?? null,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variantId: null, addOnIds: [] })),
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed to place order");
      setOrderId(data.id ?? data.orderId);
      setSuccess(true);
      clearCart();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#F0FDF4", border: "2px solid #16A34A",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}>
            <Check size={36} color="#16A34A" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--dark)", marginBottom: 8, letterSpacing: "-0.5px" }}>Order Placed!</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 15, marginBottom: 6 }}>Order <strong>#{orderId}</strong> has been received.</p>
          <p style={{ color: "var(--gray-400)", fontSize: 13, marginBottom: 32 }}>Estimated delivery: 25–40 minutes</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setLoc("/orders")} className="sg-btn sg-btn-primary" style={{ padding: "12px 24px" }}>Track My Order</button>
            <button onClick={() => setLoc("/menu")} className="sg-btn sg-btn-outline" style={{ padding: "12px 24px" }}>Order Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "100px 24px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <UtensilsCrossed size={28} color="var(--gray-300)" />
        </div>
        <p style={{ color: "var(--dark)", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Your cart is empty</p>
        <p style={{ color: "var(--gray-400)", fontSize: 13, marginBottom: 24 }}>Add items from the menu to checkout</p>
        <button onClick={() => setLoc("/menu")} className="sg-btn sg-btn-primary">Browse Menu</button>
      </div>
    );
  }

  const card = (children: React.ReactNode) => (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
      padding: 24, boxShadow: "var(--shadow-sm)",
    }}>
      {children}
    </div>
  );

  const sectionLabel = (text: string) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{text}</p>
  );

  return (
    <div style={{ background: "var(--bg-alt)", minHeight: "100vh", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <button
          onClick={() => window.history.back()}
          className="sg-btn sg-btn-ghost"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "8px 12px", borderRadius: 8, marginBottom: 24 }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--dark)", marginBottom: 28, letterSpacing: "-0.5px" }}>Checkout</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && (
              <div style={{ background: "var(--primary-light)", border: "1px solid rgba(11,126,164,0.2)", borderRadius: 12, padding: "12px 16px", color: "var(--primary)", fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* Delivery address */}
            {card(
              <>
                {sectionLabel("Delivery Address")}
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={16} color="var(--primary)" /> Where should we deliver?
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", color: "var(--gray-700)", fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}>Street Address *</label>
                    <input value={address.street} onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))} placeholder="123 Nile Street, Apt 4B" className="sg-input" />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "var(--gray-700)", fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}>City / Area</label>
                    <input value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} placeholder="Fifth Settlement, New Cairo" className="sg-input" />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "var(--gray-700)", fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}>Delivery Notes (optional)</label>
                    <textarea
                      value={address.notes}
                      onChange={(e) => setAddress((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Ring bell twice, leave at door..."
                      rows={2}
                      className="sg-input"
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Branch selection */}
            {card(
              <>
                {sectionLabel("Branch")}
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={16} color="var(--primary)" /> Select nearest branch
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBranch(b.id)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                        borderRadius: 12,
                        border: `2px solid ${selectedBranch === b.id ? "var(--primary)" : "var(--border)"}`,
                        background: selectedBranch === b.id ? "var(--primary-light)" : "#fff",
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        border: `2px solid ${selectedBranch === b.id ? "var(--primary)" : "var(--gray-300)"}`,
                        marginTop: 2, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {selectedBranch === b.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}
                      </div>
                      <div>
                        <p style={{ color: "var(--dark)", fontWeight: 700, fontSize: 14 }}>{b.name}</p>
                        {b.address && <p style={{ color: "var(--gray-400)", fontSize: 12, marginTop: 2 }}>{b.address}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Payment */}
            {card(
              <>
                {sectionLabel("Payment")}
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <CreditCard size={16} color="var(--primary)" /> Payment Method
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { id: "cash", icon: <Banknote size={18} color="#16A34A" />, label: "Cash on Delivery", desc: "Pay when your order arrives" },
                    { id: "card", icon: <CreditCard size={18} color="#2563EB" />, label: "Visa / Credit Card", desc: "Pay securely online" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id as any)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "14px 16px", borderRadius: 12,
                        border: `2px solid ${payMethod === m.id ? "var(--primary)" : "var(--border)"}`,
                        background: payMethod === m.id ? "var(--primary-light)" : "#fff",
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        border: `2px solid ${payMethod === m.id ? "var(--primary)" : "var(--gray-300)"}`,
                        flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {payMethod === m.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}
                      </div>
                      {m.icon}
                      <div>
                        <p style={{ color: "var(--dark)", fontWeight: 700, fontSize: 14 }}>{m.label}</p>
                        <p style={{ color: "var(--gray-400)", fontSize: 12 }}>{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Order summary */}
          <div style={{ position: "sticky", top: 80 }}>
            {card(
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--dark)", marginBottom: 16 }}>Order Summary</h3>
                <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
                  {items.map((i) => (
                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                      <span style={{ color: "var(--gray-500)", fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name} × {i.quantity}</span>
                      <span style={{ color: "var(--dark)", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>EGP {(i.price * i.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
                {[
                  { label: "Subtotal", val: `EGP ${subtotal.toFixed(0)}` },
                  { label: "Delivery", val: `EGP ${deliveryFee}` },
                  ...(coupon ? [{ label: `Discount (${coupon.code})`, val: `- EGP ${coupon.discount.toFixed(0)}`, red: true }] : []),
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "var(--gray-500)", fontSize: 13 }}>{row.label}</span>
                    <span style={{ color: (row as any).red ? "var(--success)" : "var(--dark)", fontSize: 13, fontWeight: 600 }}>{row.val}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: "var(--dark)" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>EGP {grandTotal.toFixed(0)}</span>
                </div>
                <button
                  onClick={place}
                  disabled={loading}
                  className="sg-btn sg-btn-primary"
                  style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "14px", borderRadius: 10, opacity: loading ? 0.8 : 1 }}
                >
                  {loading ? <span className="sg-spinner sg-spinner-white" style={{ width: 18, height: 18, borderWidth: 2.5 }} /> : null}
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
                {user && (
                  <p style={{ textAlign: "center", color: "var(--gray-400)", fontSize: 11, marginTop: 10 }}>
                    Ordering as {user.name}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
