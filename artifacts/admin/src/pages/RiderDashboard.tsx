import { useEffect, useRef, useState } from "react";
import { riderFetch, logoutRider, getRiderData } from "@/lib/api";
import type { FormEvent } from "react";
import {
  Bike, MapPin, Truck, CheckCircle, LogOut,
  Wifi, WifiOff, RefreshCw, Navigation,
} from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  placed: "Placed", accepted: "Accepted", preparing: "Preparing",
  packed: "Packed", waiting_rider: "Waiting Rider", rider_assigned: "Assigned to You",
  picked_up: "Picked Up", on_the_way: "On The Way",
  near_customer: "Almost There", delivered: "Delivered",
};
const STATUS_COLOR: Record<string, string> = {
  placed: "#3B82F6", accepted: "#22C55E", preparing: "#8B5CF6",
  packed: "#06B6D4", waiting_rider: "#F59E0B", rider_assigned: "#0FBCD4",
  picked_up: "#F97316", on_the_way: "#D4AF37", near_customer: "#F97316",
  delivered: "#22C55E",
};

const RIDER_NEXT_STATUS: Record<string, string> = {
  rider_assigned: "picked_up",
  picked_up: "on_the_way",
  on_the_way: "near_customer",
  near_customer: "delivered",
};
const RIDER_NEXT_LABEL: Record<string, string> = {
  rider_assigned: "Mark as Picked Up",
  picked_up: "Mark as On The Way",
  on_the_way: "Almost There",
  near_customer: "Mark as Delivered",
};

export default function RiderDashboard() {
  const riderData = getRiderData();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [lastReadCount, setLastReadCount] = useState(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const watchRef = useRef<number | null>(null);

  const load = (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    riderFetch("/api/rider/orders")
      .then(setOrders).catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 20_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS not available on this device");
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsActive(true);
        setGpsError("");
        riderFetch("/api/rider/location", {
          method: "PATCH",
          body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        }).catch(() => {});
      },
      (err) => {
        setGpsActive(false);
        setGpsError(err.message ?? "Location unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
    );
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  const loadMessages = async (orderId: number): Promise<number> => {
    try {
      const msgs = await riderFetch(`/api/rider/orders/${orderId}/messages`);
      setMessages(msgs);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      return (msgs as any[]).filter(m => m.senderType === "customer").length;
    } catch {}
    return 0;
  };

  const sendChatMessage = async (orderId: number, e?: FormEvent) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text || chatSending) return;
    setChatSending(true);
    setChatInput("");
    try {
      await riderFetch(`/api/rider/orders/${orderId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      await loadMessages(orderId);
    } catch {}
    setChatSending(false);
  };

  const updateStatus = async (orderId: number, status: string) => {
    setUpdating(orderId);
    try {
      await riderFetch(`/api/rider/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load(true);
    } catch {}
    setUpdating(null);
  };

  const handleLogout = async () => {
    await riderFetch("/api/rider/status", { method: "PATCH", body: JSON.stringify({ status: "offline" }) }).catch(() => {});
    logoutRider();
    window.location.reload();
  };

  const myOrders = orders.filter(o => o.riderId !== null);
  const name = riderData?.user?.name ?? "Rider";
  const activeOrder = myOrders.find(o => !["delivered", "completed", "cancelled"].includes(o.status));

  useEffect(() => {
    if (!chatOpen || !activeOrder) return;
    loadMessages(activeOrder.id).then((count) => {
      setLastReadCount(prev => Math.max(prev, count));
    });
    const t = setInterval(() => loadMessages(activeOrder.id), 4_000);
    return () => clearInterval(t);
  }, [chatOpen, activeOrder?.id]);

  const customerMsgCount = messages.filter(m => m.senderType === "customer").length;
  const unreadCount = chatOpen ? 0 : Math.max(0, customerMsgCount - lastReadCount);

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0A1628 0%, #1A5A30 80%, #22C55E 100%)",
        padding: "52px 20px 20px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(34,197,94,0.1)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Hi, {name.split(" ")[0]}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
              Active & Ready
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => load(true)}
              style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20, padding: "7px 14px", color: "#fff", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <RefreshCw size={12} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 20, padding: "7px 14px", color: "#f87171", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <LogOut size={12} />
              Off Duty
            </button>
          </div>
        </div>

        {/* GPS status bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: gpsActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${gpsActive ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
          borderRadius: 12, padding: "8px 12px",
        }}>
          {gpsActive ? <Wifi size={14} color="#22C55E" /> : <WifiOff size={14} color="#f87171" />}
          <span style={{ fontSize: 12, color: gpsActive ? "#22C55E" : "#f87171", fontWeight: 600 }}>
            {gpsActive ? "Location sharing active" : gpsError || "Enabling GPS..."}
          </span>
          <Navigation size={12} color="rgba(255,255,255,0.3)" style={{ marginLeft: "auto" }} />
        </div>
      </div>

      <div className="page" style={{ padding: "14px 12px 0" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" /></div>
        ) : (
          <>
            {/* No active order — waiting state */}
            {!activeOrder && (
              <div style={{
                textAlign: "center", padding: "48px 24px",
                background: "#162236", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20, marginBottom: 20,
              }}>
                <Bike size={48} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 14px" }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Standing by</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                  The admin will assign you to an order.<br />Keep your GPS active and stay ready.
                </div>
              </div>
            )}

            {/* Active order */}
            {activeOrder && (
              <div style={{ marginBottom: 20 }}>
                <SectionHeader label="Your Active Order" />
                <ActiveOrderCard
                  order={activeOrder}
                  updating={updating === activeOrder.id}
                  onStatus={(s) => updateStatus(activeOrder.id, s)}
                />
                <button
                  onClick={() => {
                    setChatOpen(o => !o);
                    if (!chatOpen) setLastReadCount(customerMsgCount);
                  }}
                  style={{
                    width: "100%", background: chatOpen ? "rgba(15,188,212,0.18)" : "rgba(15,188,212,0.08)",
                    border: `1px solid ${chatOpen ? "rgba(15,188,212,0.5)" : "rgba(15,188,212,0.2)"}`,
                    borderRadius: 14, padding: "10px 16px", color: "#0FBCD4",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8, marginTop: 8,
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {chatOpen ? "Close Chat" : "Chat with Customer"}
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: "auto", background: "#EF4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                      {unreadCount} new
                    </span>
                  )}
                </button>

                {chatOpen && (
                  <div style={{ marginTop: 8, background: "#162236", border: "1px solid rgba(15,188,212,0.2)", borderRadius: 18, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="14" height="14" fill="none" stroke="#0FBCD4" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0FBCD4" }}>Chat</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{activeOrder.orderNumber}</span>
                    </div>

                    <div style={{ height: 260, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {messages.length === 0 && (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                          No messages yet
                        </div>
                      )}
                      {messages.map(msg => {
                        const isMe = msg.senderType === "rider";
                        return (
                          <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                            {!isMe && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2, marginLeft: 8 }}>{msg.senderName}</span>}
                            <div style={{
                              maxWidth: "78%", padding: "8px 13px", borderRadius: 16,
                              background: isMe ? "linear-gradient(135deg,#0FBCD4,#0a8fa0)" : "rgba(255,255,255,0.08)",
                              color: "#fff", fontSize: 13, lineHeight: 1.4,
                            }}>
                              {msg.message}
                            </div>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2, marginLeft: 8, marginRight: 8 }}>
                              {new Date(msg.createdAt).toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        );
                      })}
                      <div ref={chatBottomRef} />
                    </div>

                    <form
                      onSubmit={(e) => sendChatMessage(activeOrder.id, e)}
                      style={{ display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        style={{
                          flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 22, padding: "9px 14px", color: "#fff", fontSize: 13, outline: "none",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={chatSending || !chatInput.trim()}
                        style={{
                          background: chatInput.trim() ? "linear-gradient(135deg,#0FBCD4,#0a8fa0)" : "rgba(255,255,255,0.08)",
                          border: "none", borderRadius: 22, padding: "9px 18px",
                          color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                          opacity: chatSending ? 0.6 : 1,
                        }}
                      >
                        Send
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Completed orders (recent) */}
            {myOrders.filter(o => ["delivered", "completed"].includes(o.status)).length > 0 && (
              <div style={{ marginTop: 20 }}>
                <SectionHeader label="Completed" />
                {myOrders.filter(o => ["delivered", "completed"].includes(o.status)).slice(0, 3).map(order => (
                  <CompletedOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            <div style={{ height: 40 }} />
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
      {label}
      {count !== undefined && (
        <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "1px 8px", fontSize: 10 }}>{count}</span>
      )}
    </div>
  );
}

function ActiveOrderCard({ order, updating, onStatus }: { order: any; updating: boolean; onStatus: (s: string) => void }) {
  const color = STATUS_COLOR[order.status] ?? "#3B82F6";
  const nextStatus = RIDER_NEXT_STATUS[order.status];
  const nextLabel = RIDER_NEXT_LABEL[order.status];

  return (
    <div style={{
      background: "#162236", border: `1px solid ${color}30`,
      borderRadius: 18, overflow: "hidden", marginBottom: 10,
    }}>
      <div style={{ height: 3, background: color }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{order.orderNumber}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {order.user?.name} · {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 20,
            background: color + "18", color, fontSize: 11, fontWeight: 700,
          }}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {order.deliveryAddress && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12, padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
            <MapPin size={14} color="#0FBCD4" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{order.deliveryAddress}</div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#D4AF37" }}>EGP {parseFloat(order.total).toFixed(0)}</span>
          {nextStatus && (
            <button
              onClick={() => onStatus(nextStatus)}
              disabled={updating}
              style={{
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                color: "#fff", fontWeight: 700, border: "none", borderRadius: 12,
                padding: "10px 18px", fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                opacity: updating ? 0.6 : 1,
              }}
            >
              {updating ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> : <Truck size={14} />}
              {nextLabel}
            </button>
          )}
          {order.status === "delivered" && (
            <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={16} /> Delivered!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CompletedOrderCard({ order }: { order: any }) {
  return (
    <div style={{
      background: "#162236", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14, padding: "10px 14px", marginBottom: 8,
      display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CheckCircle size={18} color="#22C55E" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{order.orderNumber}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{order.user?.name}</div>
        </div>
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#D4AF37" }}>EGP {parseFloat(order.total).toFixed(0)}</span>
    </div>
  );
}
