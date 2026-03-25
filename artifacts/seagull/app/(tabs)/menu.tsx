import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useLanguage } from "@/context/LanguageContext";
import { useGetProducts, useGetCategories } from "@workspace/api-client-react";
import { getLocalizedName, getLocalizedDesc } from "@/utils/localize";

const { width } = Dimensions.get("window");

function useFilters() {
  const { t } = useLanguage();
  return [
    { key: "all", label: t.all },
    { key: "featured", label: t.featured },
    { key: "bestSeller", label: t.bestSellers },
    { key: "vegetarian", label: t.filterVegetarian },
    { key: "healthy", label: t.filterHealthy },
  ];
}

interface ProductRowItemProps {
  product: any;
  index: number;
}

function ProductRowItem({ product, index }: ProductRowItemProps) {
  const { colors } = useTheme();
  const { lang, isRTL } = useLanguage();
  const { addItem, setBranchId } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleAddToCart = () => {
    setBranchId(1);
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: undefined,
      price: parseFloat(product.discountedPrice ?? product.price) || 0,
      quantity: 1,
      addOns: [],
    });
  };

  const price = parseFloat(product.price) || 0;
  const discountedPrice = product.discountedPrice ? parseFloat(product.discountedPrice) || 0 : null;

  return (
    <Animated.View entering={FadeIn.delay(index * 40).duration(250)}>
      <Pressable
        onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
        style={[styles.productRow, { backgroundColor: colors.surface }]}
      >
        {product.imageUrl ? (
          <Image
            source={{
              uri: product.imageUrl.startsWith("http")
                ? product.imageUrl
                : `https://${process.env.EXPO_PUBLIC_DOMAIN}${product.imageUrl}`,
            }}
            style={styles.rowImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            priority="normal"
          />
        ) : (
          <LinearGradient
            colors={["#0A2040", "#1A6FA8"]}
            style={styles.rowImage}
          />
        )}
        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, { color: colors.text, textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
            {getLocalizedName(product, lang)}
          </Text>
          <Text style={[styles.rowDesc, { color: colors.textMuted, textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>
            {getLocalizedDesc(product, lang)}
          </Text>
          <View style={styles.rowMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.gold} />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {(4.1 + (product.id % 9) * 0.1).toFixed(1)}
              </Text>
            </View>
            {product.prepTime != null && (
              <Text style={[styles.prepTimeText, { color: colors.textMuted }]}>
                {product.prepTime}m
              </Text>
            )}
          </View>
          <View style={styles.rowPriceRow}>
            <Text style={[styles.rowPrice, { color: colors.primary }]}>
              EGP {discountedPrice?.toFixed(0) ?? price.toFixed(0)}
            </Text>
            {discountedPrice && (
              <Text style={[styles.rowOldPrice, { color: colors.textMuted }]}>
                EGP {price.toFixed(0)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rowButtons}>
          <Pressable
            onPress={() => toggleFavorite(product.id)}
            style={[styles.heartButton, { borderColor: isFavorite(product.id) ? "#EF4444" : colors.border }]}
          >
            <MaterialCommunityIcons
              name={isFavorite(product.id) ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite(product.id) ? "#EF4444" : colors.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={handleAddToCart}
            style={[styles.rowAddButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MenuScreen() {
  const { colors, isDark } = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId?: string }>();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId) : null
  );
  const FILTERS = useFilters();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (params.categoryId) {
      setSelectedCategory(parseInt(params.categoryId));
    }
  }, [params.categoryId]);

  const { data: categories } = useGetCategories();
  const { data: products, isLoading } = useGetProducts({
    categoryId: selectedCategory ?? undefined,
    search: searchText || undefined,
    featured: activeFilter === "featured" ? true : undefined,
    bestSeller: activeFilter === "bestSeller" ? true : undefined,
    vegetarian: activeFilter === "vegetarian" ? true : undefined,
    healthy: activeFilter === "healthy" ? true : undefined,
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.headerBackground, colors.headerBackground]}
        style={[styles.header, { paddingTop: topPadding + 8 }]}
      >
        <Text style={styles.headerTitle}>{t.ourMenu}</Text>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
            </Pressable>
          )}
        </View>

        {/* Filter chips */}
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f.key}
          contentContainerStyle={styles.filtersRow}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setActiveFilter(item.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === item.key
                      ? colors.primary
                      : "rgba(255,255,255,0.12)",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      activeFilter === item.key ? "#fff" : "rgba(255,255,255,0.7)",
                  },
                ]}
              >
                {item.key === "all" ? t.all
                  : item.key === "featured" ? t.featured
                  : item.key === "bestSeller" ? t.bestSellers
                  : item.label}
              </Text>
            </Pressable>
          )}
        />
      </LinearGradient>

      {/* Category tabs */}
      <View style={[styles.categoryTabs, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        <FlatList
          data={[{ id: null, name: "All", nameAr: null, icon: "menu" }, ...(categories ?? [])]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => `cat-${c.id ?? "all"}`}
          contentContainerStyle={styles.categoryTabsContent}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <Pressable
                onPress={() => setSelectedCategory(item.id as number | null)}
                style={[
                  styles.categoryTab,
                  isSelected && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                ]}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isSelected ? colors.primary : colors.textMuted },
                  ]}
                >
                  {item.id === null ? t.allCategories : getLocalizedName(item, lang)}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Products list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {t.loadingMenu}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => `product-${p.id}`}
          contentContainerStyle={[
            styles.productsList,
            { paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom },
          ]}
          removeClippedSubviews={Platform.OS !== "web"}
          maxToRenderPerBatch={8}
          windowSize={5}
          initialNumToRender={8}
          updateCellsBatchingPeriod={50}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="fish-off" size={60} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No dishes found
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <ProductRowItem product={item} index={index} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  filtersRow: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  categoryTabs: {
    borderBottomWidth: 1,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  categoryTabText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  productsList: {
    padding: 16,
    gap: 12,
  },
  productRow: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  rowImage: {
    width: 110,
    height: 110,
  },
  rowInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  rowName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
    lineHeight: 20,
  },
  rowDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  prepTimeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  rowPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowPrice: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  rowOldPrice: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
  },
  rowButtons: {
    flexDirection: "column",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 8,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  rowAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
});
