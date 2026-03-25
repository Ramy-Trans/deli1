import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedName, getLocalizedDesc } from "@/utils/localize";

const API_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function FavoritesScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const { t, lang } = useLanguage();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (favorites.length === 0) { setProducts([]); setLoading(false); setRefreshing(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const all = await res.json();
        setProducts(all.filter((p: any) => favorites.includes(p.id)));
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [favorites]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: undefined,
      price: parseFloat(product.discountedPrice ?? product.price),
      quantity: 1,
      addOns: [],
    });
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color={colors.oceanBlue} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.myFavorites}</Text>
          {favorites.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{favorites.length}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {products.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="heart-off-outline" size={72} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.noFavorites}</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Tap the ❤️ on any dish to save it here for quick access
          </Text>
          <TouchableOpacity style={[styles.browseBtn, { backgroundColor: colors.oceanBlue }]} onPress={() => router.push("/(tabs)/menu")}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#fff" />
            <Text style={styles.browseBtnText}>{t.browseMenu}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} tintColor={colors.oceanBlue} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/product/${item.id}`)}
              activeOpacity={0.85}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl.startsWith("http") ? item.imageUrl : `https://${process.env.EXPO_PUBLIC_DOMAIN}${item.imageUrl}` }}
                  style={styles.cardImage}
                  contentFit="cover"
                  cachePolicy="none"
                />
              ) : (
                <LinearGradient
                  colors={["#0A2040", "#1A6FA8"]}
                  style={styles.cardImage}
                />
              )}
              <View style={styles.cardBody}>
                <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{getLocalizedName(item, lang)}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{getLocalizedDesc(item, lang)}</Text>
                <View style={styles.cardFooter}>
                  <View>
                    {item.discountedPrice && (
                      <Text style={[styles.cardOldPrice, { color: colors.textSecondary }]}>
                        EGP {parseFloat(item.price).toFixed(0)}
                      </Text>
                    )}
                    <Text style={[styles.cardPrice, { color: colors.gold }]}>
                      EGP {parseFloat(item.discountedPrice ?? item.price).toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.heartBtn, { borderColor: "#EF4444" }]}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <MaterialCommunityIcons name="heart" size={20} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.addBtn, { backgroundColor: colors.oceanBlue }]}
                      onPress={() => handleAddToCart(item)}
                    >
                      <MaterialCommunityIcons name="cart-plus" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: "#fff", fontSize: 18, fontWeight: "700" },
  countBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  emptyDesc: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  browseBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 },
  browseBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  card: { flexDirection: "row", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardImage: { width: 110, height: 110 },
  cardBody: { flex: 1, padding: 12, justifyContent: "space-between" },
  cardName: { fontSize: 15, fontWeight: "700" },
  cardDesc: { fontSize: 12, lineHeight: 16, flex: 1, marginVertical: 4 },
  cardFooter: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  cardOldPrice: { fontSize: 11, textDecorationLine: "line-through" },
  cardPrice: { fontSize: 15, fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 8 },
  heartBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
