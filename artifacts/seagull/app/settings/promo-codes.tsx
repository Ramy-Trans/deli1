import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";

const API_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const TYPE_COLORS: Record<string, string> = {
  percentage: "#8B5CF6",
  fixed: "#3B82F6",
  free_delivery: "#22C55E",
};

const TYPE_ICONS: Record<string, string> = {
  percentage: "percent",
  fixed: "cash",
  free_delivery: "truck-outline",
};

interface ApiCoupon {
  id: number;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  expiresAt: string | null;
}

export default function PromoCodesScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();
  const [inputCode, setInputCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [appliedCodes, setAppliedCodes] = useState<string[]>([]);
  const [applyError, setApplyError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<ApiCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/coupons`)
      .then((r) => r.json())
      .then((data) => setAvailableCoupons(Array.isArray(data) ? data : []))
      .catch(() => setAvailableCoupons([]))
      .finally(() => setLoadingCoupons(false));
  }, []);

  const handleApply = async () => {
    if (!inputCode.trim()) return;
    setApplyError("");
    setChecking(true);
    try {
      const res = await fetch(`${API_URL}/api/coupons/${inputCode.trim().toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        if (!appliedCodes.includes(data.code)) {
          setAppliedCodes((p) => [...p, data.code]);
        }
        setInputCode("");
      } else {
        setApplyError(t.errorMsg);
      }
    } catch {
      setApplyError(t.errorMsg);
    }
    setChecking(false);
  };

  const handleCopy = async (code: string) => {
    try { await Clipboard.setStringAsync(code); } catch {}
  };

  const handleRemove = (code: string) => {
    setAppliedCodes((p) => p.filter((c) => c !== code));
  };

  const getValueLabel = (c: ApiCoupon) => {
    if (c.discountType === "percentage") return `${c.discountValue}%`;
    if (c.discountType === "fixed") return `EGP ${c.discountValue}`;
    return "FREE";
  };

  const getDescription = (c: ApiCoupon) => {
    if (c.description) return c.description;
    if (c.discountType === "percentage") return `${c.discountValue}% off your order`;
    if (c.discountType === "fixed") return `EGP ${c.discountValue} off your order`;
    return "Free delivery on your order";
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.promoCodes}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t.enterPromoCodeLabel}</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={inputCode}
              onChangeText={(v) => { setInputCode(v.toUpperCase()); setApplyError(""); }}
              placeholder="e.g. WELCOME20"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              style={[styles.input, { color: colors.text, borderColor: applyError ? "#EF4444" : colors.border, backgroundColor: isDark ? "#0D1B2A" : "#F0F6FC" }]}
            />
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.gold, opacity: checking ? 0.7 : 1 }]}
              onPress={handleApply}
              disabled={checking}
            >
              {checking ? <ActivityIndicator size="small" color={colors.navyDeep} /> : <Text style={[styles.applyText, { color: colors.navyDeep }]}>{t.apply}</Text>}
            </TouchableOpacity>
          </View>
          {applyError ? <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>{applyError}</Text> : null}
        </View>

        {appliedCodes.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.appliedCodes.toUpperCase()}</Text>
            {appliedCodes.map((code) => {
              const coupon = availableCoupons.find((c) => c.code === code);
              return (
                <View key={code} style={[styles.appliedRow, { backgroundColor: "#22C55E20", borderColor: "#22C55E40" }]}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#22C55E" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.appliedCode, { color: "#22C55E" }]}>{code}</Text>
                    {coupon && <Text style={[styles.appliedDesc, { color: colors.textSecondary }]}>{getDescription(coupon)}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(code)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.availableOffers.toUpperCase()}</Text>
        {loadingCoupons ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : availableCoupons.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 20, fontSize: 14 }}>No offers available right now</Text>
        ) : (
          availableCoupons.map((promo) => {
            const col = TYPE_COLORS[promo.discountType] ?? "#3B82F6";
            const ico = TYPE_ICONS[promo.discountType] ?? "tag";
            const isApplied = appliedCodes.includes(promo.code);
            return (
              <View key={promo.code} style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: isApplied ? "#22C55E" : colors.border }]}>
                <View style={[styles.promoLeft, { backgroundColor: col + "20" }]}>
                  <MaterialCommunityIcons name={ico as any} size={26} color={col} />
                  <Text style={[styles.promoValue, { color: col }]}>{getValueLabel(promo)}</Text>
                </View>
                <View style={styles.promoBody}>
                  <Text style={[styles.promoCode, { color: colors.text }]}>{promo.code}</Text>
                  <Text style={[styles.promoDesc, { color: colors.textSecondary }]}>{getDescription(promo)}</Text>
                  <Text style={[styles.promoTerms, { color: colors.textSecondary }]}>
                    {promo.minOrderAmount > 0 ? `Min. EGP ${promo.minOrderAmount}` : "No minimum"}
                    {promo.expiresAt ? ` · Expires ${new Date(promo.expiresAt).toLocaleDateString("en-EG", { month: "short", year: "numeric" })}` : ""}
                  </Text>
                </View>
                <View style={styles.promoActions}>
                  <TouchableOpacity onPress={() => handleCopy(promo.code)} style={styles.copyBtn}>
                    <MaterialCommunityIcons name="content-copy" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {isApplied ? (
                    <View style={[styles.appliedBadge, { backgroundColor: "#22C55E20" }]}>
                      <Text style={{ color: "#22C55E", fontSize: 10, fontWeight: "700" }}>✓ {t.appliedLabel}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.useBtn, { backgroundColor: col + "20", borderColor: col + "40" }]}
                      onPress={() => setInputCode(promo.code)}
                    >
                      <Text style={[styles.useText, { color: col }]}>{t.use}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  inputCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  inputRow: { flexDirection: "row", gap: 10 },
  input: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: "700" },
  applyBtn: { borderRadius: 12, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  applyText: { fontSize: 15, fontWeight: "700" },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  appliedRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  appliedCode: { fontSize: 14, fontWeight: "700" },
  appliedDesc: { fontSize: 12, marginTop: 2 },
  promoCard: { flexDirection: "row", gap: 12, borderRadius: 16, borderWidth: 1.5, padding: 14, alignItems: "center", marginBottom: 8 },
  promoLeft: { width: 72, borderRadius: 14, padding: 10, alignItems: "center", justifyContent: "center" },
  promoValue: { fontSize: 15, fontWeight: "800", marginTop: 4 },
  promoBody: { flex: 1 },
  promoCode: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  promoDesc: { fontSize: 12, lineHeight: 16 },
  promoTerms: { fontSize: 11, marginTop: 4 },
  promoActions: { alignItems: "center", gap: 8 },
  copyBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  useBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  useText: { fontSize: 13, fontWeight: "700" },
  appliedBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
});
