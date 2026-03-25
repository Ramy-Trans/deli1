import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ConfirmModal from "@/components/ConfirmModal";

const API_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface NotifPrefs {
  orderUpdates: boolean;
  promotions: boolean;
  loyaltyRewards: boolean;
  riderLocation: boolean;
  newsletter: boolean;
}

export default function NotificationsScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const { token } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const SETTINGS: Array<{ key: keyof NotifPrefs; title: string; desc: string; icon: string }> = [
    { key: "orderUpdates", title: t.notifOrderUpdates, desc: t.notifOrderUpdatesDesc, icon: "package-variant" },
    { key: "riderLocation", title: t.notifRiderTracking, desc: t.notifRiderTrackingDesc, icon: "bike" },
    { key: "loyaltyRewards", title: t.notifLoyaltyRewards, desc: t.notifLoyaltyRewardsDesc, icon: "trophy" },
    { key: "promotions", title: t.notifPromotions, desc: t.notifPromotionsDesc, icon: "tag" },
    { key: "newsletter", title: t.notifNewsletter, desc: t.notifNewsletterDesc, icon: "newspaper-variant" },
  ];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTurnOffConfirm, setShowTurnOffConfirm] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>({
    orderUpdates: true,
    promotions: true,
    loyaltyRewards: true,
    riderLocation: true,
    newsletter: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.notificationPreferences) {
            try {
              const parsed = typeof data.notificationPreferences === "string"
                ? JSON.parse(data.notificationPreferences)
                : data.notificationPreferences;
              setPrefs((p) => ({ ...p, ...parsed }));
            } catch {}
          }
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const toggle = async (key: keyof NotifPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notificationPreferences: updated }),
      });
    } catch {}
    setSaving(false);
  };

  const doTurnOffAll = () => {
    setShowTurnOffConfirm(false);
    setPrefs({ orderUpdates: false, promotions: false, loyaltyRewards: false, riderLocation: false, newsletter: false });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.oceanBlue} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ConfirmModal
        visible={showTurnOffConfirm}
        title={t.turnOffAll}
        message={t.turnOffAllMsg}
        confirmLabel={t.turnOff}
        cancelLabel={t.cancel}
        onConfirm={doTurnOffAll}
        onCancel={() => setShowTurnOffConfirm(false)}
        destructive
        colors={colors}
      />

      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.notifications}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <View style={[styles.infoCard, { backgroundColor: colors.oceanBlue + "15", borderColor: colors.oceanBlue + "40" }]}>
          <MaterialCommunityIcons name="bell-outline" size={20} color={colors.oceanBlue} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Choose which notifications you want to receive from Sea Gull Restaurant
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {SETTINGS.map((item, i) => (
            <View
              key={item.key}
              style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <View style={[styles.iconBg, { backgroundColor: colors.oceanBlue + "15" }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.oceanBlue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
              <Switch
                value={prefs[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: colors.border, true: colors.oceanBlue + "60" }}
                thumbColor={prefs[item.key] ? colors.oceanBlue : colors.textSecondary}
                disabled={saving}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.allOffBtn, { borderColor: colors.border }]}
          onPress={() => setShowTurnOffConfirm(true)}
        >
          <MaterialCommunityIcons name="bell-off-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.allOffText, { color: colors.textSecondary }]}>{t.turnOffAll}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  infoCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  section: { borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  iconBg: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  rowDesc: { fontSize: 12, lineHeight: 16 },
  allOffBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 14, paddingVertical: 14 },
  allOffText: { fontSize: 14 },
});
