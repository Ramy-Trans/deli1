import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LangCode } from "@/context/LanguageContext";

const LANGUAGES: { code: LangCode; name: string; nativeName: string; badgeColor: string; direction: "ltr" | "rtl" }[] = [
  { code: "en", name: "English", nativeName: "English", badgeColor: "#003087", direction: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", badgeColor: "#CE1126", direction: "rtl" },
  { code: "fr", name: "French", nativeName: "Français", badgeColor: "#002395", direction: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", badgeColor: "#3B3B3B", direction: "ltr" },
];

export default function LanguageScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const { token } = useAuth();
  const { lang, setLanguage, t } = useLanguage();
  const [saving, setSaving] = useState(false);

  const API_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

  const handleSelect = async (code: LangCode) => {
    if (code === lang) return;
    setSaving(true);
    try {
      await setLanguage(code);
      if (token) {
        await fetch(`${API_URL}/api/users/me`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ preferredLanguage: code }),
        });
      }
      // language applied; UI auto-refreshes via context
    } catch {}
    setSaving(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.language}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {saving && (
        <View style={[styles.savingBar, { backgroundColor: colors.oceanBlue }]}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.savingText}>{t.applyingLanguage}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}>
        <View style={[styles.infoCard, { backgroundColor: colors.oceanBlue + "15", borderColor: colors.oceanBlue + "40" }]}>
          <MaterialCommunityIcons name="translate" size={20} color={colors.oceanBlue} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t.selectLanguage}
          </Text>
        </View>

        {LANGUAGES.map((language) => {
          const isSelected = lang === language.code;
          return (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.langCard,
                {
                  backgroundColor: isSelected ? colors.oceanBlue + "18" : colors.surface,
                  borderColor: isSelected ? colors.oceanBlue : colors.border,
                },
              ]}
              onPress={() => handleSelect(language.code)}
              activeOpacity={0.75}
            >
              <View style={[styles.langBadge, { backgroundColor: language.badgeColor }]}>
                <Text style={styles.langBadgeText}>{language.code.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.langName, { color: colors.text }]}>{language.name}</Text>
                <Text style={[styles.langNative, { color: colors.textSecondary }]}>{language.nativeName}</Text>
              </View>
              <View style={styles.langRight}>
                {language.direction === "rtl" && (
                  <View style={[styles.rtlBadge, { backgroundColor: colors.gold + "20" }]}>
                    <Text style={[styles.rtlText, { color: colors.gold }]}>RTL</Text>
                  </View>
                )}
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.oceanBlue }]}>
                    <MaterialCommunityIcons name="check" size={14} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.noteCard, { backgroundColor: colors.gold + "10", borderColor: colors.gold + "30" }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.gold} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            {t.rtlRestartNote}
          </Text>
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
  savingBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 8 },
  savingText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  infoCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  langCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1.5, padding: 16 },
  langBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  langBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  langName: { fontSize: 16, fontWeight: "700" },
  langNative: { fontSize: 13, marginTop: 2 },
  langRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rtlBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  rtlText: { fontSize: 11, fontWeight: "700" },
  checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  noteCard: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start", marginTop: 4 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17 },
});
