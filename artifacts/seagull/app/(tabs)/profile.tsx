import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Switch,
} from "react-native";
import ConfirmModal from "@/components/ConfirmModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  color?: string;
}

function MenuItem({ icon, label, value, onPress, rightElement, color }: MenuItemProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${color ?? colors.primary}18` }]}>
        {icon}
      </View>
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      {value && (
        <Text style={[styles.menuValue, { color: colors.textMuted }]}>{value}</Text>
      )}
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const API_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, token, isAuthenticated, logout } = useAuth();
  const { clearCart } = useCart();
  const { clearFavorites } = useFavorites();
  const { t, lang } = useLanguage();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({ visible: false, title: "", message: "", confirmLabel: "", onConfirm: () => {} });

  const hideConfirm = () => setConfirmModal((p) => ({ ...p, visible: false }));

  const handleLogout = () => {
    setConfirmModal({
      visible: true,
      title: t.signOut,
      message: t.areYouSureSignOut,
      confirmLabel: t.signOut,
      onConfirm: async () => {
        hideConfirm();
        await logout();
        clearCart();
        clearFavorites();
        router.replace("/auth");
      },
    });
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      visible: true,
      title: t.deleteAccountTitle,
      message: t.deleteAccountMsg,
      confirmLabel: t.deleteAccountConfirm,
      onConfirm: async () => {
        hideConfirm();
        try {
          const res = await fetch(`${API_URL}/api/users/me`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            await logout();
            clearCart();
            clearFavorites();
            router.replace("/auth");
          }
        } catch {}
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom }}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={[colors.headerBackground, colors.navyMid ?? colors.headerBackground] as any}
          style={[styles.profileHeader, { paddingTop: topPadding + 12 }]}
        >
          {isAuthenticated && user ? (
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={["#1A6FA8", "#0FBCD4"]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userPhone}>{user.phone}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.authSection}>
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={70}
                color="rgba(255,255,255,0.6)"
              />
              <Pressable
                onPress={() => router.push("/auth")}
                style={styles.signInBtn}
              >
                <Text style={styles.signInBtnText}>{t.signInRegister}</Text>
              </Pressable>
            </View>
          )}

          {/* Loyalty Points */}
          {isAuthenticated && user && (
            <View style={styles.loyaltyCard}>
              <View style={styles.loyaltyLeft}>
                <Ionicons name="star" size={18} color="#D4AF37" />
                <View>
                  <Text style={styles.loyaltyPoints}>{user.loyaltyPoints}</Text>
                  <Text style={styles.loyaltyLabel}>{t.loyaltyPoints}</Text>
                </View>
              </View>
              <Text style={styles.loyaltyValue}>
                {t.worth} {((user.loyaltyPoints || 0) * 0.1).toFixed(0)}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Account Section */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {t.account}
            </Text>
            <View style={[styles.menuGroup, { backgroundColor: colors.surface }]}>
              <MenuItem
                icon={<Ionicons name="person" size={18} color={colors.primary} />}
                label={t.personalInformation}
                onPress={() => router.push("/settings/profile")}
                color={colors.primary}
              />
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <MenuItem
                icon={<Ionicons name="location" size={18} color={colors.accent} />}
                label={t.savedAddresses}
                onPress={() => router.push("/settings/addresses")}
                color={colors.accent}
              />
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <MenuItem
                icon={<MaterialCommunityIcons name="heart" size={18} color="#E8604C" />}
                label={t.favorites}
                onPress={() => router.push("/settings/favorites")}
                color="#E8604C"
              />
            </View>
          </View>
        )}

        {/* Orders Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            {t.orders.toUpperCase()}
          </Text>
          <View style={[styles.menuGroup, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={<Ionicons name="receipt" size={18} color={colors.primary} />}
              label={t.orderHistory}
              onPress={() => router.push("/(tabs)/orders")}
              color={colors.primary}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <MenuItem
              icon={<Ionicons name="card" size={18} color="#27AE60" />}
              label={t.paymentMethods}
              onPress={() => router.push("/settings/payment-methods")}
              color="#27AE60"
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <MenuItem
              icon={<MaterialCommunityIcons name="ticket-percent" size={18} color="#D4AF37" />}
              label={t.promoCodes}
              onPress={() => router.push("/settings/promo-codes")}
              color="#D4AF37"
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            {t.preferences}
          </Text>
          <View style={[styles.menuGroup, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={<Ionicons name={isDark ? "moon" : "sunny"} size={18} color="#D4AF37" />}
              label={t.darkMode}
              color="#D4AF37"
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={isDark ? "#fff" : "#fff"}
                />
              }
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <MenuItem
              icon={<Ionicons name="language" size={18} color={colors.primary} />}
              label={t.language}
              value={["English","العربية","Français","Deutsch"][["en","ar","fr","de"].indexOf(lang)] ?? "English"}
              onPress={() => router.push("/settings/language")}
              color={colors.primary}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <MenuItem
              icon={<Ionicons name="notifications" size={18} color={colors.accent} />}
              label={t.notifications}
              onPress={() => router.push("/settings/notifications")}
              color={colors.accent}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            {t.support}
          </Text>
          <View style={[styles.menuGroup, { backgroundColor: colors.surface }]}>
            <MenuItem
              icon={<Ionicons name="help-circle" size={18} color={colors.primary} />}
              label={t.helpCenter}
              onPress={() => router.push("/settings/help")}
              color={colors.primary}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <MenuItem
              icon={<Ionicons name="chatbubble" size={18} color="#27AE60" />}
              label={t.contactUs}
              onPress={() => router.push("/settings/contact")}
              color="#27AE60"
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <MenuItem
              icon={<Ionicons name="information-circle" size={18} color={colors.textMuted} />}
              label={t.aboutSeaGull}
              onPress={() => router.push("/settings/about")}
              color={colors.textMuted}
            />
          </View>
        </View>

        {/* Sign Out + Delete Account */}
        {isAuthenticated && (
          <View style={[styles.section, { marginTop: 4, gap: 10 }]}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                { backgroundColor: `#E8604C${pressed ? "30" : "18"}` },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="#E8604C" />
              <Text style={styles.logoutText}>{t.signOut}</Text>
            </Pressable>
            <Pressable
              onPress={handleDeleteAccount}
              style={({ pressed }) => [
                styles.deleteButton,
                { backgroundColor: `#7F1D1D${pressed ? "40" : "20"}`, borderColor: `#EF444460` },
              ]}
            >
              <MaterialCommunityIcons name="delete-forever-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteText}>{t.deleteAccount}</Text>
            </Pressable>
          </View>
        )}

        <Text style={[styles.version, { color: colors.textMuted }]}>
          {t.version}
        </Text>
      </ScrollView>

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={t.cancel}
        onConfirm={confirmModal.onConfirm}
        onCancel={hideConfirm}
        destructive
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  avatarContainer: {
    shadowColor: "#0FBCD4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  userPhone: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  authSection: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  signInBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  signInBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  loyaltyCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loyaltyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loyaltyPoints: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#D4AF37",
  },
  loyaltyLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  loyaltyValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuGroup: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  menuValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginRight: 8,
  },
  separator: {
    height: 1,
    marginLeft: 62,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  logoutText: {
    color: "#E8604C",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
  },
  deleteText: {
    color: "#EF4444",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 20,
    marginBottom: 8,
  },
});
