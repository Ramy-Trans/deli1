import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number;
}

interface TrackingMapProps {
  driverLocation?: DriverLocation | null;
  status: string;
  eta?: number;
  restaurantName?: string;
  branchLat?: number | null;
  branchLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  riderInitialLat?: number | null;
  riderInitialLng?: number | null;
}

function generateLeafletHtml(opts: {
  isDark: boolean;
  branchLat: number;
  branchLng: number;
  deliveryLat: number | null;
  deliveryLng: number | null;
  driverLat: number | null;
  driverLng: number | null;
  isActive: boolean;
  gold: string;
  ocean: string;
  aqua: string;
}): string {
  const {
    isDark,
    branchLat,
    branchLng,
    deliveryLat,
    deliveryLng,
    driverLat,
    driverLng,
    isActive,
    gold,
    ocean,
    aqua,
  } = opts;

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const bgColor = isDark ? "#0D1B2A" : "#EAF4FF";

  const hasCust = deliveryLat !== null && deliveryLng !== null;
  const hasDriver = driverLat !== null && driverLng !== null;

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
  body, html { width:100%; height:100%; background:${bgColor}; }
  #map { width:100%; height:100%; }
  .leaflet-control-attribution { display:none !important; }
  .leaflet-control-zoom a { background:${isDark ? "#1E3A5F" : "#fff"} !important; color:${isDark ? "#fff" : "#333"} !important; border-color:${isDark ? "#2A4F7A" : "#ccc"} !important; }
  @keyframes pulseRing {
    0%   { transform:scale(0.85); opacity:1; }
    80%  { transform:scale(2.4); opacity:0; }
    100% { transform:scale(2.4); opacity:0; }
  }
  .pulse-ring {
    position:absolute; inset:0; border-radius:50%;
    border:3px solid ${gold};
    animation: pulseRing 1.6s ease-out infinite;
    pointer-events:none;
  }
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
  var GOLD = '${gold}';
  var OCEAN = '${ocean}';
  var AQUA = '${aqua}';

  var map = L.map('map', {
    zoomControl: true,
    attributionControl: false,
    dragging: true,
    tap: true,
  });

  L.tileLayer('${tileUrl}', {
    maxZoom: 19,
    subdomains: 'abcd',
    detectRetina: true,
  }).addTo(map);

  // Restaurant marker
  var restIcon = L.divIcon({
    className: '',
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">'
      + '<filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.45)"/></filter>'
      + '<g filter="url(#sh)">'
      + '<path d="M22 2C11 2 3 10 3 20c0 13 19 30 19 30S41 33 41 20C41 10 33 2 22 2Z" fill="' + OCEAN + '"/>'
      + '</g>'
      + '<circle cx="22" cy="20" r="10" fill="white" opacity="0.18"/>'
      + '<path d="M18 24v-5h-1.5v-3.5c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2V19H26v5h-8zm2-5h4v-3.5h-4V19z" fill="white" transform="translate(0,0)"/>'
      + '</svg>',
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -52],
  });
  L.marker([BRANCH_LAT, BRANCH_LNG], { icon: restIcon })
    .addTo(map)
    .bindPopup('<b>Sea Gull Restaurant</b>');

  // Customer marker
  var custMarker = null;
  if (CUST_LAT !== null) {
    var custIcon = L.divIcon({
      className: '',
      html: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">'
        + '<filter id="sh2"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.45)"/></filter>'
        + '<g filter="url(#sh2)">'
        + '<path d="M22 2C11 2 3 10 3 20c0 13 19 30 19 30S41 33 41 20C41 10 33 2 22 2Z" fill="' + AQUA + '"/>'
        + '</g>'
        + '<circle cx="22" cy="20" r="10" fill="white" opacity="0.18"/>'
        + '<path d="M22 11l-8 7h2v7h4v-4h4v4h4v-7h2l-8-7z" fill="white"/>'
        + '</svg>',
      iconSize: [44, 52],
      iconAnchor: [22, 52],
    });
    custMarker = L.marker([CUST_LAT, CUST_LNG], { icon: custIcon }).addTo(map);
  }

  // Rider marker
  var riderMarker = null;
  if (IS_ACTIVE && DRIVER_LAT !== null) {
    var riderHtml = '<div class="rider-wrap">'
      + '<div class="pulse-ring"></div>'
      + '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" style="position:relative">'
      + '<filter id="sh3"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/></filter>'
      + '<circle cx="25" cy="25" r="21" fill="' + GOLD + '" stroke="white" stroke-width="3" filter="url(#sh3)"/>'
      + '<path d="M16 30c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm12 0c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm-9-3l2-5h6l2 2h3l1 3H19zm5-5l-1-3h3l1 3h-3z" fill="white"/>'
      + '</svg></div>';
    var riderIcon = L.divIcon({ className:'', html: riderHtml, iconSize:[50,50], iconAnchor:[25,25] });
    riderMarker = L.marker([DRIVER_LAT, DRIVER_LNG], { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
  }

  // Route via OSRM
  var routeLayer = null;
  function drawRoute(fromLat, fromLng) {
    if (CUST_LAT === null) return;
    var url = 'https://router.project-osrm.org/route/v1/driving/'
      + fromLng + ',' + fromLat + ';'
      + CUST_LNG + ',' + CUST_LAT
      + '?overview=full&geometries=geojson';

    fetch(url).then(function(r){ return r.json(); }).then(function(data) {
      if (!data.routes || data.routes.length === 0) return;
      if (routeLayer) map.removeLayer(routeLayer);
      routeLayer = L.geoJSON(data.routes[0].geometry, {
        style: { color: GOLD, weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }
      }).addTo(map);
      var duration = Math.round(data.routes[0].duration / 60);
      var distance = (data.routes[0].distance / 1000).toFixed(1);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'routeInfo',
          duration: duration + ' min',
          distance: distance + ' km',
          durationSeconds: data.routes[0].duration,
        }));
      }
    }).catch(function() {});
  }

  // Fit bounds & draw initial route
  var routeFrom = (IS_ACTIVE && DRIVER_LAT !== null)
    ? [DRIVER_LAT, DRIVER_LNG]
    : [BRANCH_LAT, BRANCH_LNG];

  if (CUST_LAT !== null) {
    var bounds = L.latLngBounds([
      [BRANCH_LAT, BRANCH_LNG],
      [CUST_LAT, CUST_LNG],
    ]);
    if (IS_ACTIVE && DRIVER_LAT !== null) bounds.extend([DRIVER_LAT, DRIVER_LNG]);
    map.fitBounds(bounds, { padding: [40, 40] });
    drawRoute(routeFrom[0], routeFrom[1]);
  } else {
    map.setView([BRANCH_LAT, BRANCH_LNG], 15);
  }

  // Listen for live rider updates from React Native
  function handleMessage(evt) {
    try {
      var data = JSON.parse(evt.data);
      if (data.type === 'updateDriver') {
        var pos = [data.lat, data.lng];
        if (!riderMarker) {
          var rHtml = '<div class="rider-wrap">'
            + '<div class="pulse-ring"></div>'
            + '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" style="position:relative">'
            + '<circle cx="25" cy="25" r="21" fill="' + GOLD + '" stroke="white" stroke-width="3"/>'
            + '<path d="M16 30c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm12 0c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm-9-3l2-5h6l2 2h3l1 3H19zm5-5l-1-3h3l1 3h-3z" fill="white"/>'
            + '</svg></div>';
          var rIcon = L.divIcon({ className:'', html: rHtml, iconSize:[50,50], iconAnchor:[25,25] });
          riderMarker = L.marker(pos, { icon: rIcon, zIndexOffset:1000 }).addTo(map);
        } else {
          riderMarker.setLatLng(pos);
        }
        drawRoute(data.lat, data.lng);
      }
    } catch(e) {}
  }
  document.addEventListener('message', handleMessage);
  window.addEventListener('message', handleMessage);
})();
</script>
</body>
</html>`;
}

export default function TrackingMap({
  driverLocation,
  status,
  restaurantName = "Sea Gull Restaurant",
  branchLat,
  branchLng,
  deliveryLat,
  deliveryLng,
  riderInitialLat,
  riderInitialLng,
}: TrackingMapProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const webViewRef = useRef<WebView>(null);

  const [etaFromRoute, setEtaFromRoute]   = useState<string | null>(null);
  const [distFromRoute, setDistFromRoute] = useState<string | null>(null);
  const [mapLoading, setMapLoading]       = useState(true);

  const hasBranchCoords = branchLat != null && branchLng != null;
  const isActive    = ["on_the_way", "near_customer"].includes(status);
  const isDelivered = status === "delivered";

  const driverLat = driverLocation?.latitude ?? riderInitialLat ?? null;
  const driverLng = driverLocation?.longitude ?? riderInitialLng ?? null;

  // Push live rider position into the WebView
  useEffect(() => {
    if (!driverLocation || !webViewRef.current) return;
    const js = `
      (function() {
        var e = JSON.stringify({ type:'updateDriver', lat:${driverLocation.latitude}, lng:${driverLocation.longitude} });
        document.dispatchEvent(new MessageEvent('message', { data: e }));
        window.dispatchEvent(new MessageEvent('message', { data: e }));
      })(); true;
    `;
    webViewRef.current.injectJavaScript(js);
  }, [driverLocation]);

  const htmlSource = useMemo(() => {
    if (!hasBranchCoords) return null;
    setMapLoading(true);
    return generateLeafletHtml({
      isDark,
      branchLat: branchLat!,
      branchLng: branchLng!,
      deliveryLat: deliveryLat ?? null,
      deliveryLng: deliveryLng ?? null,
      driverLat: (isActive || isDelivered) ? driverLat : null,
      driverLng: (isActive || isDelivered) ? driverLng : null,
      isActive,
      gold:  colors.gold,
      ocean: colors.oceanBlue,
      aqua:  colors.aqua,
    });
  }, [
    isDark, branchLat, branchLng, deliveryLat, deliveryLng,
    colors.gold, colors.oceanBlue, colors.aqua, isActive, isDelivered,
  ]);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "routeInfo") {
        setDistFromRoute(data.distance);
        setEtaFromRoute(data.duration);
        setMapLoading(false);
      }
    } catch {}
  };

  const etaDisplay  = isDelivered ? "Delivered!" : etaFromRoute  ?? "—";
  const distDisplay = isDelivered ? "0.0 km"     : distFromRoute ?? "—";

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#0D1B2A" : "#EAF4FF" }]}>
        <View style={[styles.mapArea, styles.placeholder]}>
          <MaterialCommunityIcons name="map-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>Live tracking map</Text>
        </View>
        <View style={[styles.infoRow, { borderTopColor: isDark ? "#1E3A5F" : "#D0E7F9" }]}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={colors.gold} />
            <Text style={[styles.infoValue, { color: colors.text }]}>{etaDisplay}</Text>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ETA</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0D1B2A" : "#EAF4FF" }]}>
      <View style={styles.mapArea}>
        {hasBranchCoords && htmlSource ? (
          <>
            <WebView
              ref={webViewRef}
              source={{ html: htmlSource, baseUrl: "https://localhost/" }}
              style={styles.webview}
              scrollEnabled={false}
              bounces={false}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              mixedContentMode="always"
              allowUniversalAccessFromFileURLs
              allowFileAccessFromFileURLs
              allowsInlineMediaPlayback
              onMessage={onMessage}
              onLoad={() => setMapLoading(false)}
              onError={() => setMapLoading(false)}
            />
            {mapLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={colors.gold} size="small" />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.placeholder, { backgroundColor: isDark ? "#0D1B2A" : "#EAF4FF" }]}>
            <MaterialCommunityIcons name="map-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              {status === "preparing" || status === "accepted"
                ? "Map available when rider is on the way"
                : "Loading map..."}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.infoRow, { borderTopColor: isDark ? "#1E3A5F" : "#D0E7F9" }]}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.gold} />
          <Text style={[styles.infoValue, { color: colors.text }]}>{etaDisplay}</Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ETA</Text>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: isDark ? "#1E3A5F" : "#D0E7F9" }]} />
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="map-marker-distance" size={18} color={colors.gold} />
          <Text style={[styles.infoValue, { color: colors.text }]}>{distDisplay}</Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Distance</Text>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: isDark ? "#1E3A5F" : "#D0E7F9" }]} />
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="speedometer" size={18} color={colors.gold} />
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {isActive ? "Live" : isDelivered ? "Done" : "—"}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Tracking</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { borderRadius: 20, overflow: "hidden", marginHorizontal: 16, marginBottom: 16 },
  mapArea:       { height: 280, position: "relative" },
  webview:       { flex: 1, backgroundColor: "transparent" },
  loadingOverlay:{ ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.15)" },
  placeholder:   { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  placeholderText:{ fontSize: 13, fontWeight: "500", textAlign: "center", paddingHorizontal: 24 },
  infoRow:       { flexDirection: "row", paddingVertical: 14, borderTopWidth: 1 },
  infoItem:      { flex: 1, alignItems: "center", gap: 2 },
  infoValue:     { fontSize: 15, fontWeight: "700" },
  infoLabel:     { fontSize: 10, fontWeight: "500" },
  infoDivider:   { width: 1, marginVertical: 4 },
});
