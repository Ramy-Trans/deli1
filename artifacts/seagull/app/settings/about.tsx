import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();

  const STATS = [
    { value: "25+", label: t.statYears },
    { value: "50K+", label: t.statCustomers },
    { value: "3", label: t.statBranches },
    { value: "4.9", label: t.statRating },
  ];

  const VALUES = [
    { icon: "fish", title: t.valueFreshnessTitle, desc: t.valueFreshnessDesc },
    { icon: "leaf", title: t.valueSustainTitle, desc: t.valueSustainDesc },
    { icon: "heart", title: t.valueFamilyTitle, desc: t.valueFamilyDesc },
    { icon: "shield-check", title: t.valueSafetyTitle, desc: t.valueSafetyDesc },
  ];

  const AWARDS = [
    { icon: "trophy", label: t.award1Label, org: t.award1Org },
    { icon: "star-circle", label: t.award2Label, org: t.award2Org },
    { icon: "heart", label: t.award3Label, org: t.award3Org },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.aboutSeaGull}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.logoTitle}>Sea Gull Restaurant</Text>
          <Text style={styles.logoTagline}>{t.aboutTagline}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.gold }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>{t.ourStory}</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{t.aboutBodyText1}</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{t.aboutBodyText2}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>{t.ourValues}</Text>
          {VALUES.map((item) => (
            <View key={item.title} style={styles.valueRow}>
              <View style={[styles.valueIcon, { backgroundColor: colors.gold + "20" }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.valueTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>{t.awardsRecognition}</Text>
          {AWARDS.map((award) => (
            <View key={award.label} style={[styles.awardRow, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name={award.icon as any} size={22} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.awardName, { color: colors.text }]}>{award.label}</Text>
                <Text style={[styles.awardOrg, { color: colors.textSecondary }]}>{award.org}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>{t.followUs}</Text>
          <View style={styles.socialRow}>
            {[
              { icon: "instagram", color: "#E1306C", label: "@seagullrest", url: "https://instagram.com" },
              { icon: "facebook", color: "#1877F2", label: "Sea Gull Restaurant", url: "https://facebook.com" },
              { icon: "twitter", color: "#1DA1F2", label: "@seagullcairo", url: "https://twitter.com" },
            ].map((social) => (
              <TouchableOpacity
                key={social.label}
                style={[styles.socialBtn, { backgroundColor: social.color + "15", borderColor: social.color + "40" }]}
                onPress={() => Linking.openURL(social.url)}
              >
                <MaterialCommunityIcons name={social.icon as any} size={22} color={social.color} />
                <Text style={[styles.socialLabel, { color: colors.textSecondary }]}>{social.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.versionCard}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Sea Gull Restaurant App</Text>
          <Text style={[styles.versionNum, { color: colors.textSecondary }]}>Version 1.0.0 · Build 2024.1</Text>
          <Text style={[styles.versionCopy, { color: colors.textSecondary }]}>{t.versionCopyright}</Text>
          <View style={styles.legalRow}>
            <TouchableOpacity>
              <Text style={[styles.legalLink, { color: colors.oceanBlue }]}>{t.privacyPolicyLink}</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary }}>·</Text>
            <TouchableOpacity>
              <Text style={[styles.legalLink, { color: colors.oceanBlue }]}>{t.termsOfServiceLink}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  logoSection: { alignItems: "center", gap: 8 },
  logo: { width: 80, height: 80, borderRadius: 40 },
  logoTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  logoTagline: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 4 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 10, textAlign: "center", marginTop: 2, fontWeight: "500" },
  section: { margin: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 14 },
  bodyText: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  valueRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 14 },
  valueIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  valueTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  valueDesc: { fontSize: 12, lineHeight: 17 },
  awardRow: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 10, borderBottomWidth: 1 },
  awardName: { fontSize: 13, fontWeight: "600" },
  awardOrg: { fontSize: 12, marginTop: 1 },
  socialRow: { gap: 10 },
  socialBtn: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 12 },
  socialLabel: { fontSize: 13 },
  versionCard: { alignItems: "center", gap: 4, padding: 24 },
  versionText: { fontSize: 14, fontWeight: "600" },
  versionNum: { fontSize: 12 },
  versionCopy: { fontSize: 11, marginTop: 4 },
  legalRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  legalLink: { fontSize: 12, fontWeight: "600" },
});
