import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function ProfileSettingsScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const { token, user: authUser, isLoading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      if (authUser) {
        setName(authUser.name ?? "");
        setEmail(authUser.email ?? "");
        setPhone(authUser.phone ?? "");
      }
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.name ?? "");
          setEmail(data.email ?? "");
          setPhone(data.phone ?? "");
        } else if (authUser) {
          setName(authUser.name ?? "");
          setEmail(authUser.email ?? "");
          setPhone(authUser.phone ?? "");
        }
      } catch {
        if (authUser) {
          setName(authUser.name ?? "");
          setEmail(authUser.email ?? "");
          setPhone(authUser.phone ?? "");
        }
      }
      setLoading(false);
    })();
  }, [token, authLoading]);

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError(t.errorMsg);
      return;
    }
    setSaveError("");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined }),
      });
      if (res.ok) {
        updateUser({ name: name.trim(), email: email.trim() || undefined });
        router.back();
      } else {
        const err = await res.json();
        setSaveError(err.error ?? t.errorMsg);
      }
    } catch {
      setSaveError(t.errorMsg);
    }
    setSaving(false);
  };

  if (loading || authLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.oceanBlue} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.personalInformation}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.gold + "30" }]}>
            <Text style={[styles.avatarText, { color: colors.gold }]}>
              {name.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarEdit}>
            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.personalInformation.toUpperCase()}</Text>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.fullName}</Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: isDark ? colors.navyDeep + "40" : "#F8FAFC" }]}>
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={name}
                onChangeText={(v) => { setName(v); setSaveError(""); }}
                placeholder={t.enterYourName}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text }]}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.emailAddress}</Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: isDark ? colors.navyDeep + "40" : "#F8FAFC" }]}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t.enterYourEmail}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.phoneNumber}</Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: isDark ? colors.navyDeep + "40" : "#F8FAFC", opacity: 0.7 }]}>
              <MaterialCommunityIcons name="phone-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={phone}
                editable={false}
                placeholder="Phone number"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.textSecondary }]}
              />
              <MaterialCommunityIcons name="lock-outline" size={16} color={colors.textSecondary} />
            </View>
            <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>Phone number cannot be changed</Text>
          </View>
        </View>

        {saveError ? (
          <Text style={{ color: "#EF4444", fontSize: 13, textAlign: "center", marginHorizontal: 16 }}>{saveError}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.gold, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.navyDeep} />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={20} color={colors.navyDeep} />
              <Text style={[styles.saveBtnText, { color: colors.navyDeep }]}>{t.saveChanges}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 16, alignItems: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  avatarContainer: { position: "relative" },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" },
  avatarText: { fontSize: 36, fontWeight: "700" },
  avatarEdit: { position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  section: { borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  fieldHint: { fontSize: 11, marginTop: 6 },
  saveBtn: { borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveBtnText: { fontSize: 16, fontWeight: "700" },
});
