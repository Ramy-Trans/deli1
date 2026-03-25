import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

function CartBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return null;
}

function NativeTabLayout() {
  const { totalItems } = useCart();
  const { t } = useLanguage();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>{t.home}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="menu">
        <Icon sf={{ default: "fork.knife", selected: "fork.knife" }} />
        <Label>{t.menu}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart">
        <Icon sf={{ default: "cart", selected: "cart.fill" }} />
        <Label>{t.cart}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="orders">
        <Icon sf={{ default: "clock", selected: "clock.fill" }} />
        <Label>{t.orders}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>{t.profile}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const safeAreaInsets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? colors.surface : colors.white,
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: isWeb ? 0 : safeAreaInsets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark ? colors.surface : colors.white,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={24} />
            ) : (
              <Ionicons name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: t.menu,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="fork.knife" tintColor={color} size={24} />
            ) : (
              <MaterialCommunityIcons name="silverware-fork-knife" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t.cart,
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "cart.fill" : "cart"}
                tintColor={color}
                size={24}
              />
            ) : (
              <Ionicons
                name={focused ? "cart" : "cart-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t.orders,
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "clock.fill" : "clock"}
                tintColor={color}
                size={24}
              />
            ) : (
              <Ionicons
                name={focused ? "time" : "time-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "person.fill" : "person"}
                tintColor={color}
                size={24}
              />
            ) : (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  try {
    if (isLiquidGlassAvailable()) {
      return <NativeTabLayout />;
    }
  } catch {
    // expo-glass-effect not available in this Expo Go build
  }
  return <ClassicTabLayout />;
}
