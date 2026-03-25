import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiFetch } from "@/lib/api";
import BottomTabs from "@/components/BottomTabs";
import {
  Inbox, CreditCard, CheckCircle, ChefHat, Package, Truck, MapPin,
  PartyPopper, ClipboardList, RefreshCw, Bike, ChevronRight, Trash2, XCircle,
} from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  placed: "Placed", payment_pending: "Awaiting Payment", accepted: "Accepted",
  preparing: "Preparing", packed: "Packed", waiting_rider: "Waiting Rider",
  rider_assigned: "Rider Assigned", picked_up: "Picked Up",
  on_the_way: "On The Way", near_customer: "Almost There",
  delivered: "Delivered", completed: "Completed", cancelled: "Cancelled",
};
const STATUS_COLOR: Record<string, string> = {
  placed: "#3B82F6", payment_pending: "#F59E0B", accepted: "#22C55E",
  preparing: "#8B5CF6", packed: "#06B6D4", waiting_rider: "#F59E0B",
  rider_assigned: "#0FBCD4", picked_up: "#F97316",
  on_the_way: "#D4AF37", near_customer: "#F97316",
  delivered: "#22C55E", completed: "#22C55E", cancelled: "#EF4444",
};

function StatusIcon({ status, size = 20, color }: { status: string; size?: number; color?: string }) {
  const props = { size, color: color ?? STATUS_COLOR[status] ?? "#6B7280" };
  switch (status) {
    case "placed": return <Inbox {...props} />;
    case "payment_pending": return <CreditCard {...props} />;
    case "accepted": return <CheckCircle {...props} />;
    case "preparing": return <ChefHat {...props} />;
    case "packed": return <Package {...props} />;
    case "waiting_rider": return <Bike {...props} />;
    case "rider_assigned": return <Bike {...props} />;
    case "picked_up": return <Truck {...props} />;
    case "on_the_way": return <Truck {...props} />;
    case "near_customer": return <MapPin {...props} />;
    case "delivered": return <PartyPopper {...props} />;
    case "completed": return <CheckCircle {...props} />;
    case "cancelled": return <ClipboardList {...props} />;
    default: return <ClipboardList {...props} />;
  }
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "placed", label: "Placed" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "on_the_way", label: "On The Way" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [, setLoc] = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [actioning, setActioning] = useState(false);

  const load = (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    apiFetch("/api/admin/orders")
      .then(setOrders).catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  const cancelAll = async () => {
    if (!window.confirm("Cancel all active orders? This cannot be undone.")) return;
    setActioning(true);
    try {
      const res = await apiFetch("/api/admin/orders/cancel-all", { method: "PATCH" });
      alert(`Cancelled ${res.cancelled ?? 0} order(s).`);
      load(true);
    } catch { alert("Failed to cancel orders."); }
    finally { setActioning(false); }
  };

  const deleteAll = async () => {
    if (!window.confirm("Permanently DELETE all orders? This cannot be undone!")) return;
    setActioning(true);
    try {
      const res = await apiFetch("/api/admin/orders", { method: "DELETE" });
      alert(`Deleted ${res.deleted ?? 0} order(s).`);
      setOrders([]);
    } catch { alert("Failed to delete orders."); }
    finally { setActioning(false); }
  };

  useEffect(() => { load(); }, []);

  const shown = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", flexDirection: "column" }}>
      <div style={{
        background: "linear-gradient(135deg, #0A1628 0%, #1A6FA8 100%)",
        padding: "52px 20px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>Orders</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              {shown.length} order{shown.length !== 1 ? "s" : ""}{filter !== "all" ? ` (${STATUS_LABEL[filter] ?? filter})` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={cancelAll}
              disabled={actioning}
              title="Cancel all active orders"
              style={{
                background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)",
                borderRadius: 20, padding: "7px 14px", color: "#F59E0B", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5, opacity: actioning ? 0.5 : 1,
              }}
            >
              <XCircle size={13} />
              Cancel All
            </button>
            <button
              onClick={deleteAll}
              disabled={actioning}
              title="Delete all orders permanently"
              style={{
                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 20, padding: "7px 14px", color: "#EF4444", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5, opacity: actioning ? 0.5 : 1,
              }}
            >
              <Trash2 size={13} />
              Delete All
            </button>
            <button
              onClick={() => load(true)}
              style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20, padding: "7px 16px", color: "#fff", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
              Refresh
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {FILTERS.map(f => {
            const active = filter === f.key;
            const color = f.key === "all" ? "#D4AF37" : (STATUS_COLOR[f.key] ?? "#D4AF37");
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  flexShrink: 0, borderRadius: 20, padding: "6px 14px",
                  border: `1.5px solid ${active ? color : "rgba(255,255,255,0.12)"}`,
                  background: active ? color + "22" : "rgba(255,255,255,0.04)",
                  color: active ? color : "rgba(255,255,255,0.5)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}
              >{f.label}</button>
            );
          })}
        </div>
      </div>

      <div className="page" style={{ padding: "12px 12px 0" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" /></div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)" }}>
            <ClipboardList size={52} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>No orders found</div>
          </div>
        ) : (
          shown.map(order => (
            <OrderCard key={order.id} order={order} onTap={() => setLoc(`/orders/${order.id}`)} />
          ))
        )}
      </div>
      <BottomTabs />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function OrderCard({ order, onTap }: { order: any; onTap: () => void }) {
  const color = STATUS_COLOR[order.status] ?? "#3B82F6";
  const time = new Date(order.createdAt).toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="press-item"
      onClick={onTap}
      style={{ marginBottom: 10, background: "#162236", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden" }}
    >
      <div style={{ height: 3, background: color, opacity: 0.8 }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: color + "18", border: `1px solid ${color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <StatusIcon status={order.status} size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{order.orderNumber}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {order.user?.name ?? "Unknown"} · {time}
              </div>
            </div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "4px 10px", borderRadius: 20,
            background: color + "18", color, fontSize: 11, fontWeight: 700,
          }}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
            </span>
            {order.rider && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 3 }}>
                · <Bike size={11} style={{ display: "inline" }} /> {order.rider.user?.name}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#D4AF37" }}>
              EGP {parseFloat(order.total).toFixed(0)}
            </span>
            <ChevronRight size={18} color="rgba(255,255,255,0.25)" />
          </div>
        </div>
      </div>
    </div>
  );
}
