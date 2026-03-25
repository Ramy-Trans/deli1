import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useLanguage } from "@/context/LanguageContext";
import { useGetProducts, useGetCategories } from "@workspace/api-client-react";
import { getLocalizedName, getLocalizedDesc } from "@/utils/localize";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LocationPickerModal from "@/components/LocationPickerModal";

const { width } = Dimensions.get("window");

function useHeroPromos() {
  const { t } = useLanguage();
  return [
    { id: "1", title: t.promo1Title, subtitle: t.promo1Sub, gradient: ["#0A1628", "#1A6FA8"] as const },
    { id: "2", title: t.promo2Title, subtitle: t.promo2Sub, gradient: ["#122848", "#0FBCD4"] as const },
    { id: "3", title: t.promo3Title, subtitle: t.promo3Sub, gradient: ["#0D1F3C", "#1A6FA8"] as const },
  ];
}

function HeroBanner() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const HERO_PROMOS = useHeroPromos();
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.heroContainer}>
      <FlatList
        ref={scrollRef}
        data={HERO_PROMOS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / (width - 32)));
        }}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, { width: width - 32 }]}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{t.limitedOffer}</Text>
              </View>
              <Text style={styles.heroTitle}>{item.title}</Text>
              <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
              <Pressable
                style={styles.heroButton}
                onPress={() => router.push("/(tabs)/menu")}
              >
                <Text style={styles.heroButtonText}>{t.orderNow}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>
            </View>
            <MaterialCommunityIcons
              name="fish"
              size={90}
              color="rgba(255,255,255,0.1)"
              style={styles.heroBgIcon}
            />
          </LinearGradient>
        )}
        keyExtractor={(i) => i.id}
      />
      <View style={styles.dotsContainer}>
        {HERO_PROMOS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeIdx ? colors.primary : colors.border,
                width: i === activeIdx ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

interface AnimatedProductCardProps {
  product: any;
  index: number;
}

function AnimatedProductCard({ product, index }: AnimatedProductCardProps) {
  const { colors } = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const { addItem, setBranchId } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const scale = useSharedValue(1);
  const [imgError, setImgError] = useState(false);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    router.push({ pathname: "/product/[id]", params: { id: product.id } });
  };

  const handleAddToCart = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
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
  const discountedPrice = product.discountedPrice
    ? parseFloat(product.discountedPrice) || 0
    : null;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(300)}
      style={animStyle}
    >
      <Pressable
        onPress={handlePress}
        style={[styles.productCard, { backgroundColor: colors.surface }]}
      >
        <View style={styles.productImageContainer}>
          {product.imageUrl && !imgError ? (
            <Image
              source={{
                uri: product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : `https://${process.env.EXPO_PUBLIC_DOMAIN}${product.imageUrl}`,
              }}
              style={styles.productImage}
              contentFit="cover"
              cachePolicy="none"
              onError={() => setImgError(true)}
            />
          ) : (
            <LinearGradient
              colors={["#0A2040", "#1A6FA8"]}
              style={styles.productImage}
            />
          )}
          {product.isBestSeller && (
            <View style={[styles.productBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.productBadgeText}>{t.bestSellers}</Text>
            </View>
          )}
          {product.isNew && (
            <View
              style={[styles.productBadge, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.productBadgeText}>{t.badgeNew}</Text>
            </View>
          )}
          {discountedPrice && (
            <View
              style={[styles.discountBadge, { backgroundColor: colors.error }]}
            >
              <Text style={styles.discountBadgeText}>
                {Math.round(((price - discountedPrice) / price) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text
            style={[styles.productName, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}
            numberOfLines={2}
          >
            {getLocalizedName(product, lang)}
          </Text>

          <View style={styles.productMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.gold} />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {(4.1 + (product.id % 9) * 0.1).toFixed(1)}
              </Text>
            </View>
            <View style={styles.prepTimeRow}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.prepTimeText, { color: colors.textMuted }]}>
                {product.prepTime}m
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.price, { color: colors.primary }]}>
                EGP {discountedPrice?.toFixed(0) ?? price.toFixed(0)}
              </Text>
              {discountedPrice && (
                <Text style={[styles.oldPrice, { color: colors.textMuted }]}>
                  EGP {price.toFixed(0)}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
              <Pressable
                onPress={() => toggleFavorite(product.id)}
                style={[styles.heartBtn, { borderColor: isFavorite(product.id) ? "#EF4444" : colors.border }]}
              >
                <MaterialCommunityIcons
                  name={isFavorite(product.id) ? "heart" : "heart-outline"}
                  size={16}
                  color={isFavorite(product.id) ? "#EF4444" : colors.textMuted}
                />
              </Pressable>
              <Pressable
                onPress={handleAddToCart}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const insets = useSafeAreaInsets();

  const [savedAddress, setSavedAddress] = useState<string>("");
  const [savedLat, setSavedLat] = useState<number | null>(null);
  const [savedLng, setSavedLng] = useState<number | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [nearestBranch, setNearestBranch] = useState<string>("");

  function computeNearestBranch(lat: number, lng: number): string {
    const BRANCHES = [
      { name: "Fifth Settlement", lat: 30.0131, lng: 31.4703 },
      { name: "Sheikh Zayed", lat: 30.0622, lng: 30.9408 },
      { name: "Madinaty", lat: 30.1243, lng: 31.6366 },
    ];
    let nearest = BRANCHES[0];
    let minDist = Infinity;
    for (const b of BRANCHES) {
      const d = Math.sqrt((lat - b.lat) ** 2 + (lng - b.lng) ** 2);
      if (d < minDist) { minDist = d; nearest = b; }
    }
    return nearest.name;
  }

  useEffect(() => {
    (async () => {
      try {
        const addr = await AsyncStorage.getItem("@delivery_address");
        const lat = await AsyncStorage.getItem("@delivery_lat");
        const lng = await AsyncStorage.getItem("@delivery_lng");
        if (addr) setSavedAddress(addr);
        if (lat) setSavedLat(parseFloat(lat));
        if (lng) setSavedLng(parseFloat(lng));
        if (lat && lng) setNearestBranch(computeNearestBranch(parseFloat(lat), parseFloat(lng)));
      } catch {}
    })();
  }, []);

  const handleLocationAssign = async (address: string, lat: number, lng: number) => {
    setSavedAddress(address);
    setSavedLat(lat);
    setSavedLng(lng);
    setNearestBranch(computeNearestBranch(lat, lng));
    try {
      await AsyncStorage.setItem("@delivery_address", address);
      await AsyncStorage.setItem("@delivery_lat", String(lat));
      await AsyncStorage.setItem("@delivery_lng", String(lng));
    } catch {}
  };

  const { data: featured, isLoading: featuredLoading } = useGetProducts({
    featured: true,
  });
  const { data: bestSellers } = useGetProducts({ bestSeller: true });
  const { data: categories } = useGetCategories();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.headerBackground, colors.navyMid ?? colors.headerBackground] as any}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <View style={[styles.headerContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.headerLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <View>
              <Text style={[styles.headerGreeting, { textAlign: isRTL ? "right" : "left" }]}>
                {t.welcome}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
              </Text>
              <Pressable
                onPress={() => setShowLocationPicker(true)}
                style={[styles.locationRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}
                hitSlop={8}
              >
                <Ionicons name="location" size={12} color="#0FBCD4" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {savedAddress || t.cairoEgypt}
                </Text>
                <Ionicons name="chevron-down" size={10} color="#0FBCD4" style={{ marginLeft: 2 }} />
              </Pressable>
              {nearestBranch ? (
                <View style={styles.branchChip}>
                  <MaterialCommunityIcons name="store" size={9} color="#D4AF37" />
                  <Text style={styles.branchChipText}>{nearestBranch} Branch</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => router.push("/(tabs)/cart")}
              style={styles.cartButton}
            >
              <Ionicons name="cart-outline" size={24} color="#fff" />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable
          onPress={() => router.push("/(tabs)/menu")}
          style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.12)" }]}
        >
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
          <Text style={styles.searchPlaceholder}>{t.searchPlaceholder}</Text>
          <View style={styles.filterBadge}>
            <Ionicons name="options" size={16} color={colors.primary} />
          </View>
        </Pressable>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom },
        ]}
      >
        {/* Hero Banner */}
        <HeroBanner />

        {/* Quick Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t.browseMenu}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesRow}>
              {categories?.slice(0, 8).map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/menu",
                      params: { categoryId: cat.id },
                    })
                  }
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: `${colors.primary}18` },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any ?? "fish"}
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {getLocalizedName(cat, lang)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.featured}
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/menu")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {t.viewAll}
              </Text>
            </Pressable>
          </View>
          {featuredLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={featured?.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(p) => `featured-${p.id}`}
              contentContainerStyle={{ paddingRight: 16 }}
              renderItem={({ item, index }) => (
                <View style={{ width: 180, marginRight: 12 }}>
                  <AnimatedProductCard product={item} index={index} />
                </View>
              )}
            />
          )}
        </View>

        {/* Best Sellers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.bestSellers}
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/menu")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {t.viewAll}
              </Text>
            </Pressable>
          </View>
          <View style={styles.productsGrid}>
            {bestSellers?.slice(0, 4).map((product, index) => (
              <View key={product.id} style={styles.gridItem}>
                <AnimatedProductCard product={product} index={index} />
              </View>
            ))}
          </View>
        </View>

        {/* Promo Banner */}
        <Pressable
          onPress={() => router.push("/(tabs)/menu")}
          style={styles.promoBanner}
        >
          <LinearGradient
            colors={["#0A1628", "#122848"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Family Seafood Feast</Text>
              <Text style={styles.promoSubtitle}>Serves 4-6 • EGP 895</Text>
              <View style={styles.promoButton}>
                <Text style={styles.promoButtonText}>Order Now</Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="fish"
              size={80}
              color="rgba(255,255,255,0.15)"
              style={{ position: "absolute", right: 20, top: 10 }}
            />
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onAssign={handleLocationAssign}
        initialLat={savedLat}
        initialLng={savedLng}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerGreeting: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    maxWidth: 140,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#E8604C",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  filterBadge: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: 12,
  },
  heroContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    height: 160,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 14,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  heroBgIcon: {
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 16,
  },
  categoryChip: {
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    width: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: (width - 44) / 2,
  },
  productCard: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  productImageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 140,
  },
  productImagePlaceholder: {
    width: "100%",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  productBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    lineHeight: 18,
    height: 36,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  prepTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  prepTimeText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  oldPrice: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  heartBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  promoBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
  },
  promoGradient: {
    padding: 20,
    height: 120,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  promoContent: {
    zIndex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: "#1A6FA8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  promoButtonText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  branchChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
    backgroundColor: "rgba(212,175,55,0.15)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: "flex-start",
    borderWidth: 0.5,
    borderColor: "rgba(212,175,55,0.4)",
  },
  branchChipText: {
    color: "#D4AF37",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
});
