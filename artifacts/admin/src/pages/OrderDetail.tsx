import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { apiFetch } from "@/lib/api";
import {
  MapPin, Bike, ArrowRight, ChevronLeft, User, ExternalLink,
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
  preparing: "#8B5CF6", packed: "#06B6D4",
  on_the_way: "#D4AF37", near_customer: "#F97316",
  delivered: "#22C55E", completed: "#22C55E", cancelled: "#EF4444",
};
const NEXT_STATUS: Record<string, string[]> = {
  placed: ["accepted", "cancelled"],
  payment_pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["packed"],
  packed: ["on_the_way"],
  waiting_rider: ["on_the_way"],
  rider_assigned: ["picked_up"],
  picked_up: ["on_the_way"],
  on_the_way: ["near_customer", "delivered"],
  near_customer: ["delivered"],
};

export default function OrderDetailPage() {
  const { id: orderId } = useParams<{ id: string }>();
  const [, setLoc] = useLocation();
  const [order, setOrder] = useState<any | null>(null);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRiders, setShowRiders] = useState(false);

  const load = async () => {
    const [allOrders, allRiders] = await Promise.all([
      apiFetch("/api/admin/orders").catch(() => []),
      apiFetch("/api/admin/riders").catch(() => []),
    ]);
    setOrder(allOrders.find((o: any) => String(o.id) === String(orderId)) ?? null);
    setRiders(allRiders);
    setLoading(false);
  };
  useEffect(() => { load(); }, [orderId]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await apiFetch(`/api/admin/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    await load();
    setUpdating(false);
  };
  const assignRider = async (riderId: number | null) => {
    setUpdating(true);
    await apiFetch(`/api/admin/orders/${orderId}/assign-rider`, { method: "PATCH", body: JSON.stringify({ riderId }) });
    await load();
    setUpdating(false);
    setShowRiders(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );
  if (!order) return (
    <div style={{ minHeight: "100vh", background: "#0A1628", padding: "56px 20px" }}>
      <button className="back-btn" onClick={() => setLoc("/orders")}>
        <ChevronLeft size={22} />
      </button>
    </div>
  );

  const statusColor = STATUS_COLOR[order.status] ?? "#3B82F6";
  const nextStatuses = NEXT_STATUS[order.status] ?? [];
  const availableRiders = riders.filter(r => r.status === "available");
  const assignedRider = order.rider;
  const riderLat = assignedRider?.currentLatitude;
  const riderLng = assignedRider?.currentLongitude;

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", flexDirection: "column" }}>
      <div style={{
        background: "linear-gradient(135deg, #0A1628 0%, #1A6FA8 100%)",
        padding: "52px 20px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="back-btn"
            onClick={() => setLoc("/orders")}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronLeft size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{order.orderNumber}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              {new Date(order.createdAt).toLocaleString("en-EG")}
            </div>
          </div>
          <span style={{
            padding: "5px 12px", borderRadius: 20,
            background: statusColor + "22", color: statusColor,
            fontSize: 12, fontWeight: 700,
          }}>{STATUS_LABEL[order.status] ?? order.status}</span>
        </div>
      </div>

      <div className="page" style={{ padding: "14px 14px 0" }}>
        {/* Customer */}
        <Section title="Customer">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16, flexShrink: 0,
              background: "linear-gradient(135deg, #1A6FA820, #0FBCD420)",
              border: "1px solid rgba(15,188,212,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800, color: "#fff",
            }}>
              {order.user?.name
                ? order.user.name.charAt(0).toUpperCase()
                : <User size={22} color="#0FBCD4" />}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{order.user?.name ?? "Unknown"}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{order.user?.phone ?? ""}</div>
            </div>
          </div>
          {order.deliveryAddress && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
              <MapPin size={16} color="rgba(255,255,255,0.4)" style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5, marginBottom: 3 }}>DELIVERY ADDRESS</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{order.deliveryAddress}</div>
              </div>
            </div>
          )}
        </Section>

        {/* Items */}
        <Section title="Order Items">
          {order.items?.map((item: any) => (
            <div key={item.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{item.productName}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>× {item.quantity}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#D4AF37" }}>
                EGP {parseFloat(item.totalPrice).toFixed(0)}
              </div>
            </div>
          ))}
          <div style={{ paddingTop: 10 }}>
            <TotalRow label="Subtotal" value={parseFloat(order.subtotal)} />
            {parseFloat(order.deliveryFee ?? 0) > 0 && <TotalRow label="Delivery Fee" value={parseFloat(order.deliveryFee)} />}
            {parseFloat(order.discount ?? 0) > 0 && <TotalRow label="Discount" value={-parseFloat(order.discount)} accent />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#D4AF37" }}>EGP {parseFloat(order.total).toFixed(0)}</span>
            </div>
          </div>
        </Section>

        {/* Rider */}
        <Section title="Delivery Rider">
          {order.rider ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                  background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bike size={24} color="#22C55E" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{order.rider.user?.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {order.rider.user?.phone} · {order.rider.vehicleType}
                  </div>
                </div>
                <button
                  onClick={() => setShowRiders(true)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 12px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}
                >Change</button>
              </div>
              {riderLat && riderLng && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5, marginBottom: 6 }}>RIDER GPS LOCATION</div>
                  <a
                    href={`https://maps.google.com/?q=${riderLat},${riderLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "rgba(15,188,212,0.1)", border: "1px solid rgba(15,188,212,0.25)",
                      borderRadius: 10, padding: "7px 12px",
                      color: "#0FBCD4", fontSize: 12, fontWeight: 600, textDecoration: "none",
                    }}
                  >
                    <MapPin size={13} />
                    {parseFloat(riderLat).toFixed(5)}, {parseFloat(riderLng).toFixed(5)}
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowRiders(true)}
              style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: "rgba(212,175,55,0.08)", border: "1.5px dashed rgba(212,175,55,0.3)",
                color: "#D4AF37", fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Bike size={18} />
              Assign a Rider
            </button>
          )}
        </Section>

        {/* Status actions */}
        {nextStatuses.length > 0 && (
          <Section title="Update Status">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {nextStatuses.map(s => {
                const c = STATUS_COLOR[s] ?? "#3B82F6";
                return (
                  <button key={s} onClick={() => updateStatus(s)} disabled={updating} style={{
                    background: c + "14", border: `1.5px solid ${c}30`,
                    borderRadius: 14, padding: "14px 20px",
                    color: c, fontWeight: 700, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    opacity: updating ? 0.5 : 1,
                  }}>
                    <ArrowRight size={16} />
                    Move to: {STATUS_LABEL[s] ?? s}
                  </button>
                );
              })}
            </div>
          </Section>
        )}
      </div>

      {/* Rider picker sheet */}
      {showRiders && (
        <div className="modal-overlay" onClick={() => setShowRiders(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Assign Rider</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              {availableRiders.length} rider{availableRiders.length !== 1 ? "s" : ""} available
            </div>
            {availableRiders.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
                No available riders. Set a rider's status to "Available" in the Riders tab.
              </div>
            )}
            {availableRiders.map(rider => (
              <div
                key={rider.id}
                className="press-item card-sm"
                onClick={() => assignRider(rider.id)}
                style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12, borderColor: order.riderId === rider.id ? "#22C55E" : "var(--border)" }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: "#22C55E18",
                  border: "1px solid #22C55E30", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#fff",
                }}>
                  {rider.user?.name?.charAt(0)
                    ? rider.user.name.charAt(0).toUpperCase()
                    : <Bike size={18} color="#22C55E" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{rider.user?.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{rider.vehicleType} · {rider.user?.phone}</div>
                </div>
                {order.riderId === rider.id && <CheckSelected />}
              </div>
            ))}
            <button className="btn-outline" style={{ marginTop: 12 }} onClick={() => setShowRiders(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckSelected() {
  return (
    <div style={{ width: 24, height: 24, borderRadius: 8, background: "#22C55E22", border: "1px solid #22C55E40", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
      <div style={{ background: "#162236", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "14px 16px" }}>
        {children}
      </div>
    </div>
  );
}

function TotalRow({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span style={{ fontSize: 13, color: accent ? "#22C55E" : "rgba(255,255,255,0.7)" }}>
        {accent && value < 0 ? "-" : ""}EGP {Math.abs(value).toFixed(0)}
      </span>
    </div>
  );
}
