import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useGetOrders } from "@workspace/api-client-react";

const STATUS_COLORS: Record<string, string> = {
  placed: "#1A6FA8",
  payment_pending: "#D4AF37",
  payment_confirmed: "#27AE60",
  accepted: "#27AE60",
  preparing: "#0FBCD4",
  packed: "#0FBCD4",
  waiting_rider: "#D4AF37",
  rider_assigned: "#1A6FA8",
  picked_up: "#1A6FA8",
  on_the_way: "#1A6FA8",
  near_customer: "#0FBCD4",
  arrived: "#27AE60",
  delivered: "#27AE60",
  completed: "#27AE60",
  cancelled: "#E8604C",
  failed_delivery: "#E8604C",
  refund_pending: "#D4AF37",
  refunded: "#27AE60",
};

function getStatusLabel(status: string, t: ReturnType<typeof useLanguage>["t"]): string {
  const map: Record<string, string> = {
    placed: t.orderPlaced,
    payment_pending: t.paymentPending,
    payment_confirmed: t.paymentConfirmed,
    accepted: t.accepted,
    preparing: t.preparing,
    packed: t.packed,
    waiting_rider: t.waitingRider,
    rider_assigned: t.riderAssigned,
    rider_heading_restaurant: t.riderAssigned,
    rider_arrived_restaurant: t.riderAssigned,
    picked_up: t.pickedUp,
    on_the_way: t.onTheWay,
    near_customer: t.nearCustomer,
    arrived: t.arrived,
    delivered: t.delivered,
    completed: t.completed,
    cancelled: t.cancelled,
    failed_delivery: t.deliveryFailed,
    refund_pending: t.refundPending,
    refunded: t.refunded,
  };
  return map[status] ?? status;
}

function OrderCard({ order, index }: { order: any; index: number }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const statusColor = STATUS_COLORS[order.status] ?? colors.primary;
  const statusLabel = getStatusLabel(order.status, t);
  const isActive = !["completed", "cancelled", "refunded", "failed_delivery"].includes(order.status);

  return (
    <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
      <Pressable
        onPress={() => router.push({ pathname: "/order/[id]", params: { id: order.id } })}
        style={[styles.orderCard, { backgroundColor: colors.surface }]}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderNumber, { color: colors.text }]}>
              {order.orderNumber}
            </Text>
            <Text style={[styles.orderDate, { color: colors.textMuted }]}>
              {new Date(order.createdAt).toLocaleDateString("en-EG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.orderItems}>
          {order.items?.slice(0, 2).map((item: any) => (
            <Text
              key={item.id}
              style={[styles.itemText, { color: colors.textSecondary }]}
            >
              {item.quantity}x {item.productName}
            </Text>
          ))}
          {order.items?.length > 2 && (
            <Text style={[styles.moreItems, { color: colors.textMuted }]}>
              +{order.items.length - 2} {t.moreItems}
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={[styles.orderTotal, { color: colors.primary }]}>
            EGP {(parseFloat(order.total) || 0).toFixed(0)}
          </Text>
          <View style={styles.orderActions}>
            {isActive && (
              <View style={[styles.trackButton, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="navigate" size={14} color={colors.primary} />
                <Text style={[styles.trackText, { color: colors.primary }]}>{t.track}</Text>
              </View>
            )}
            <View style={[styles.reorderButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="reload" size={14} color="#fff" />
              <Text style={styles.reorderText}>{t.reorder}</Text>
            </View>
          </View>
        </View>

        {isActive && (
          <View style={[styles.activeIndicator, { backgroundColor: statusColor }]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: orders, isLoading, refetch } = useGetOrders({
    query: { enabled: isAuthenticated, staleTime: 0 },
  });

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetch();
      }
    }, [isAuthenticated, refetch])
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding + 20 }]}>
        <Text style={[styles.headerTitle, { color: colors.text, paddingHorizontal: 20, marginBottom: 40 }]}>
          {t.orders}
        </Text>
        <View style={styles.authContainer}>
          <LinearGradient
            colors={[colors.surface, colors.surfaceSecondary]}
            style={styles.authCircle}
          >
            <Ionicons name="receipt-outline" size={60} color={colors.textMuted} />
          </LinearGradient>
          <Text style={[styles.authTitle, { color: colors.text }]}>
            {t.signInToSeeOrders}
          </Text>
          <Text style={[styles.authSubtitle, { color: colors.textMuted }]}>
            {t.keepTrack}
          </Text>
          <Pressable
            onPress={() => router.push("/auth")}
            style={[styles.signInButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.signInText}>{t.signIn}</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.myOrders}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => `order-${o.id}`}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="shopping-outline"
                size={70}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No orders yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Your order history will appear here
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/menu")}
                style={[styles.orderNowBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.orderNowText}>Order Now</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }) => (
            <OrderCard order={item} index={index} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
    position: "relative",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  orderDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  orderItems: {
    gap: 3,
    marginBottom: 12,
  },
  itemText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  moreItems: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  orderActions: {
    flexDirection: "row",
    gap: 8,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  trackText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  reorderText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  authContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  authCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  authTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  signInButton: {
    borderRadius: 14,
    paddingHorizontal: 48,
    paddingVertical: 14,
    marginTop: 8,
  },
  signInText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 14,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  orderNowBtn: {
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  orderNowText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
