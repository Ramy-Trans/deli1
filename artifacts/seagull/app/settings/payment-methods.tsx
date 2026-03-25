import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import ConfirmModal from "@/components/ConfirmModal";

interface PaymentCard {
  id: string;
  type: "visa";
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
}

const CARD_COLORS: Record<string, string[]> = {
  visa: ["#1A6FA8", "#0D4F7C"],
};

const PAYMENT_METHODS = [
  { id: "cash", icon: "cash", label: "Cash on Delivery", desc: "Pay when your order arrives", color: "#22C55E" },
  { id: "visa", icon: "credit-card", label: "Visa / Credit Card", desc: "Pay securely with your card", color: "#1A6FA8" },
];

function CardItem({ card, colors, onRemove, onSetDefault, t }: {
  card: PaymentCard; colors: any; onRemove: (id: string) => void; onSetDefault: (id: string) => void; t: any;
}) {
  const gradColors = CARD_COLORS[card.type] as [string, string];

  return (
    <View style={cStyles.wrapper}>
      <LinearGradient colors={gradColors} style={cStyles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={cStyles.cardTop}>
          <MaterialCommunityIcons name="credit-card" size={28} color="rgba(255,255,255,0.9)" />
          {card.isDefault && (
            <View style={cStyles.defaultChip}>
              <Text style={cStyles.defaultChipText}>{t.defaultLabel}</Text>
            </View>
          )}
        </View>
        <Text style={cStyles.cardNumber}>•••• •••• •••• {card.last4}</Text>
        <View style={cStyles.cardBottom}>
          <View>
            <Text style={cStyles.cardLabel}>{t.cardHolder}</Text>
            <Text style={cStyles.cardValue}>{card.holder}</Text>
          </View>
          <View>
            <Text style={cStyles.cardLabel}>{t.expiryLabel}</Text>
            <Text style={cStyles.cardValue}>{card.expiry}</Text>
          </View>
          <Text style={cStyles.networkLabel}>VISA</Text>
        </View>
      </LinearGradient>
      <View style={[cStyles.actions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {!card.isDefault && (
          <TouchableOpacity style={cStyles.actionBtn} onPress={() => onSetDefault(card.id)}>
            <MaterialCommunityIcons name="star-outline" size={16} color={colors.oceanBlue} />
            <Text style={[cStyles.actionText, { color: colors.oceanBlue }]}>{t.setDefault}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={cStyles.actionBtn} onPress={() => onRemove(card.id)}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#EF4444" />
          <Text style={[cStyles.actionText, { color: "#EF4444" }]}>{t.remove}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  card: { borderRadius: 18, padding: 20, height: 180 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  defaultChip: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  defaultChipText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  cardNumber: { color: "#fff", fontSize: 18, fontWeight: "600", letterSpacing: 3, marginBottom: 20 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardLabel: { color: "rgba(255,255,255,0.6)", fontSize: 10, marginBottom: 2 },
  cardValue: { color: "#fff", fontSize: 13, fontWeight: "600" },
  networkLabel: { color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: "800", fontStyle: "italic" },
  actions: { flexDirection: "row", borderRadius: 12, borderWidth: 1, marginTop: 8, overflow: "hidden" },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  actionText: { fontSize: 13, fontWeight: "600" },
});

export default function PaymentMethodsScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const { t } = useLanguage();

  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [removeCardId, setRemoveCardId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [formError, setFormError] = useState("");

  const doRemove = () => {
    if (!removeCardId) return;
    setCards((p) => p.filter((c) => c.id !== removeCardId));
    setRemoveCardId(null);
  };

  const handleSetDefault = (id: string) => {
    setCards((p) => p.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const formatCardNum = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleAddCard = () => {
    setFormError("");
    const digits = cardNum.replace(/\s/g, "");
    if (digits.length < 16) { setFormError(t.errorMsg); return; }
    if (cardExpiry.length < 5) { setFormError(t.errorMsg); return; }
    if (cardCvv.length < 3) { setFormError(t.errorMsg); return; }
    if (!cardHolder.trim()) { setFormError(t.errorMsg); return; }

    const type: "visa" = "visa";
    const newCard: PaymentCard = {
      id: Date.now().toString(),
      type,
      last4: digits.slice(-4),
      expiry: cardExpiry,
      holder: cardHolder.trim(),
      isDefault: cards.length === 0,
    };
    setCards((p) => [...p, newCard]);
    setShowAddModal(false);
    setCardNum(""); setCardExpiry(""); setCardCvv(""); setCardHolder("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ConfirmModal
        visible={removeCardId != null}
        title={t.removeCard}
        message={t.removeCardConfirm}
        confirmLabel={t.removeCard}
        cancelLabel={t.cancel}
        onConfirm={doRemove}
        onCancel={() => setRemoveCardId(null)}
        destructive
        colors={colors}
      />

      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.paymentMethods}</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
            <MaterialCommunityIcons name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {cards.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.savedCards.toUpperCase()}</Text>
            {cards.map((card) => (
              <CardItem key={card.id} card={card} colors={colors} onRemove={(id) => setRemoveCardId(id)} onSetDefault={handleSetDefault} t={t} />
            ))}
            <TouchableOpacity style={[styles.addNewBtn, { borderColor: colors.oceanBlue }]} onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={18} color={colors.oceanBlue} />
              <Text style={[styles.addNewText, { color: colors.oceanBlue }]}>{t.addCard}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PAYMENT OPTIONS</Text>
        <View style={[styles.methodsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {PAYMENT_METHODS.map((method, i) => (
            <View key={method.id}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <View style={styles.methodRow}>
                <View style={[styles.methodIcon, { backgroundColor: method.color + "20" }]}>
                  <MaterialCommunityIcons name={method.icon as any} size={22} color={method.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.methodName, { color: colors.text }]}>{method.label}</Text>
                  <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>{method.desc}</Text>
                </View>
                {method.id === "visa" ? (
                  <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    style={[styles.availBadge, { backgroundColor: "#1A6FA820" }]}
                  >
                    <Text style={[styles.availText, { color: "#1A6FA8" }]}>Add Card</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.availBadge, { backgroundColor: "#22C55E20" }]}>
                    <Text style={[styles.availText, { color: "#22C55E" }]}>Available</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.secureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#22C55E" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.secureTitle, { color: colors.text }]}>Secure Payments</Text>
            <Text style={[styles.secureDesc, { color: colors.textSecondary }]}>
              All transactions are encrypted with 256-bit SSL. Your card data is never stored on our servers.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.addCard}</Text>
            <TouchableOpacity onPress={handleAddCard}>
              <Text style={[styles.modalSave, { color: colors.oceanBlue }]}>{t.save}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
            <View style={[styles.cardPreview, { backgroundColor: "#1A6FA8" }]}>
              <MaterialCommunityIcons name="credit-card" size={32} color="rgba(255,255,255,0.7)" />
              <Text style={styles.previewNum}>{cardNum || "•••• •••• •••• ••••"}</Text>
              <View style={styles.previewBottom}>
                <Text style={styles.previewLabel}>{cardHolder || "CARDHOLDER NAME"}</Text>
                <Text style={styles.previewLabel}>{cardExpiry || "MM/YY"}</Text>
              </View>
            </View>

            {formError ? <Text style={{ color: "#EF4444", fontSize: 13, textAlign: "center" }}>{formError}</Text> : null}

            {[
              { label: "Card Number", value: cardNum, onChange: (v: string) => setCardNum(formatCardNum(v)), placeholder: "1234 5678 9012 3456", keyboardType: "numeric" as const, maxLength: 19 },
              { label: "Cardholder Name", value: cardHolder, onChange: setCardHolder, placeholder: "Name as on card", keyboardType: "default" as const },
              { label: "Expiry Date", value: cardExpiry, onChange: (v: string) => setCardExpiry(formatExpiry(v)), placeholder: "MM/YY", keyboardType: "numeric" as const, maxLength: 5 },
              { label: "CVV", value: cardCvv, onChange: (v: string) => setCardCvv(v.replace(/\D/g, "").slice(0, 4)), placeholder: "•••", keyboardType: "numeric" as const, maxLength: 4, secure: true },
            ].map((f) => (
              <View key={f.label}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{f.label}</Text>
                <TextInput
                  value={f.value}
                  onChangeText={(v) => { setFormError(""); f.onChange(v); }}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType={f.keyboardType}
                  secureTextEntry={(f as any).secure}
                  maxLength={f.maxLength}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? "#0D1B2A" : "#F8FAFC" }]}
                />
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 12 },
  addNewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, borderStyle: "dashed" },
  addNewText: { fontSize: 14, fontWeight: "600" },
  methodsList: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  methodRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  methodIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  methodName: { fontSize: 14, fontWeight: "600" },
  methodDesc: { fontSize: 12, marginTop: 1 },
  availBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  availText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, marginHorizontal: 14 },
  secureCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  secureTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  secureDesc: { fontSize: 12, lineHeight: 17 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  modalCancel: { fontSize: 15 },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalSave: { fontSize: 15, fontWeight: "700" },
  cardPreview: { borderRadius: 18, padding: 20, height: 170, justifyContent: "space-between" },
  previewNum: { color: "#fff", fontSize: 18, letterSpacing: 3, fontWeight: "600" },
  previewBottom: { flexDirection: "row", justifyContent: "space-between" },
  previewLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
});
