import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AuthScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState("+20");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "name">("phone");
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setError("");
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setError(t.invalidPhoneMsg);
      return;
    }

    if (step === "phone") {
      setStep("name");
      return;
    }

    if (!name.trim()) {
      setError(t.nameRequiredMsg);
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanPhone, name.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setError(t.signInErrorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: "star" as const, text: t.benefitLoyalty },
    { icon: "time" as const, text: t.benefitTrackOrders },
    { icon: "heart" as const, text: t.benefitSaveFavorites },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.headerBackground, colors.primary] as any}
        style={[
          styles.topSection,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 20 },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
        </Pressable>

        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Sea Gull Restaurant</Text>
          <Text style={styles.tagline}>{t.freshSeafoodTagline}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formSection}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {step === "phone" ? t.enterPhoneTitle : t.enterNameTitle}
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
            {step === "phone" ? t.phoneSubtitle : t.nameSubtitle}
          </Text>

          {step === "phone" ? (
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: error ? "#EF4444" : colors.border }]}>
              <View style={styles.flagContainer}>
                <View style={styles.egBadge}>
                  <Text style={styles.egBadgeText}>EG</Text>
                </View>
              </View>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="+20 1XX XXX XXXX"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={(v) => { setPhone(v); setError(""); }}
                keyboardType="phone-pad"
                autoFocus
              />
            </View>
          ) : (
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: error ? "#EF4444" : colors.border }]}>
              <View style={styles.flagContainer}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t.yourFullName}
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={(v) => { setName(v); setError(""); }}
                autoFocus
                autoCapitalize="words"
                keyboardType="default"
              />
            </View>
          )}

          {error !== "" && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={15} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === "name" && (
            <Pressable onPress={() => { setStep("phone"); setError(""); }} style={styles.backLink}>
              <Ionicons name="arrow-back" size={16} color={colors.primary} />
              <Text style={[styles.backLinkText, { color: colors.primary }]}>
                {t.changePhoneNumber}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={handleContinue} disabled={isLoading}>
            <LinearGradient
              colors={["#1A6FA8", "#0A1628"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueBtn}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.continueBtnText}>
                    {step === "phone" ? t.continueBtn : t.signIn}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={[styles.terms, { color: colors.textMuted }]}>
            {t.termsAgreement}{" "}
            <Text style={{ color: colors.primary }}>{t.termsOfServiceLink}</Text>
            {" "}&{" "}
            <Text style={{ color: colors.primary }}>{t.privacyPolicyLink}</Text>
          </Text>

          <View style={styles.benefits}>
            {benefits.map(({ icon, text }) => (
              <View key={icon} style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: `${colors.primary}18` }]}>
                  <Ionicons name={icon} size={16} color={colors.primary} />
                </View>
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  {text}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    top: Platform.OS === "web" ? 77 : undefined,
    padding: 8,
  },
  logoSection: {
    alignItems: "center",
    paddingTop: 20,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 14,
  },
  appName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  formSection: { flex: 1 },
  scrollContent: {
    padding: 24,
    paddingTop: 28,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingRight: 16,
    marginBottom: 8,
    overflow: "hidden",
  },
  flagContainer: {
    width: 52,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.1)",
  },
  egBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#CE1126",
    alignItems: "center",
    justifyContent: "center",
  },
  egBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  input: {
    flex: 1,
    paddingLeft: 14,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  backLinkText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  continueBtn: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  continueBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  terms: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 28,
  },
  benefits: {
    gap: 14,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
