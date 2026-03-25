import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeOutRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import * as Haptics from "expo-haptics";

const DELIVERY_FEE = 25;
const SERVICE_FEE = 10;
const TAX_RATE = 0.14;

export default function CartScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { items, subtotal, totalItems, removeItem, updateQuantity, clearCart } = useCart();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const serviceFee = items.length > 0 ? SERVICE_FEE : 0;
  const tax = (subtotal + deliveryFee) * TAX_RATE;
  const total = subtotal + deliveryFee + serviceFee + tax;

  const handleCheckout = () => {
    if (!items.length) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: colors.background, paddingTop: topPadding + 20 },
        ]}
      >
        <View style={styles.emptyHeader}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.myCart}</Text>
        </View>
        <View style={styles.emptyContent}>
          <LinearGradient
            colors={[colors.surface, colors.surfaceSecondary]}
            style={styles.emptyCircle}
          >
            <Ionicons name="cart-outline" size={60} color={colors.textMuted} />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t.emptyCart}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {t.exploreMenu}
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/menu")}
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.browseButtonText}>{t.browseMenu}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 8, backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t.myCart} ({totalItems})
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            clearCart();
          }}
        >
          <Text style={[styles.clearText, { color: colors.error }]}>{t.clearAll}</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 200 : 180 + insets.bottom }}
      >
        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 60)}
              exiting={FadeOutRight}
              style={[styles.cartItem, { backgroundColor: colors.surface }]}
            >
              <LinearGradient
                colors={[colors.navyDeep, colors.oceanBlue]}
                style={styles.itemImage}
              />

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                  {item.productName}
                </Text>
                {item.variantName && (
                  <Text style={[styles.itemVariant, { color: colors.textMuted }]}>
                    {item.variantName}
                  </Text>
                )}
                {(item.addOns ?? []).length > 0 && (
                  <Text style={[styles.itemAddons, { color: colors.textMuted }]} numberOfLines={1}>
                    + {(item.addOns ?? []).map((a) => a.name).join(", ")}
                  </Text>
                )}
                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                  EGP {(((item.price || 0) + (item.addOns ?? []).reduce((s, a) => s + (a.price || 0), 0)) * item.quantity).toFixed(0)}
                </Text>
              </View>

              <View style={styles.quantityControl}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updateQuantity(item.id, item.quantity - 1);
                  }}
                  style={[styles.qtyBtn, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <Ionicons
                    name={item.quantity === 1 ? "trash-outline" : "remove"}
                    size={16}
                    color={item.quantity === 1 ? colors.error : colors.text}
                  />
                </Pressable>
                <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updateQuantity(item.id, item.quantity + 1);
                  }}
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </Pressable>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>{t.orderSummary}</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.subtotal}</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>EGP {subtotal.toFixed(0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.deliveryFee}</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>EGP {deliveryFee}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.serviceFee}</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>EGP {serviceFee}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.taxLabel}</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>EGP {tax.toFixed(0)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t.total}</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              EGP {total.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Coupon */}
        <Pressable
          onPress={() => router.push("/checkout")}
          style={[styles.couponRow, { backgroundColor: colors.surface }]}
        >
          <View style={styles.couponLeft}>
            <Ionicons name="pricetag" size={20} color={colors.primary} />
            <Text style={[styles.couponText, { color: colors.text }]}>
              {t.applyPromo}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </ScrollView>

      {/* Checkout Button */}
      <View
        style={[
          styles.checkoutContainer,
          {
            backgroundColor: colors.surface,
            bottom: Platform.OS === "web" ? 84 : Platform.OS === "ios" ? insets.bottom + 49 : insets.bottom + 56,
            paddingBottom: 12,
          },
        ]}
      >
        <Pressable
          onPress={handleCheckout}
          style={styles.checkoutButton}
        >
          <LinearGradient
            colors={["#1A6FA8", "#0A1628"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutGradient}
          >
            <Text style={styles.checkoutText}>{t.proceedToCheckout}</Text>
            <View style={styles.checkoutTotal}>
              <Text style={styles.checkoutTotalText}>EGP {total.toFixed(0)}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1 },
  emptyHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  emptyCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  browseButton: {
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  clearText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  itemsContainer: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 0,
  },
  itemImage: {
    width: 90,
    height: 90,
  },
  itemInfo: {
    flex: 1,
    padding: 10,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  itemVariant: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  itemAddons: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  itemPrice: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 8,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  couponRow: {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  couponText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  checkoutContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  checkoutButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  checkoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  checkoutText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  checkoutTotal: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  checkoutTotalText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
});
