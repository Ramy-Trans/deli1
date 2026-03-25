import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, Package, Clock, CheckCircle, XCircle, Bike, ChefHat } from "lucide-react";

interface OrderDetail {
  id: number;
  status: string;
  total: string;
  subtotal: string;
  deliveryFee: string;
  deliveryAddress: string;
  deliveryLatitude?: string;
  deliveryLongitude?: string;
  createdAt: string;
  paymentMethod: string;
  branch?: { name: string; latitude?: string; longitude?: string };
  rider?: { name: string; phone: string };
  items: Array<{ id: number; quantity: number; totalPrice: string; product?: { name: string }; productName?: string; }>;
  statusHistory?: Array<{ status: string; createdAt: string; }>;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number;
}

const STATUS_STEPS = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const STATUS_CONFIG: Record<string, { color: string; icon: any; bg: string }> = {
  pending:          { color: "#D97706", icon: Clock,        bg: "#FFFBEB" },
  confirmed:        { color: "#2563EB", icon: CheckCircle,  bg: "#EFF6FF" },
  preparing:        { color: "#7C3AED", icon: ChefHat,      bg: "#F5F3FF" },
  out_for_delivery: { color: "#0891B2", icon: Bike,         bg: "#ECFEFF" },
  delivered:        { color: "#16A34A", icon: CheckCircle,  bg: "#F0FDF4" },
  cancelled:        { color: "#DC2626", icon: XCircle,      bg: "#FEF2F2" },
};

function generateLeafletHtml(opts: {
  branchLat: number;
  branchLng: number;
  deliveryLat: number | null;
  deliveryLng: number | null;
  driverLat: number | null;
  driverLng: number | null;
  isActive: boolean;
}): string {
  const { branchLat, branchLng, deliveryLat, deliveryLng, driverLat, driverLng, isActive } = opts;
  const tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const OCEAN = "#0B7EA4";
  const AQUA  = "#06B6D4";
  const GOLD  = "#D4AF37";
  const hasCust   = deliveryLat !== null && deliveryLng !== null;
  const hasDriver = isActive && driverLat !== null && driverLng !== null;
  const custLatStr   = hasCust   ? String(deliveryLat)  : "null";
  const custLngStr   = hasCust   ? String(deliveryLng)  : "null";
  const driverLatStr = hasDriver ? String(driverLat)    : "null";
  const driverLngStr = hasDriver ? String(driverLng)    : "null";

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body, html { width:100%; height:100%; background:#EAF4FF; }
  #map { width:100%; height:100%; }
  .leaflet-control-attribution { display:none !important; }
  @keyframes pulseRing {
    0%   { transform:scale(0.85); opacity:1; }
    80%  { transform:scale(2.4); opacity:0; }
    100% { transform:scale(2.4); opacity:0; }
  }
  .pulse-ring { position:absolute; inset:0; border-radius:50%; border:3px solid ${GOLD}; animation: pulseRing 1.6s ease-out infinite; pointer-events:none; }
  .rider-wrap { position:relative; width:50px; height:50px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
(function() {
  var BRANCH_LAT = ${branchLat}, BRANCH_LNG = ${branchLng};
  var CUST_LAT = ${custLatStr}, CUST_LNG = ${custLngStr};
  var DRIVER_LAT = ${driverLatStr}, DRIVER_LNG = ${driverLngStr};
  var IS_ACTIVE = ${isActive};
  var OCEAN = '${OCEAN}'; var AQUA = '${AQUA}'; var GOLD = '${GOLD}';

  var map = L.map('map', { zoomControl: true, attributionControl: false, dragging: true, tap: true });
  L.tileLayer('${tileUrl}', { maxZoom: 19, subdomains: 'abcd', detectRetina: true }).addTo(map);

  var restIcon = L.divIcon({ className:'', iconSize:[44,52], iconAnchor:[22,52],
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">'
      + '<filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/></filter>'
      + '<g filter="url(#sh)"><path d="M22 2C11 2 3 10 3 20c0 13 19 30 19 30S41 33 41 20C41 10 33 2 22 2Z" fill="' + OCEAN + '"/></g>'
      + '<circle cx="22" cy="20" r="10" fill="white" opacity="0.18"/>'
      + '<path d="M18 24v-5h-1.5v-3.5c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2V19H26v5h-8zm2-5h4v-3.5h-4V19z" fill="white"/>'
      + '</svg>' });
  L.marker([BRANCH_LAT, BRANCH_LNG], { icon: restIcon }).addTo(map).bindPopup('<b>Sea Gull Restaurant</b>');

  if (CUST_LAT !== null) {
    var custIcon = L.divIcon({ className:'', iconSize:[44,52], iconAnchor:[22,52],
      html: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">'
        + '<filter id="sh2"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/></filter>'
        + '<g filter="url(#sh2)"><path d="M22 2C11 2 3 10 3 20c0 13 19 30 19 30S41 33 41 20C41 10 33 2 22 2Z" fill="' + AQUA + '"/></g>'
        + '<circle cx="22" cy="20" r="10" fill="white" opacity="0.18"/>'
        + '<path d="M22 11l-8 7h2v7h4v-4h4v4h4v-7h2l-8-7z" fill="white"/>'
        + '</svg>' });
    L.marker([CUST_LAT, CUST_LNG], { icon: custIcon }).addTo(map);
  }

  var riderMarker = null;
  if (IS_ACTIVE && DRIVER_LAT !== null) {
    var rHtml = '<div class="rider-wrap"><div class="pulse-ring"></div>'
      + '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" style="position:relative">'
      + '<filter id="sh3"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/></filter>'
      + '<circle cx="25" cy="25" r="21" fill="' + GOLD + '" stroke="white" stroke-width="3" filter="url(#sh3)"/>'
      + '<path d="M16 30c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm12 0c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm-9-3l2-5h6l2 2h3l1 3H19zm5-5l-1-3h3l1 3h-3z" fill="white"/>'
      + '</svg></div>';
    var rIcon = L.divIcon({ className:'', html: rHtml, iconSize:[50,50], iconAnchor:[25,25] });
    riderMarker = L.marker([DRIVER_LAT, DRIVER_LNG], { icon: rIcon, zIndexOffset: 1000 }).addTo(map);
  }

  var routeLayer = null;
  function drawRoute(fromLat, fromLng) {
    if (CUST_LAT === null) return;
    var url = 'https://router.project-osrm.org/route/v1/driving/'
      + fromLng + ',' + fromLat + ';' + CUST_LNG + ',' + CUST_LAT
      + '?overview=full&geometries=geojson';
    fetch(url).then(function(r){ return r.json(); }).then(function(data) {
      if (!data.routes || !data.routes.length) return;
      if (routeLayer) map.removeLayer(routeLayer);
      routeLayer = L.geoJSON(data.routes[0].geometry, {
        style: { color: GOLD, weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }
      }).addTo(map);
    }).catch(function() {});
  }

  var routeFrom = (IS_ACTIVE && DRIVER_LAT !== null) ? [DRIVER_LAT, DRIVER_LNG] : [BRANCH_LAT, BRANCH_LNG];
  if (CUST_LAT !== null) {
    var bounds = L.latLngBounds([[BRANCH_LAT, BRANCH_LNG], [CUST_LAT, CUST_LNG]]);
    if (IS_ACTIVE && DRIVER_LAT !== null) bounds.extend([DRIVER_LAT, DRIVER_LNG]);
    map.fitBounds(bounds, { padding: [40, 40] });
    drawRoute(routeFrom[0], routeFrom[1]);
  } else {
    map.setView([BRANCH_LAT, BRANCH_LNG], 15);
  }

  window.addEventListener('message', function(evt) {
    try {
      var data = JSON.parse(evt.data);
      if (data.type === 'updateDriver') {
        var pos = [data.lat, data.lng];
        if (!riderMarker) {
          var rHtml2 = '<div class="rider-wrap"><div class="pulse-ring"></div>'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" style="position:relative">'
            + '<circle cx="25" cy="25" r="21" fill="' + GOLD + '" stroke="white" stroke-width="3"/>'
            + '<path d="M16 30c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm12 0c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm-9-3l2-5h6l2 2h3l1 3H19zm5-5l-1-3h3l1 3h-3z" fill="white"/>'
            + '</svg></div>';
          riderMarker = L.marker(pos, { icon: L.divIcon({ className:'', html: rHtml2, iconSize:[50,50], iconAnchor:[25,25] }), zIndexOffset:1000 }).addTo(map);
        } else {
          riderMarker.setLatLng(pos);
        }
        drawRoute(data.lat, data.lng);
      }
    } catch(e) {}
  });
})();
</script>
</body>
</html>`;
}

export default function OrderDetailPage() {
  const [, params] = useRoute("/orders/:id");
  const [, setLoc] = useLocation();
  const { token } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedRef = useRef(false);

  const fetchOrder = (quiet = false) =>
    fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/orders/${params?.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setCurrentStatus(data.status);
        if (!quiet) setLoading(false);
      })
      .catch(() => { if (!quiet) setLoading(false); });

  useEffect(() => {
    if (!params?.id) return;
    fetchOrder();
  }, [params?.id, token]);

  useEffect(() => {
    if (!params?.id) return;
    const connect = () => {
      joinedRef.current = false;
      const apiBase = (import.meta.env.VITE_API_URL as string) ?? "";
      const wsUrl = apiBase
        ? `${apiBase.replace(/^http/, "ws")}/api/socket.io/?EIO=4&transport=websocket`
        : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/socket.io/?EIO=4&transport=websocket`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (evt) => {
        const text = evt.data as string;
        if (text.startsWith("0")) { ws.send("40"); return; }
        if (text.startsWith("40") && !joinedRef.current) {
          joinedRef.current = true;
          ws.send(`42["join-order",${Number(params.id)}]`);
          return;
        }
        if (text === "2") { ws.send("3"); return; }
        if (text.startsWith("42")) {
          try {
            const [evtName, evtData] = JSON.parse(text.slice(2));
            if (evtName === "order-status") { setCurrentStatus(evtData.status); fetchOrder(true); }
            if (evtName === "driver-location") setDriverLocation(evtData);
            if (evtName === "eta-update") setEta(evtData.eta);
            if (evtName === "driver-assigned") fetchOrder(true);
          } catch {}
        }
      };
      ws.onclose = () => { reconnectRef.current = setTimeout(connect, 5000); };
      ws.onerror = () => ws.close();
    };
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [params?.id]);

  useEffect(() => {
    if (!driverLocation || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ type: "updateDriver", lat: driverLocation.latitude, lng: driverLocation.longitude }),
      "*"
    );
  }, [driverLocation]);

  if (loading) {
    return (
      <div style={{ background: "var(--bg-alt)", minHeight: "100vh", padding: "40px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="sg-skeleton" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ background: "var(--bg-alt)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ textAlign: "center" }}>
          <Package size={48} color="var(--gray-300)" style={{ marginBottom: 16 }} />
          <p style={{ color: "var(--dark)", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Order not found</p>
          <button onClick={() => setLoc("/orders")} className="sg-btn sg-btn-outline" style={{ marginTop: 20, padding: "10px 20px" }}>Back to Orders</button>
        </div>
      </div>
    );
  }

  const status = currentStatus || order.status;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const currentStep = STATUS_STEPS.indexOf(status);
  const isCancelled = status === "cancelled";
  const isActive = ["out_for_delivery", "confirmed", "preparing"].includes(status);
  const branchLat = order.branch?.latitude ? parseFloat(order.branch.latitude) : null;
  const branchLng = order.branch?.longitude ? parseFloat(order.branch.longitude) : null;
  const deliveryLat = order.deliveryLatitude ? parseFloat(order.deliveryLatitude) : null;
  const deliveryLng = order.deliveryLongitude ? parseFloat(order.deliveryLongitude) : null;
  const showMap = branchLat !== null && branchLng !== null && status !== "cancelled";

  const mapHtml = showMap ? generateLeafletHtml({
    branchLat: branchLat!,
    branchLng: branchLng!,
    deliveryLat,
    deliveryLng,
    driverLat: isActive && driverLocation ? driverLocation.latitude : null,
    driverLng: isActive && driverLocation ? driverLocation.longitude : null,
    isActive,
  }) : null;

  const card = (children: React.ReactNode) => (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: 22, boxShadow: "var(--shadow-sm)", marginBottom: 14 }}>
      {children}
    </div>
  );

  return (
    <div style={{ background: "var(--bg-alt)", minHeight: "100vh", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <button
          onClick={() => setLoc("/orders")}
          className="sg-btn sg-btn-ghost"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "8px 12px", borderRadius: 8, marginBottom: 24 }}
        >
          <ChevronLeft size={16} /> My Orders
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--dark)", letterSpacing: "-0.5px" }}>Order #{order.id}</h1>
            <p style={{ color: "var(--gray-400)", fontSize: 13, marginTop: 4 }}>
              {new Date(order.createdAt).toLocaleDateString("en-EG", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: cfg.bg, borderRadius: 10, padding: "8px 14px" }}>
            <Icon size={14} color={cfg.color} />
            <span style={{ color: cfg.color, fontWeight: 700, fontSize: 13 }}>{STATUS_LABELS[status] ?? status}</span>
          </div>
        </div>

        {/* Live Tracking Map */}
        {mapHtml && card(
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--dark)" }}>Live Tracking</h3>
              {eta !== null && (
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", borderRadius: 8, padding: "4px 10px" }}>
                  ETA ~{eta} min
                </span>
              )}
            </div>
            <div style={{ borderRadius: 12, overflow: "hidden", height: 260, border: "1px solid var(--border)" }}>
              <iframe
                ref={iframeRef}
                srcDoc={mapHtml}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Order tracking map"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            {order.rider && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: "10px 14px", background: "var(--bg-alt)", borderRadius: 10 }}>
                <Bike size={16} color="var(--primary)" />
                <span style={{ fontSize: 13, color: "var(--dark)", fontWeight: 600 }}>{order.rider.name}</span>
                {order.rider.phone && (
                  <a href={`tel:${order.rider.phone}`} style={{ marginLeft: "auto", fontSize: 12, color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
                    Call Rider
                  </a>
                )}
              </div>
            )}
          </>
        )}

        {/* Progress tracker */}
        {!isCancelled && card(
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--dark)", marginBottom: 20 }}>Order Progress</h3>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 13, top: 14, bottom: 14, width: 2, background: "var(--gray-100)", zIndex: 0 }} />
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const s = STATUS_CONFIG[step];
                const StepIcon = done ? (s?.icon ?? Package) : Package;
                return (
                  <div key={step} style={{ display: "flex", gap: 16, marginBottom: i < STATUS_STEPS.length - 1 ? 18 : 0, position: "relative", zIndex: 1 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: done ? s?.bg : "var(--gray-50)",
                      border: `2px solid ${done ? s?.color : "var(--gray-200)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <StepIcon size={12} color={done ? s?.color : "var(--gray-300)"} />
                    </div>
                    <div style={{ paddingTop: 5 }}>
                      <p style={{ color: done ? "var(--dark)" : "var(--gray-300)", fontSize: 14, fontWeight: done ? 700 : 400 }}>
                        {STATUS_LABELS[step]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Items */}
        {card(
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--dark)", marginBottom: 16 }}>Items</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {(order.items ?? []).map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{
                      background: "var(--primary-light)", color: "var(--primary)",
                      borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>{item.quantity}×</span>
                    <span style={{ color: "var(--dark)", fontSize: 13 }}>{item.product?.name ?? item.productName ?? `Item #${item.id}`}</span>
                  </div>
                  <span style={{ color: "var(--gray-500)", fontSize: 13, fontWeight: 600 }}>EGP {Number(item.totalPrice ?? 0).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />
            {[
              { label: "Subtotal", val: `EGP ${Number(order.subtotal ?? 0).toFixed(0)}` },
              { label: "Delivery", val: `EGP ${Number(order.deliveryFee ?? 25).toFixed(0)}` },
              { label: "Total", val: `EGP ${Number(order.total).toFixed(0)}`, bold: true },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--gray-500)", fontSize: 13 }}>{row.label}</span>
                <span style={{ color: row.bold ? "var(--primary)" : "var(--dark)", fontSize: row.bold ? 15 : 13, fontWeight: row.bold ? 800 : 500 }}>{row.val}</span>
              </div>
            ))}
          </>
        )}

        {/* Delivery info */}
        {card(
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--dark)", marginBottom: 14 }}>Delivery Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Address", val: order.deliveryAddress },
                order.branch ? { label: "Branch", val: order.branch.name } : null,
                { label: "Payment", val: order.paymentMethod?.replace(/_/g, " ") },
                order.rider ? { label: "Rider", val: order.rider.name } : null,
              ].filter(Boolean).map((row: any) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ color: "var(--gray-400)", fontSize: 13, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ color: "var(--dark)", fontSize: 13, fontWeight: 600, textAlign: "right", textTransform: row.label === "Payment" ? "capitalize" : "none" }}>{row.val}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
