import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useGetProduct } from "@workspace/api-client-react";
import { getLocalizedName, getLocalizedDesc } from "@/utils/localize";

const { width, height } = Dimensions.get("window");

function useSpiceLabels() {
  const { t } = useLanguage();
  return {
    none: t.spiceNone,
    mild: t.spiceMild,
    medium: t.spiceMedium,
    hot: t.spiceHot,
    extra_hot: t.spiceExtraHot,
  } as Record<string, string>;
}

const SPICE_COLORS: Record<string, string> = {
  none: "#27AE60",
  mild: "#F39C12",
  medium: "#E67E22",
  hot: "#E74C3C",
  extra_hot: "#C0392B",
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const SPICE_LABELS = useSpiceLabels();
  const { addItem, setBranchId } = useCart();
  const insets = useSafeAreaInsets();
  const { data: product, isLoading } = useGetProduct(Number(id));

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const basePrice = product
    ? parseFloat(product.discountedPrice ?? product.price) || 0
    : 0;

  const selectedVariantObj = (product as any)?.variants?.find(
    (v: any) => v.id === selectedVariant
  );

  const addOnsTotal = selectedAddOns.reduce((sum, aoId) => {
    const ao = (product as any)?.addOns?.find((a: any) => a.id === aoId);
    return sum + (ao ? parseFloat(ao.price) || 0 : 0);
  }, 0);

  const variantDiff = selectedVariantObj
    ? parseFloat(selectedVariantObj.priceDiff ?? "0") || 0
    : 0;
  const unitPrice = basePrice + variantDiff + addOnsTotal;
  const total = unitPrice * quantity;

  const toggleAddOn = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const addOnsData = selectedAddOns
      .map((aoId) => {
        const ao = (product as any)?.addOns?.find((a: any) => a.id === aoId);
        return ao ? { id: ao.id, name: ao.name, price: parseFloat(ao.price) || 0 } : null;
      })
      .filter(Boolean) as { id: number; name: string; price: number }[];

    setBranchId(1);
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: undefined,
      price: basePrice + variantDiff,
      quantity,
      variantName: selectedVariantObj?.name,
      addOns: addOnsData,
      specialInstructions: specialInstructions || undefined,
    });

    router.back();
  };

  if (isLoading || !product) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="fish" size={60} color={colors.textMuted} />
      </View>
    );
  }

  const spiceColor = SPICE_COLORS[product.spiceLevel ?? "none"] ?? "#27AE60";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Product Header */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{
                uri: product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : `https://${process.env.EXPO_PUBLIC_DOMAIN}${product.imageUrl}`,
              }}
              style={styles.productImage}
              contentFit="cover"
              cachePolicy="none"
            />
          ) : (
            <LinearGradient
              colors={[colors.headerBackground, colors.primary] as any}
              style={styles.productImage}
            />
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.imageOverlay}
          />

          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { top: Platform.OS === "web" ? 67 : insets.top + 8 }]}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          {/* Badges */}
          <View style={styles.imageBadges}>
            {product.isBestSeller && (
              <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.badgeText}>{t.bestSellers}</Text>
              </View>
            )}
            {product.isNew && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={styles.badgeText}>{t.badgeNew}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={[styles.productName, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
                {getLocalizedName(product, lang)}
              </Text>
            </View>
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="star" size={14} color={colors.gold} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {product.rating} ({product.reviewCount})
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {product.prepTime} min
              </Text>
            </View>
            {product.calories && (
              <View style={[styles.metaChip, { backgroundColor: `${colors.primary}15` }]}>
                <MaterialCommunityIcons name="fire" size={14} color="#E67E22" />
                <Text style={[styles.metaText, { color: colors.text }]}>
                  {product.calories} kcal
                </Text>
              </View>
            )}
            <View style={[styles.metaChip, { backgroundColor: `${spiceColor}15` }]}>
              <MaterialCommunityIcons name="chili-mild" size={14} color={spiceColor} />
              <Text style={[styles.metaText, { color: spiceColor }]}>
                {SPICE_LABELS[product.spiceLevel ?? "none"]}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary, textAlign: isRTL ? "right" : "left" }]}>
            {getLocalizedDesc(product, lang)}
          </Text>

          {/* Variants */}
          {(product as any)?.variants?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
                {t.preparationStyle}
              </Text>
              <View style={styles.variantsRow}>
                {(product as any).variants.map((v: any) => {
                  const isSelected = selectedVariant === v.id ||
                    (selectedVariant === null && v.isDefault);
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedVariant(v.id);
                      }}
                      style={[
                        styles.variantChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.variantText,
                          { color: isSelected ? "#fff" : colors.text },
                        ]}
                      >
                        {getLocalizedName(v, lang)}
                      </Text>
                      {parseFloat(v.priceDiff ?? "0") > 0 && (
                        <Text
                          style={[
                            styles.variantPrice,
                            { color: isSelected ? "rgba(255,255,255,0.8)" : colors.textMuted },
                          ]}
                        >
                          +EGP {(parseFloat(v.priceDiff) || 0).toFixed(0)}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Add-ons */}
          {(product as any)?.addOns?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
                {t.addOnsLabel}
              </Text>
              {(product as any).addOns.map((ao: any) => (
                <Pressable
                  key={ao.id}
                  onPress={() => toggleAddOn(ao.id)}
                  style={[
                    styles.addOnRow,
                    { backgroundColor: colors.surface, borderColor: selectedAddOns.includes(ao.id) ? colors.primary : colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.addOnCheck,
                      {
                        backgroundColor: selectedAddOns.includes(ao.id)
                          ? colors.primary
                          : "transparent",
                        borderColor: selectedAddOns.includes(ao.id)
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    {selectedAddOns.includes(ao.id) && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={[styles.addOnName, { color: colors.text }]}>
                    {getLocalizedName(ao, lang)}
                  </Text>
                  <Text style={[styles.addOnPrice, { color: colors.primary }]}>
                    +EGP {(parseFloat(ao.price) || 0).toFixed(0)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Ingredients/Allergens */}
          {(product as any)?.ingredients && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
                {t.ingredientsLabel}
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary, textAlign: isRTL ? "right" : "left" }]}>
                {(product as any).ingredients}
              </Text>
            </View>
          )}
          {(product as any)?.allergens && (
            <View style={[styles.allergenBox, { backgroundColor: `#E8604C18`, borderColor: "#E8604C30" }]}>
              <Ionicons name="warning" size={16} color="#E8604C" />
              <Text style={styles.allergenText}>
                {t.allergensLabel}: {(product as any).allergens}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 12,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.quantitySection}>
          <Pressable
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={[styles.qtyBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
          <Pressable
            onPress={() => setQuantity(quantity + 1)}
            style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </View>

        <Animated.View style={[styles.addButton, animStyle]}>
          <Pressable
            onPress={handleAddToCart}
            style={styles.addButtonInner}
          >
            <LinearGradient
              colors={["#1A6FA8", "#0A1628"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="cart" size={18} color="#fff" />
              <Text style={styles.addButtonText}>{t.addToCart}</Text>
              <Text style={styles.addButtonPrice}>EGP {total.toFixed(0)}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  productImage: {
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageBadges: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleLeft: { flex: 1 },
  productName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  productNameAr: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  variantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  variantChip: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  variantText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  variantPrice: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addOnRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  addOnCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  addOnName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  addOnPrice: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  allergenBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  allergenText: {
    color: "#E8604C",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    minWidth: 24,
    textAlign: "center",
  },
  addButton: {
    flex: 1,
  },
  addButtonInner: {
    borderRadius: 14,
    overflow: "hidden",
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    flex: 1,
  },
  addButtonPrice: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
});
