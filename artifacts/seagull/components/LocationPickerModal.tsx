import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  TextInput,
  FlatList,
  Keyboard,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onAssign: (address: string, lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

function generatePickerHtml(opts: {
  isDark: boolean;
  centerLat: number;
  centerLng: number;
  aqua: string;
  gold: string;
  ocean: string;
}): string {
  const { isDark, centerLat, centerLng, aqua, gold } = opts;

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const bgColor = isDark ? "#0D1B2A" : "#EAF4FF";

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body, html { width:100%; height:100%; background:${bgColor}; overflow:hidden; }
  #map { width:100%; height:100%; }
  .leaflet-control-attribution { display:none !important; }
  .leaflet-control-zoom a { background:${isDark ? "#1E3A5F" : "#fff"} !important; color:${isDark ? "#fff" : "#333"} !important; border-color:${isDark ? "#2A4F7A" : "#ccc"} !important; }
  .pin-icon {
    display:flex; align-items:center; justify-content:center;
    width:44px; height:44px; border-radius:22px;
    background:${aqua}; border:3px solid #fff;
    box-shadow:0 3px 12px rgba(0,0,0,0.4);
    font-size:22px; line-height:44px; text-align:center;
    animation: bounce 0.4s ease;
  }
  @keyframes bounce {
    0%   { transform: translateY(-8px); }
    60%  { transform: translateY(3px); }
    100% { transform: translateY(0); }
  }
  #crosshair {
    position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
    pointer-events:none; z-index:1000;
    width:60px; height:60px; opacity:0.35;
  }
  #crosshair::before, #crosshair::after {
    content:''; position:absolute; background:${gold};
  }
  #crosshair::before { top:50%; left:10px; right:10px; height:2px; margin-top:-1px; }
  #crosshair::after  { left:50%; top:10px; bottom:10px; width:2px; margin-left:-1px; }
</style>
</head>
<body>
<div id="crosshair"></div>
<div id="map"></div>
<script>
(function() {
  var lat = ${centerLat}, lng = ${centerLng};

  var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([lat, lng], 16);
  L.tileLayer('${tileUrl}', { maxZoom: 19, subdomains: 'abcd', detectRetina: true }).addTo(map);

  var pinIcon = L.divIcon({
    className: '',
    html: '<div class="pin-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });

  var marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);

  function sendCoords(lat, lng) {
    var msg = JSON.stringify({ type: 'coords', lat: lat, lng: lng });
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(msg);
    } else {
      try { window.parent.postMessage(msg, '*'); } catch(e) {}
    }
  }

  marker.on('dragend', function() {
    var pos = marker.getLatLng();
    sendCoords(pos.lat, pos.lng);
  });

  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    sendCoords(e.latlng.lat, e.latlng.lng);
  });

  function handleMessage(evt) {
    try {
      var data = JSON.parse(evt.data);
      if (data.type === 'setCenter') {
        marker.setLatLng([data.lat, data.lng]);
        map.setView([data.lat, data.lng], 16, { animate: true });
        sendCoords(data.lat, data.lng);
      }
    } catch(e) {}
  }

  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);

  sendCoords(lat, lng);
})();
</script>
</body>
</html>`;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    const a = data.address ?? {};

    const parts: string[] = [];
    if (a.road) parts.push(a.road);
    if (a.suburb || a.neighbourhood || a.quarter) parts.push(a.suburb || a.neighbourhood || a.quarter);
    if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);

    return parts.length > 0
      ? parts.join(", ")
      : data.display_name?.split(",").slice(0, 3).join(",").trim() ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

async function searchAddress(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=eg&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default function LocationPickerModal({
  visible,
  onClose,
  onAssign,
  initialLat,
  initialLng,
}: LocationPickerModalProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<any>(null);

  const [centerLat, setCenterLat] = useState<number>(30.0444);
  const [centerLng, setCenterLng] = useState<number>(31.2357);
  const [pinLat, setPinLat]       = useState<number>(30.0444);
  const [pinLng, setPinLng]       = useState<number>(31.2357);
  const [address, setAddress]     = useState<string>("Detecting location...");
  const [gpsLoading, setGpsLoading]   = useState(false);
  const [geocoding, setGeocoding]     = useState(false);
  const [mapReady, setMapReady]       = useState(false);

  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching]         = useState(false);
  const [showResults, setShowResults]     = useState(false);

  const geocodeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateAddress = useCallback(async (lat: number, lng: number) => {
    setGeocoding(true);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    setGeocoding(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    setMapReady(false);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);

    if (initialLat && initialLng) {
      setCenterLat(initialLat);
      setCenterLng(initialLng);
      setPinLat(initialLat);
      setPinLng(initialLng);
      updateAddress(initialLat, initialLng);
    } else {
      detectGPS();
    }
  }, [visible]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (e: any) => {
      if (!e.data || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        if (data.type === "coords") {
          const { lat, lng } = data;
          setPinLat(lat);
          setPinLng(lng);
          if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
          geocodeTimer.current = setTimeout(() => updateAddress(lat, lng), 600);
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [updateAddress]);

  const sendCenterToMap = (lat: number, lng: number) => {
    const msg = JSON.stringify({ type: "setCenter", lat, lng });
    if (Platform.OS === "web") {
      (iframeRef.current as any)?.contentWindow?.postMessage(msg, "*");
    } else if (webViewRef.current) {
      const js = `
        window.dispatchEvent(new MessageEvent('message', { data: '${msg}' }));
        document.dispatchEvent(new MessageEvent('message', { data: '${msg}' }));
        true;
      `;
      webViewRef.current.injectJavaScript(js);
    }
  };

  const detectGPS = async () => {
    if (Platform.OS === "web") {
      if (!("geolocation" in navigator)) {
        setAddress("Geolocation not supported");
        return;
      }
      setGpsLoading(true);
      setAddress("Detecting location...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCenterLat(latitude);
          setCenterLng(longitude);
          setPinLat(latitude);
          setPinLng(longitude);
          updateAddress(latitude, longitude);
          sendCenterToMap(latitude, longitude);
          setGpsLoading(false);
        },
        () => {
          setAddress("Could not detect location");
          setGpsLoading(false);
        },
        { timeout: 8000 }
      );
      return;
    }
    try {
      setGpsLoading(true);
      setAddress("Detecting location...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Location permission denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      setCenterLat(latitude);
      setCenterLng(longitude);
      setPinLat(latitude);
      setPinLng(longitude);
      updateAddress(latitude, longitude);
      sendCenterToMap(latitude, longitude);
    } catch {
      setAddress("Could not detect location");
    } finally {
      setGpsLoading(false);
    }
  };

  const onMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "coords") {
        const { lat, lng } = data;
        setPinLat(lat);
        setPinLng(lng);

        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        geocodeTimer.current = setTimeout(() => {
          updateAddress(lat, lng);
        }, 600);
      }
    } catch {}
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowResults(false);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchAddress(text);
      setSearchResults(results);
      setShowResults(results.length > 0);
      setSearching(false);
    }, 500);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const label = result.display_name.split(",").slice(0, 3).join(",").trim();
    setCenterLat(lat);
    setCenterLng(lng);
    setPinLat(lat);
    setPinLng(lng);
    setAddress(label);
    sendCenterToMap(lat, lng);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const pickerHtml = generatePickerHtml({
    isDark,
    centerLat,
    centerLng,
    aqua:  colors.aqua,
    gold:  colors.gold,
    ocean: colors.oceanBlue,
  });

  const handleAssign = () => {
    onAssign(address, pinLat, pinLng);
    onClose();
  };

  const mapSection = Platform.OS === "web" ? (
    <View style={styles.mapContainer}>
      {/* @ts-ignore */}
      <iframe
        ref={iframeRef}
        srcDoc={pickerHtml}
        style={{ width: "100%", height: "100%", border: "none", flex: 1 }}
        title="Location Picker"
        onLoad={() => setMapReady(true)}
      />
    </View>
  ) : (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        source={{ html: pickerHtml, baseUrl: "https://localhost/" }}
        style={styles.webview}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowUniversalAccessFromFileURLs
        allowFileAccessFromFileURLs
        onMessage={onMessage}
        onLoad={() => setMapReady(true)}
        onError={() => {}}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0D1B2A" : "#F0F7FF" }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? "#0D1B2A" : "#F0F7FF", borderBottomColor: isDark ? "#1E3A5F" : "#D0E7F9" }]}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Set Delivery Location</Text>
          <Pressable onPress={detectGPS} style={styles.gpsBtn} hitSlop={8} disabled={gpsLoading}>
            {gpsLoading ? (
              <ActivityIndicator size="small" color={colors.oceanBlue} />
            ) : (
              <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.oceanBlue} />
            )}
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchWrapper, { backgroundColor: isDark ? "#0D1B2A" : "#F0F7FF", borderBottomColor: isDark ? "#1E3A5F" : "#D0E7F9" }]}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? "#112233" : "#fff", borderColor: isDark ? "#1E3A5F" : "#D0E7F9" }]}>
            <Ionicons name="search" size={17} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search for a place or address..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searching && <ActivityIndicator size="small" color={colors.oceanBlue} />}
            {searchQuery.length > 0 && !searching && (
              <Pressable onPress={() => { setSearchQuery(""); setSearchResults([]); setShowResults(false); }} hitSlop={8}>
                <Ionicons name="close-circle" size={17} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Search Results Dropdown */}
          {showResults && (
            <View style={[styles.resultsDropdown, { backgroundColor: isDark ? "#112233" : "#fff", borderColor: isDark ? "#1E3A5F" : "#D0E7F9" }]}>
              <FlatList
                data={searchResults}
                keyExtractor={(_, i) => String(i)}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={searchResults.length > 4}
                style={{ maxHeight: 200 }}
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() => handleSelectResult(item)}
                    style={[
                      styles.resultItem,
                      index < searchResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? "#1E3A5F" : "#E8F2FA" },
                    ]}
                  >
                    <Ionicons name="location-outline" size={16} color={colors.aqua} style={{ marginTop: 2 }} />
                    <Text style={[styles.resultText, { color: colors.text }]} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>

        {mapSection}

        <View style={[styles.bottomSheet, { backgroundColor: isDark ? "#0D1B2A" : "#fff", borderTopColor: isDark ? "#1E3A5F" : "#D0E7F9" }]}>
          <View style={styles.handleBar} />

          <Text style={[styles.bottomLabel, { color: colors.textSecondary }]}>Delivery address</Text>

          <View style={[styles.addressRow, { backgroundColor: isDark ? "#112233" : "#F0F7FF", borderColor: isDark ? "#1E3A5F" : "#D0E7F9" }]}>
            <Ionicons name="location" size={18} color={colors.aqua} />
            {geocoding ? (
              <ActivityIndicator size="small" color={colors.oceanBlue} style={{ flex: 1, marginLeft: 8 }} />
            ) : (
              <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={2}>{address}</Text>
            )}
          </View>

          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Search above, or tap / drag the pin on the map
          </Text>

          <Pressable
            style={[styles.assignBtn, { backgroundColor: colors.aqua }]}
            onPress={handleAssign}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.assignBtnText}>Assign This Location</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  header:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  backBtn:          { padding: 4 },
  headerTitle:      { flex: 1, fontSize: 17, fontWeight: "700", textAlign: "center" },
  gpsBtn:           { padding: 4, width: 32, alignItems: "center" },

  searchWrapper:    { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, zIndex: 100 },
  searchBar:        { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  searchInput:      { flex: 1, fontSize: 14, paddingVertical: 0 },
  resultsDropdown:  { position: "absolute", left: 14, right: 14, top: 54, borderRadius: 12, borderWidth: 1, overflow: "hidden", zIndex: 200, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  resultItem:       { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
  resultText:       { flex: 1, fontSize: 13, lineHeight: 18 },

  mapContainer:     { flex: 1 },
  webview:          { flex: 1, backgroundColor: "transparent" },
  bottomSheet:      { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, borderTopWidth: 1, gap: 10 },
  handleBar:        { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginBottom: 4 },
  bottomLabel:      { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  addressRow:       { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  addressText:      { flex: 1, fontSize: 14, fontWeight: "500", lineHeight: 20 },
  hint:             { fontSize: 12, textAlign: "center" },
  assignBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, marginTop: 4 },
  assignBtnText:    { color: "#fff", fontSize: 16, fontWeight: "700" },
});
