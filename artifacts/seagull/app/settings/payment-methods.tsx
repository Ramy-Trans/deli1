import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";

const PAYMENT_METHODS = [
  {
    id: "cash",
    icon: "cash",
    label: "Cash on Delivery",
    desc: "Pay when your order arrives",
    note: null,
    color: "#22C55E",
  },
  {
    id: "visa",
    icon: "credit-card",
    label: "Visa / Credit Card",
    desc: "Pay securely with your card",
    note: "Payment via machine with the delivery agent",
    color: "#1A6FA8",
  },
];

export default function PaymentMethodsScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.paymentMethods}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PAYMENT OPTIONS</Text>
        <View style={[styles.methodsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {PAYMENT_METHODS.map((method, i) => (
            <View key={method.id}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <View style={styles.methodRow}>
                <View style={[styles.methodIcon, { backgroundColor: method.color + "20" }]}>
                  <MaterialCommunityIcons name={method.icon as any} size={22} color={method.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.methodName, { color: colors.text }]}>{method.label}</Text>
                  <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>{method.desc}</Text>
                  {method.note && (
                    <View style={styles.noteRow}>
                      <MaterialCommunityIcons name="information-outline" size={13} color={method.color} />
                      <Text style={[styles.methodNote, { color: method.color }]}>{method.note}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.availBadge, { backgroundColor: method.color + "20" }]}>
                  <Text style={[styles.availText, { color: method.color }]}>Available</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.secureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#22C55E" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.secureTitle, { color: colors.text }]}>Secure Payments</Text>
            <Text style={[styles.secureDesc, { color: colors.textSecondary }]}>
              All transactions are encrypted with 256-bit SSL. Your card data is never stored on our servers.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 12 },
  methodsList: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  methodRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  methodIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  methodName: { fontSize: 14, fontWeight: "600" },
  methodDesc: { fontSize: 12, marginTop: 1 },
  noteRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  methodNote: { fontSize: 11, fontWeight: "600" },
  availBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  availText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, marginHorizontal: 14 },
  secureCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  secureTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  secureDesc: { fontSize: 12, lineHeight: 17 },
});
