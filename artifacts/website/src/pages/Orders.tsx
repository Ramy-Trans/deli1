import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Package, Clock, CheckCircle, XCircle, Bike, ChefHat, ChevronRight, UtensilsCrossed } from "lucide-react";

interface Order {
  id: number;
  status: string;
  total: string;
  deliveryAddress: string;
  createdAt: string;
  paymentMethod: string;
  items?: any[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending:          { label: "Pending",      color: "#D97706", icon: Clock,        bg: "#FFFBEB" },
  confirmed:        { label: "Confirmed",    color: "#2563EB", icon: CheckCircle,  bg: "#EFF6FF" },
  preparing:        { label: "Preparing",    color: "#7C3AED", icon: ChefHat,      bg: "#F5F3FF" },
  out_for_delivery: { label: "On the Way",   color: "#0891B2", icon: Bike,         bg: "#ECFEFF" },
  delivered:        { label: "Delivered",    color: "#16A34A", icon: CheckCircle,  bg: "#F0FDF4" },
  cancelled:        { label: "Cancelled",    color: "#DC2626", icon: XCircle,      bg: "#FEF2F2" },
};

export default function OrdersPage({ onAuthRequired }: { onAuthRequired: () => void }) {
  const { token, isAuthed } = useAuth();
  const [, setLoc] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthed) { onAuthRequired(); setLoading(false); return; }
    fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : d?.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, isAuthed]);

  if (loading) {
    return (
      <div style={{ background: "var(--bg-alt)", minHeight: "100vh", padding: "40px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--dark)", marginBottom: 28, letterSpacing: "-0.5px" }}>My Orders</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="sg-skeleton" style={{ height: 110, borderRadius: 16 }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div style={{ background: "var(--bg-alt)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Package size={28} color="var(--primary)" />
          </div>
          <h2 style={{ color: "var(--dark)", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Sign in to view orders</h2>
          <p style={{ color: "var(--gray-500)", fontSize: 14, marginBottom: 24 }}>Track your order history and current deliveries</p>
          <button onClick={onAuthRequired} className="sg-btn sg-btn-primary" style={{ padding: "12px 28px" }}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-alt)", minHeight: "100vh", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--dark)", marginBottom: 6, letterSpacing: "-0.5px" }}>My Orders</h1>
        <p style={{ color: "var(--gray-400)", fontSize: 14, marginBottom: 28 }}>{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20, border: "1px solid var(--border)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <UtensilsCrossed size={28} color="var(--gray-300)" />
            </div>
            <h2 style={{ color: "var(--dark)", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No orders yet</h2>
            <p style={{ color: "var(--gray-400)", fontSize: 14, marginBottom: 24 }}>Start your first seafood adventure!</p>
            <button onClick={() => setLoc("/menu")} className="sg-btn sg-btn-primary" style={{ padding: "12px 28px" }}>Browse Menu</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <div
                  key={order.id}
                  style={{
                    background: "#fff", borderRadius: 16,
                    border: "1px solid var(--border)",
                    padding: 20, cursor: "pointer",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  }}
                  onClick={() => setLoc(`/orders/${order.id}`)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={{ color: "var(--dark)", fontWeight: 700, fontSize: 15 }}>Order #{order.id}</p>
                      <p style={{ color: "var(--gray-400)", fontSize: 12, marginTop: 3 }}>
                        {new Date(order.createdAt).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: cfg.bg, borderRadius: 8, padding: "5px 10px" }}>
                      <Icon size={13} color={cfg.color} />
                      <span style={{ color: cfg.color, fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ color: "var(--gray-500)", fontSize: 12, marginBottom: 2 }}>{order.deliveryAddress}</p>
                      <p style={{ color: "var(--gray-400)", fontSize: 11, textTransform: "capitalize" }}>{order.paymentMethod?.replace(/_/g, " ")}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: 16 }}>EGP {Number(order.total).toFixed(0)}</span>
                      <ChevronRight size={16} color="var(--gray-300)" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
