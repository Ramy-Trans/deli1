import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCreateOrder, useValidateCoupon } from "@workspace/api-client-react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LocationPickerModal from "@/components/LocationPickerModal";

const API_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const DELIVERY_FEE = 25;
const SERVICE_FEE = 10;
const TAX_RATE = 0.14;

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash on Delivery", note: null, icon: "cash", color: "#27AE60" },
  { key: "visa", label: "Visa", note: "Payment device will be with the delivery agent", icon: "card", color: "#1A6FA8" },
];

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, clearCart, branchId, setBranchId } = useCart();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [isContactless, setIsContactless] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [addressError, setAddressError] = useState("");

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [nearestBranchName, setNearestBranchName] = useState<string | null>(null);
  const [branchDetecting, setBranchDetecting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    // Pre-fill saved delivery address from map picker if available
    (async () => {
      const savedAddr = await AsyncStorage.getItem("@delivery_address");
      const savedLat  = await AsyncStorage.getItem("@delivery_lat");
      const savedLng  = await AsyncStorage.getItem("@delivery_lng");
      if (savedAddr) setAddress(savedAddr);
      if (savedLat && savedLng) {
        const lat = parseFloat(savedLat);
        const lng = parseFloat(savedLng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setUserLat(lat);
          setUserLng(lng);
        }
      }
    })();
    autoDetectNearestBranch();
  }, []);

  const detectNearestBranch = async (latitude: number, longitude: number) => {
    const res = await fetch(
      `${API_URL}/api/branches/nearest?userLat=${latitude}&userLng=${longitude}`
    );
    if (!res.ok) return;
    const nearest = await res.json();
    if (nearest?.id) {
      setBranchId(nearest.id);
      setNearestBranchName(nearest.name);
    }
  };

  const autoDetectNearestBranch = async () => {
    setBranchDetecting(true);
    try {
      // 1. Try fresh GPS (native only)
      if (Platform.OS !== "web") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = loc.coords;
            setUserLat(latitude);
            setUserLng(longitude);
            await detectNearestBranch(latitude, longitude);
            setBranchDetecting(false);
            return;
          } catch {
            // GPS failed — fall through to saved location
          }
        }
      }
      // 2. Fall back to the delivery location saved from the map picker
      const savedLat = await AsyncStorage.getItem("@delivery_lat");
      const savedLng = await AsyncStorage.getItem("@delivery_lng");
      if (savedLat && savedLng) {
        const lat = parseFloat(savedLat);
        const lng = parseFloat(savedLng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setUserLat(lat);
          setUserLng(lng);
          await detectNearestBranch(lat, lng);
        }
      }
    } catch {
    } finally {
      setBranchDetecting(false);
    }
  };

  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const serviceFee = SERVICE_FEE;
  const tax = (subtotal + deliveryFee) * TAX_RATE;
  const discount = appliedCoupon?.discount ?? 0;
  const total = subtotal + deliveryFee + serviceFee + tax + tipAmount - discount;

  const createOrder = useCreateOrder();
  const validateCouponMutation = useValidateCoupon();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      const result = await validateCouponMutation.mutateAsync({
        data: { code: couponCode.trim(), orderAmount: subtotal },
      });
      if (result.valid) {
        setAppliedCoupon({ code: couponCode.trim(), discount: result.discount ?? 0 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCouponCode("");
      } else {
        setCouponError(result.message ?? t.errorMsg);
      }
    } catch {
      setCouponError(t.errorMsg);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (orderType === "delivery" && (!address.trim() || !userLat || !userLng)) {
      setAddressError(t.enterDeliveryAddressMsg);
      return;
    }
    setAddressError("");
    setOrderError("");

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const order = await createOrder.mutateAsync({
        data: {
          branchId: branchId ?? 1,
          deliveryLatitude: userLat ?? undefined,
          deliveryLongitude: userLng ?? undefined,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.price,
            addOns: item.addOns,
            specialInstructions: item.specialInstructions,
          })),
          paymentMethod,
          type: orderType,
          deliveryAddress: address,
          deliveryNotes,
          specialInstructions,
          couponCode: appliedCoupon?.code,
          tip: tipAmount,
          subtotal,
          deliveryFee,
          serviceFee,
          tax,
          total,
          isContactless,
        },
      });

      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: "/order/[id]", params: { id: order.id } });
    } catch (err) {
      setOrderError(t.errorMsg);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.checkout}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Order Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.orderType}</Text>
          <View style={styles.orderTypeRow}>
            {(["delivery", "pickup"] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => setOrderType(type)}
                style={[
                  styles.orderTypeBtn,
                  {
                    backgroundColor:
                      orderType === type ? colors.primary : colors.surface,
                    borderColor: orderType === type ? colors.primary : colors.border,
                    flex: 1,
                  },
                ]}
              >
                <Ionicons
                  name={type === "delivery" ? "bicycle" : "storefront"}
                  size={20}
                  color={orderType === type ? "#fff" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.orderTypeText,
                    { color: orderType === type ? "#fff" : colors.text },
                  ]}
                >
                  {type === "delivery" ? t.delivery : t.pickup}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        {orderType === "delivery" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.deliveryAddress}</Text>

            {branchDetecting && (
              <View style={[styles.branchBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.oceanBlue} />
                <Text style={[styles.branchBannerText, { color: colors.textSecondary }]}>
                  Detecting your nearest branch…
                </Text>
              </View>
            )}
            {!branchDetecting && nearestBranchName && (
              <View style={[styles.branchBanner, { backgroundColor: colors.oceanBlue + "18", borderColor: colors.oceanBlue + "40" }]}>
                <MaterialCommunityIcons name="map-marker-check" size={16} color={colors.oceanBlue} />
                <Text style={[styles.branchBannerText, { color: colors.oceanBlue }]}>
                  Nearest branch: <Text style={{ fontWeight: "700" }}>{nearestBranchName}</Text>
                </Text>
              </View>
            )}

            {/* Map-based address picker */}
            <Pressable
              style={[
                styles.mapPickerBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: addressError ? "#EF4444" : userLat ? colors.oceanBlue + "60" : colors.border,
                },
              ]}
              onPress={() => { setShowMapPicker(true); setAddressError(""); }}
            >
              <View style={[styles.mapPickerIcon, { backgroundColor: userLat ? colors.oceanBlue + "18" : colors.border + "50" }]}>
                <MaterialCommunityIcons
                  name={userLat ? "map-marker-check" : "map-marker-plus"}
                  size={22}
                  color={userLat ? colors.oceanBlue : colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                {address ? (
                  <>
                    <Text style={[styles.mapPickerAddressText, { color: colors.text }]} numberOfLines={2}>
                      {address}
                    </Text>
                    <Text style={[styles.mapPickerSubText, { color: colors.textSecondary }]}>
                      Tap to change location
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.mapPickerPlaceholder, { color: colors.textSecondary }]}>
                      Pick your delivery location
                    </Text>
                    <Text style={[styles.mapPickerSubText, { color: colors.textMuted }]}>
                      Select on map for accurate delivery
                    </Text>
                  </>
                )}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>
            {addressError ? <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{addressError}</Text> : null}
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginTop: 8 },
              ]}
              placeholder={t.deliveryNotesPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
            />
            <Pressable
              onPress={() => setIsContactless(!isContactless)}
              style={[styles.toggleRow, { backgroundColor: colors.surface }]}
            >
              <View style={styles.toggleLeft}>
                <Ionicons name="hand-right-outline" size={20} color={colors.primary} />
                <Text style={[styles.toggleText, { color: colors.text }]}>{t.contactlessDelivery}</Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  { backgroundColor: isContactless ? colors.primary : colors.border },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: isContactless ? 20 : 2 }] },
                  ]}
                />
              </View>
            </Pressable>
          </View>
        )}

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.specialInstructions}</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            ]}
            placeholder={t.kitchenRequestsPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
          />
        </View>

        {/* Coupon */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.promoCode}</Text>
          <View style={styles.couponRow}>
            <TextInput
              style={[
                styles.couponInput,
                { backgroundColor: colors.surface, color: colors.text, borderColor: couponError ? "#EF4444" : colors.border },
              ]}
              placeholder={t.enterPromoCodePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={couponCode}
              onChangeText={(v) => { setCouponCode(v); setCouponError(""); }}
              autoCapitalize="characters"
            />
            <Pressable
              onPress={handleApplyCoupon}
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.applyBtnText}>{t.apply}</Text>
            </Pressable>
          </View>
          {couponError ? <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{couponError}</Text> : null}
          {appliedCoupon && (
            <View style={[styles.couponApplied, { backgroundColor: "#27AE6018" }]}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.couponAppliedText}>
                {appliedCoupon.code} — EGP {appliedCoupon.discount.toFixed(0)} {t.discount.toLowerCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Tip */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.tipForRider}</Text>
          <View style={styles.tipRow}>
            {[0, 5, 10, 15, 20].map((tipAmt) => (
              <Pressable
                key={tipAmt}
                onPress={() => setTipAmount(tipAmt)}
                style={[
                  styles.tipBtn,
                  {
                    backgroundColor: tipAmount === tipAmt ? colors.primary : colors.surface,
                    borderColor: tipAmount === tipAmt ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tipText,
                    { color: tipAmount === tipAmt ? "#fff" : colors.text },
                  ]}
                >
                  {tipAmt === 0 ? t.noTip : `EGP ${tipAmt}`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.paymentMethod}</Text>
          <View style={[styles.paymentList, { backgroundColor: colors.surface }]}>
            {PAYMENT_METHODS.map((pm, idx) => (
              <React.Fragment key={pm.key}>
                <Pressable
                  onPress={() => setPaymentMethod(pm.key)}
                  style={styles.paymentRow}
                >
                  <View style={[styles.paymentIcon, { backgroundColor: `${pm.color}18` }]}>
                    <Ionicons name={pm.icon as any} size={20} color={pm.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.paymentLabel, { color: colors.text }]}>
                      {pm.label}
                    </Text>
                    {pm.note && (
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                        {pm.note}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: paymentMethod === pm.key ? colors.primary : colors.border,
                        backgroundColor:
                          paymentMethod === pm.key ? colors.primary : "transparent",
                      },
                    ]}
                  >
                    {paymentMethod === pm.key && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </Pressable>
                {idx < PAYMENT_METHODS.length - 1 && (
                  <View style={[styles.sep, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.orderSummary}</Text>
          {[
            { label: t.subtotal, value: `EGP ${subtotal.toFixed(0)}`, isDiscount: false },
            { label: t.deliveryFee, value: `EGP ${deliveryFee}`, isDiscount: false },
            { label: t.serviceFee, value: `EGP ${serviceFee}`, isDiscount: false },
            { label: t.taxLabel, value: `EGP ${tax.toFixed(0)}`, isDiscount: false },
            { label: t.tip, value: `EGP ${tipAmount}`, isDiscount: false },
            ...(discount > 0
              ? [{ label: t.discount, value: `-EGP ${discount.toFixed(0)}`, isDiscount: true }]
              : []),
          ].map(({ label, value, isDiscount }) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
              <Text style={[styles.summaryValue, { color: isDiscount ? colors.success : colors.text }]}>
                {value}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t.total}</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>EGP {total.toFixed(0)}</Text>
          </View>
        </View>
        {orderError ? (
          <Text style={{ color: "#EF4444", fontSize: 13, textAlign: "center", marginHorizontal: 16, marginBottom: 8 }}>{orderError}</Text>
        ) : null}
      </ScrollView>

      <LocationPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onAssign={async (addr, lat, lng) => {
          setUserLat(lat);
          setUserLng(lng);
          setAddress(addr);
          setAddressError("");
          setShowMapPicker(false);
          await AsyncStorage.setItem("@delivery_lat", lat.toString());
          await AsyncStorage.setItem("@delivery_lng", lng.toString());
          await AsyncStorage.setItem("@delivery_address", addr);
          detectNearestBranch(lat, lng);
        }}
        initialLat={userLat ?? undefined}
        initialLng={userLng ?? undefined}
      />

      {/* Place Order */}
      <View
        style={[
          styles.placeOrderContainer,
          {
            backgroundColor: colors.surface,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 12,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={handlePlaceOrder} disabled={createOrder.isPending}>
          <LinearGradient
            colors={["#1A6FA8", "#0A1628"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.placeOrderBtn}
          >
            {createOrder.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.placeOrderText}>{t.placeOrder}</Text>
                <Text style={styles.placeOrderTotal}>EGP {total.toFixed(0)}</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  orderTypeRow: { flexDirection: "row", gap: 10 },
  orderTypeBtn: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  orderTypeText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  branchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  branchBannerText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 50,
  },
  mapPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    gap: 12,
    minHeight: 64,
  },
  mapPickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPickerAddressText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
  },
  mapPickerPlaceholder: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  mapPickerSubText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  toggleText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  toggle: { width: 44, height: 26, borderRadius: 13, justifyContent: "center" },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  couponRow: { flexDirection: "row", gap: 10 },
  couponInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  applyBtn: { borderRadius: 12, paddingHorizontal: 20, justifyContent: "center" },
  applyBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  couponApplied: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  couponAppliedText: { color: "#27AE60", fontFamily: "Inter_500Medium", fontSize: 13 },
  tipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tipBtn: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10 },
  tipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  paymentList: { borderRadius: 14, overflow: "hidden" },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
  sep: { height: 1, marginLeft: 66 },
  summaryCard: { margin: 16, borderRadius: 16, padding: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 14, fontFamily: "Inter_500Medium" },
  divider: { height: 1, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  placeOrderContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  placeOrderBtn: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  placeOrderText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 16, flex: 1 },
  placeOrderTotal: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
});
