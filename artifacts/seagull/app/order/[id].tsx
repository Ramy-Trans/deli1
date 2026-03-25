import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ConfirmModal from "@/components/ConfirmModal";
import TrackingMap from "@/components/TrackingMap";
import { LinearGradient } from "expo-linear-gradient";

const API_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const STEP_STATUSES = ["accepted", "preparing", "ready", "on_the_way", "delivered"];

function StatusStep({ statusKey, current, isLast, colors, cfg }: {
  statusKey: string; current: string; isLast: boolean;
  colors: (typeof Colors)["light"];
  cfg: { label: string; icon: string; color: string; desc: string };
}) {
  const STATUS_TO_STEP: Record<string, string> = {
    placed: "accepted",
    payment_pending: "accepted",
    near_customer: "on_the_way",
    picked_up: "on_the_way",
    rider_assigned: "ready",
    waiting_rider: "ready",
    packed: "ready",
    completed: "delivered",
  };
  const mappedCurrent = STATUS_TO_STEP[current] ?? current;
  const currentIdx = STEP_STATUSES.indexOf(mappedCurrent);
  const stepIdx = STEP_STATUSES.indexOf(statusKey);
  const isDone = stepIdx <= currentIdx;
  const isCurrent = STEP_STATUSES[currentIdx] === statusKey;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCurrent]);

  return (
    <View style={sStyles.row}>
      <View style={sStyles.iconCol}>
        <Animated.View style={[sStyles.circle, {
          backgroundColor: isDone ? cfg.color : colors.surface,
          borderColor: isDone ? cfg.color : colors.border,
          transform: isCurrent ? [{ scale: pulseAnim }] : [],
        }]}>
          <MaterialCommunityIcons name={cfg.icon as any} size={18} color={isDone ? "#fff" : colors.textSecondary} />
        </Animated.View>
        {!isLast && <View style={[sStyles.line, { backgroundColor: isDone ? cfg.color + "80" : colors.border }]} />}
      </View>
      <View style={sStyles.textCol}>
        <Text style={[sStyles.label, { color: isDone ? colors.text : colors.textSecondary, fontWeight: isDone ? "700" : "400" }]}>
          {cfg.label}
        </Text>
        {isCurrent && <Text style={[sStyles.desc, { color: colors.textSecondary }]}>{cfg.desc}</Text>}
      </View>
    </View>
  );
}

const sStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  iconCol: { alignItems: "center", width: 40 },
  circle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  line: { width: 2, flex: 1, minHeight: 20, marginVertical: 4 },
  textCol: { flex: 1, paddingTop: 8, paddingBottom: 12 },
  label: { fontSize: 15 },
  desc: { fontSize: 12, marginTop: 2 },
});

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const { token: authToken } = useAuth();
  const { t } = useLanguage();

  const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; desc: string }> = {
    payment_pending: { label: t.statusPaymentPendingLabel, icon: "credit-card-clock", color: "#F59E0B", desc: t.statusPaymentPendingDesc },
    accepted:        { label: t.statusOrderAcceptedLabel,  icon: "check-circle",       color: "#3B82F6", desc: t.statusOrderAcceptedDesc },
    preparing:       { label: t.statusBeingPreparedLabel,  icon: "chef-hat",           color: "#8B5CF6", desc: t.statusBeingPreparedDesc },
    ready:           { label: t.statusReadyForPickupLabel,  icon: "bag-checked",        color: "#06B6D4", desc: t.statusReadyForPickupDesc },
    on_the_way:      { label: t.statusOnTheWayLabel,       icon: "bike",               color: "#D4AF37", desc: t.statusOnTheWayDesc },
    near_customer:   { label: t.statusAlmostThereLabel,    icon: "map-marker-radius",  color: "#F97316", desc: t.statusAlmostThereDesc },
    delivered:       { label: t.statusDeliveredLabel,      icon: "check-decagram",     color: "#22C55E", desc: t.statusDeliveredDesc },
    cancelled:       { label: t.statusCancelledLabel,      icon: "close-circle",       color: "#EF4444", desc: t.statusCancelledDesc },
  };

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [eta, setEta] = useState<number | undefined>(undefined);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatListRef = useRef<FlatList<any>>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrder = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setCurrentStatus(data.status);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setTimeout(() => chatListRef.current?.scrollToEnd({ animated: false }), 50);
      }
    } catch {}
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatSending) return;
    setChatSending(true);
    setChatInput("");
    const optimistic = {
      id: Date.now(),
      senderType: "customer",
      senderName: "You",
      message: text,
      createdAt: new Date().toISOString(),
      _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      await fetch(`${API_URL}/api/orders/${id}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      await loadMessages();
    } catch {}
    setChatSending(false);
  };

  useEffect(() => {
    if (!chatVisible) return;
    loadMessages();
    const t = setInterval(loadMessages, 4000);
    return () => clearInterval(t);
  }, [chatVisible, id]);

  useEffect(() => { fetchOrder(); }, [id]);

  useEffect(() => {
    if (!id) return;
    const wsBase = API_URL.replace(/^http/, "ws");
    let joined = false;
    const connect = () => {
      try {
        joined = false;
        const ws = new WebSocket(`${wsBase}/api/socket.io/?EIO=4&transport=websocket`);
        wsRef.current = ws;
        ws.onopen = () => {};
        ws.onmessage = (event) => {
          const text = event.data as string;
          // EIO4 open handshake
          if (text.startsWith("0")) { ws.send("40"); return; }
          // socket.io namespace connected → now join the order room
          if (text.startsWith("40") && !joined) {
            joined = true;
            ws.send(`42["join-order",${Number(id)}]`);
            return;
          }
          // heartbeat ping
          if (text === "2") { ws.send("3"); return; }
          // events
          if (text.startsWith("42")) {
            try {
              const [evtName, evtData] = JSON.parse(text.slice(2));
              if (evtName === "order-status") { setCurrentStatus(evtData.status); fetchOrder(true); }
              if (evtName === "driver-location") setDriverLocation(evtData);
              if (evtName === "eta-update") setEta(evtData.eta);
              if (evtName === "driver-assigned") fetchOrder(true);
              if (evtName === "chat-message") setMessages(prev => prev.some(m => m.id === evtData.id) ? prev : [...prev.filter(m => !m._pending), evtData]);
            } catch {}
          }
        };
        ws.onclose = () => { reconnectRef.current = setTimeout(connect, 4000); };
        ws.onerror = () => ws.close();
      } catch {}
    };
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [id]);

  const handleSimulate = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/simulate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) { const data = await res.json(); setCurrentStatus(data.status); fetchOrder(true); }
    } catch {}
  };

  const doCancel = async () => {
    setShowCancelConfirm(false);
    try {
      await fetch(`${API_URL}/api/orders/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by customer" }),
      });
      fetchOrder(true);
    } catch {}
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.oceanBlue} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: colors.text }}>{t.orderNotFound}</Text>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.accepted;
  const isActive = ["accepted", "preparing", "ready", "rider_assigned", "picked_up", "on_the_way", "near_customer"].includes(currentStatus);
  const canCancel = ["payment_pending", "accepted"].includes(currentStatus);
  const isDelivery = order.type === "delivery";
  const etaMinutes = eta ?? (order.estimatedDeliveryTime
    ? Math.max(0, Math.round((new Date(order.estimatedDeliveryTime).getTime() - Date.now()) / 60000))
    : undefined);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ConfirmModal
        visible={showCancelConfirm}
        title={t.cancelOrder}
        message={t.cancelOrderConfirm}
        confirmLabel={t.yesCancelOrder}
        cancelLabel={t.cancel}
        onConfirm={doCancel}
        onCancel={() => setShowCancelConfirm(false)}
        destructive
        colors={colors}
      />

      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.headerSub}>
              {new Date(order.createdAt).toLocaleDateString("en-EG", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </Text>
          </View>
          {isActive && (
            <TouchableOpacity onPress={handleSimulate} style={styles.simulateBtn}>
              <MaterialCommunityIcons name="fast-forward" size={18} color={colors.gold} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
          <Text style={styles.statusLabel}>{cfg.label}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrder(); }} tintColor={colors.oceanBlue} />
        }
      >
        {isDelivery && currentStatus !== "cancelled" && (
          <View style={{ marginTop: 16 }}>
            <TrackingMap
              driverLocation={isActive ? driverLocation : null}
              status={currentStatus}
              eta={etaMinutes}
              branchLat={order.branch?.latitude ? parseFloat(order.branch.latitude) : null}
              branchLng={order.branch?.longitude ? parseFloat(order.branch.longitude) : null}
              deliveryLat={order.deliveryLatitude ? parseFloat(order.deliveryLatitude) : null}
              deliveryLng={order.deliveryLongitude ? parseFloat(order.deliveryLongitude) : null}
              riderInitialLat={order.rider?.currentLatitude ? parseFloat(order.rider.currentLatitude) : null}
              riderInitialLng={order.rider?.currentLongitude ? parseFloat(order.rider.currentLongitude) : null}
            />
          </View>
        )}

        {order.rider && isActive && (
          <View style={[styles.card, { backgroundColor: colors.surface, marginTop: isDelivery ? 0 : 16 }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t.yourRider}</Text>
            <View style={styles.riderRow}>
              <View style={[styles.riderAvatar, { backgroundColor: colors.oceanBlue + "20" }]}>
                <MaterialCommunityIcons name="account" size={28} color={colors.oceanBlue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.riderName, { color: colors.text }]}>{order.rider.name}</Text>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={14} color={colors.gold} />
                  <Text style={[styles.riderRating, { color: colors.textSecondary }]}>
                    {order.rider.rating ?? "4.8"} · {order.rider.vehicleType ?? "Motorcycle"}
                  </Text>
                </View>
                {order.rider.vehiclePlate && (
                  <View style={styles.plateRow}>
                    <MaterialCommunityIcons name="card-account-details-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.plateText, { color: colors.textSecondary }]}>{order.rider.vehiclePlate}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: colors.oceanBlue }]}
                onPress={() => order.rider.phone && Linking.openURL(`tel:${order.rider.phone}`)}
              >
                <MaterialCommunityIcons name="phone" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: colors.navyDeep, marginLeft: 8 }]}
                onPress={() => { loadMessages(); setChatVisible(true); }}
              >
                <MaterialCommunityIcons name="chat" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.surface, marginTop: isDelivery && isActive ? 0 : 16 }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.orderProgress}</Text>
          <View style={{ marginTop: 8 }}>
            {STEP_STATUSES.map((s, i) => (
              <StatusStep
                key={s}
                statusKey={s}
                current={currentStatus}
                isLast={i === STEP_STATUSES.length - 1}
                colors={colors}
                cfg={STATUS_CONFIG[s] ?? STATUS_CONFIG.accepted}
              />
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.itemsOrdered}</Text>
          {(order.items ?? []).map((item: any, i: number) => (
            <View key={i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }]}>
              <View style={[styles.qtyBadge, { backgroundColor: colors.oceanBlue }]}>
                <Text style={styles.qtyText}>{item.quantity}x</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.productName}</Text>
                {item.variantName && <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{item.variantName}</Text>}
                {item.addOns?.length > 0 && (
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    + {Array.isArray(item.addOns) ? item.addOns.map((a: any) => a.name || a).join(", ") : ""}
                  </Text>
                )}
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>EGP {parseFloat(item.totalPrice).toFixed(0)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.orderSummary}</Text>
          {[
            { key: t.subtotal, val: `EGP ${parseFloat(order.subtotal).toFixed(0)}`, isDiscount: false },
            parseFloat(order.deliveryFee ?? "0") > 0 && { key: t.deliveryFee, val: `EGP ${parseFloat(order.deliveryFee).toFixed(0)}`, isDiscount: false },
            parseFloat(order.tip ?? "0") > 0 && { key: t.tip, val: `EGP ${parseFloat(order.tip).toFixed(0)}`, isDiscount: false },
            parseFloat(order.discount ?? "0") > 0 && { key: t.discount, val: `-EGP ${parseFloat(order.discount).toFixed(0)}`, isDiscount: true },
          ].filter(Boolean).map((row: any) => (
            <View key={row.key} style={styles.summaryRow}>
              <Text style={[styles.summaryKey, { color: row.isDiscount ? "#22C55E" : colors.textSecondary }]}>{row.key}</Text>
              <Text style={[styles.summaryVal, { color: row.isDiscount ? "#22C55E" : colors.text }]}>{row.val}</Text>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalKey, { color: colors.text }]}>{t.total}</Text>
            <Text style={[styles.totalVal, { color: colors.gold }]}>EGP {parseFloat(order.total).toFixed(0)}</Text>
          </View>
        </View>

        {order.deliveryAddress && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t.deliveryAddress}</Text>
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color={colors.oceanBlue} />
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order.deliveryAddress}</Text>
            </View>
            {order.deliveryNotes && (
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                {t.noteLabel} {order.deliveryNotes}
              </Text>
            )}
          </View>
        )}

        {order.branch && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t.branch}</Text>
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="storefront" size={20} color={colors.oceanBlue} />
              <View>
                <Text style={[styles.branchName, { color: colors.text }]}>{order.branch.name}</Text>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order.branch.address}</Text>
              </View>
            </View>
          </View>
        )}

        {canCancel && (
          <TouchableOpacity style={[styles.cancelBtn, { borderColor: "#EF4444" }]} onPress={() => setShowCancelConfirm(true)}>
            <MaterialCommunityIcons name="close-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.cancelText}>{t.cancelOrder}</Text>
          </TouchableOpacity>
        )}

        {currentStatus === "delivered" && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.oceanBlue }]} onPress={() => router.push("/(tabs)/menu")}>
              <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
              <Text style={styles.actionText}>{t.reorder}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.gold }]} onPress={() => {}}>
              <MaterialCommunityIcons name="star-outline" size={18} color={colors.navyDeep} />
              <Text style={[styles.actionText, { color: colors.navyDeep }]}>{t.rate}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={chatVisible} animationType="slide" onRequestClose={() => setChatVisible(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.background }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={[chatStyles.header, { backgroundColor: colors.navyDeep }]}>
            <TouchableOpacity onPress={() => setChatVisible(false)} style={chatStyles.closeBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={chatStyles.headerTitle}>{order?.rider?.name ?? "Rider"}</Text>
              <Text style={chatStyles.headerSub}>Delivery chat</Text>
            </View>
            <View style={[chatStyles.onlineDot, { backgroundColor: "#22C55E" }]} />
          </View>

          <FlatList
            ref={chatListRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={chatStyles.emptyChat}>
                <MaterialCommunityIcons name="chat-outline" size={48} color={colors.textSecondary} />
                <Text style={[chatStyles.emptyChatText, { color: colors.textSecondary }]}>
                  No messages yet. Say hi!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMe = item.senderType === "customer";
              return (
                <View style={[chatStyles.bubble, isMe ? chatStyles.bubbleRight : chatStyles.bubbleLeft]}>
                  {!isMe && (
                    <Text style={[chatStyles.bubbleSender, { color: colors.textSecondary }]}>{item.senderName}</Text>
                  )}
                  <View style={[
                    chatStyles.bubbleBody,
                    { backgroundColor: isMe ? colors.oceanBlue : colors.surface },
                  ]}>
                    <Text style={[chatStyles.bubbleText, { color: isMe ? "#fff" : colors.text }]}>
                      {item.message}
                    </Text>
                  </View>
                  <Text style={[chatStyles.bubbleTime, { color: colors.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              );
            }}
          />

          <View style={[chatStyles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TextInput
              style={[chatStyles.input, { color: colors.text, backgroundColor: colors.background }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={chatSending || !chatInput.trim()}
              style={[chatStyles.sendBtn, { backgroundColor: colors.oceanBlue, opacity: chatInput.trim() ? 1 : 0.4 }]}
            >
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const chatStyles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, gap: 12 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyChatText: { fontSize: 14, fontWeight: "500" },
  bubble: { marginBottom: 12, maxWidth: "80%" },
  bubbleRight: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubbleLeft: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubbleSender: { fontSize: 11, fontWeight: "600", marginBottom: 3, marginLeft: 8 },
  bubbleBody: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 3, marginHorizontal: 8 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", padding: 12, borderTopWidth: 1, gap: 10 },
  input: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  simulateBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  orderNumber: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: "flex-start", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { color: "#fff", fontSize: 13, fontWeight: "600" },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  riderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  riderAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  riderName: { fontSize: 15, fontWeight: "600" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  riderRating: { fontSize: 12 },
  callBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  plateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  plateText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  qtyBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, minWidth: 32, alignItems: "center" },
  qtyText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemSub: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "600" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryKey: { fontSize: 14 },
  summaryVal: { fontSize: 14, fontWeight: "500" },
  totalRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalKey: { fontSize: 16, fontWeight: "700" },
  totalVal: { fontSize: 18, fontWeight: "700" },
  addressRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  addressText: { fontSize: 13, flex: 1, lineHeight: 18 },
  notesText: { fontSize: 13, marginTop: 8, fontStyle: "italic" },
  branchName: { fontSize: 14, fontWeight: "600" },
  cancelBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 4, marginBottom: 12, borderWidth: 1.5, borderRadius: 16, paddingVertical: 14 },
  cancelText: { color: "#EF4444", fontSize: 15, fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: 12, marginHorizontal: 16, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  actionText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
