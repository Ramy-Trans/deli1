import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";

function FAQItem({ q, a, colors }: { q: string; a: string; colors: any }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setOpen(!open); }}
      style={[styles.faqItem, { borderColor: colors.border }]}
      activeOpacity={0.8}
    >
      <View style={styles.faqRow}>
        <Text style={[styles.faqQ, { color: colors.text }]}>{q}</Text>
        <MaterialCommunityIcons name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
      </View>
      {open && <Text style={[styles.faqA, { color: colors.textSecondary }]}>{a}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();

  const FAQS = [
    {
      category: t.faqCatOrders,
      icon: "package-variant",
      color: "#3B82F6",
      items: [
        { q: t.faqQ1, a: t.faqA1 },
        { q: t.faqQ2, a: t.faqA2 },
        { q: t.faqQ3, a: t.faqA3 },
        { q: t.faqQ4, a: t.faqA4 },
      ],
    },
    {
      category: t.faqCatPayment,
      icon: "credit-card",
      color: "#22C55E",
      items: [
        { q: t.faqQ5, a: t.faqA5 },
        { q: t.faqQ6, a: t.faqA6 },
        { q: t.faqQ7, a: t.faqA7 },
      ],
    },
    {
      category: t.faqCatLoyalty,
      icon: "trophy",
      color: "#D4AF37",
      items: [
        { q: t.faqQ8, a: t.faqA8 },
        { q: t.faqQ9, a: t.faqA9 },
        { q: t.faqQ10, a: t.faqA10 },
      ],
    },
    {
      category: t.faqCatAccount,
      icon: "account",
      color: "#8B5CF6",
      items: [
        { q: t.faqQ11, a: t.faqA11 },
        { q: t.faqQ12, a: t.faqA12 },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.helpTitle}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>{t.helpSubtitle}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        <View style={[styles.searchHint, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
          <Text style={[styles.searchHintText, { color: colors.textSecondary }]}>
            {t.cantFindAnswer}{" "}
            <Text style={{ color: colors.oceanBlue, fontWeight: "700" }} onPress={() => router.push("/settings/contact")}>
              {t.contactUs}
            </Text>
          </Text>
        </View>

        {FAQS.map((cat) => (
          <View key={cat.category}>
            <View style={styles.catHeader}>
              <View style={[styles.catIcon, { backgroundColor: cat.color + "20" }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={18} color={cat.color} />
              </View>
              <Text style={[styles.catTitle, { color: colors.text }]}>{cat.category}</Text>
            </View>
            <View style={[styles.catCard, { backgroundColor: colors.surface }]}>
              {cat.items.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} colors={colors} />
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: colors.oceanBlue }]}
          onPress={() => router.push("/settings/contact")}
        >
          <MaterialCommunityIcons name="headset" size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>{t.stillNeedHelp}</Text>
            <Text style={styles.contactDesc}>{t.supportAvailable}</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, textAlign: "center" },
  searchHint: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  searchHintText: { flex: 1, fontSize: 13, lineHeight: 18 },
  catHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  catIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  catTitle: { fontSize: 15, fontWeight: "700" },
  catCard: { borderRadius: 16, overflow: "hidden" },
  faqItem: { padding: 14, borderBottomWidth: 1 },
  faqRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  faqA: { fontSize: 13, lineHeight: 20, marginTop: 10 },
  contactCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 16 },
  contactTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  contactDesc: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
});
