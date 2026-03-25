import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ConfirmModal from "@/components/ConfirmModal";

const API_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface Address {
  id: number;
  label: string;
  address: string;
  area?: string;
  city?: string;
  landmark?: string;
  isDefault: boolean;
}

function AddressCard({ address, colors, onSetDefault, onDelete, t }: {
  address: Address;
  colors: any;
  onSetDefault: (id: number) => void;
  onDelete: (id: number) => void;
  t: any;
}) {
  const iconName = address.label === "Home" ? "home" : address.label === "Work" ? "briefcase" : "map-marker";

  return (
    <View style={[aStyles.card, { backgroundColor: colors.surface, borderColor: address.isDefault ? colors.gold : colors.border }]}>
      <View style={aStyles.cardHeader}>
        <View style={[aStyles.iconBg, { backgroundColor: address.isDefault ? colors.gold + "20" : colors.oceanBlue + "15" }]}>
          <MaterialCommunityIcons name={iconName as any} size={20} color={address.isDefault ? colors.gold : colors.oceanBlue} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={aStyles.labelRow}>
            <Text style={[aStyles.label, { color: colors.text }]}>{address.label}</Text>
            {address.isDefault && (
              <View style={[aStyles.defaultBadge, { backgroundColor: colors.gold }]}>
                <Text style={aStyles.defaultText}>{t.defaultLabel}</Text>
              </View>
            )}
          </View>
          <Text style={[aStyles.addressText, { color: colors.textSecondary }]}>{address.address}</Text>
          {address.area && <Text style={[aStyles.areaText, { color: colors.textSecondary }]}>{address.area}{address.city ? `, ${address.city}` : ""}</Text>}
        </View>
      </View>
      <View style={[aStyles.actions, { borderTopColor: colors.border }]}>
        {!address.isDefault && (
          <TouchableOpacity style={aStyles.actionBtn} onPress={() => onSetDefault(address.id)}>
            <MaterialCommunityIcons name="star-outline" size={16} color={colors.oceanBlue} />
            <Text style={[aStyles.actionText, { color: colors.oceanBlue }]}>{t.setDefault}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={aStyles.actionBtn} onPress={() => onDelete(address.id)}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#EF4444" />
          <Text style={[aStyles.actionText, { color: "#EF4444" }]}>{t.deleteLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const aStyles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1.5, marginBottom: 12, overflow: "hidden" },
  cardHeader: { flexDirection: "row", gap: 12, padding: 16 },
  iconBg: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  label: { fontSize: 15, fontWeight: "700" },
  defaultBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  defaultText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  addressText: { fontSize: 13, lineHeight: 18 },
  areaText: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: "row", borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  actionText: { fontSize: 13, fontWeight: "600" },
});

export default function AddressesScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const { token } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", address: "", area: "", city: "Cairo", landmark: "", isDefault: false });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAddresses(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAddresses(); }, []);

  const handleSetDefault = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/users/addresses/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      fetchAddresses();
    } catch {}
  };

  const doDelete = async () => {
    if (confirmDeleteId == null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await fetch(`${API_URL}/api/users/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch {}
  };

  const handleAdd = async () => {
    if (!newAddr.address.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/addresses`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });
      if (res.ok) {
        setShowModal(false);
        setNewAddr({ label: "Home", address: "", area: "", city: "Cairo", landmark: "", isDefault: false });
        fetchAddresses();
      }
    } catch {}
    setSaving(false);
  };

  const ADDRESS_LABELS = [t.homeAddress, t.workAddress, t.otherAddress];
  const ADDRESS_KEYS = ["Home", "Work", "Other"];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ConfirmModal
        visible={confirmDeleteId != null}
        title={t.deleteAddress}
        message={t.deleteAddressConfirm}
        confirmLabel={t.deleteAddress}
        cancelLabel={t.cancel}
        onConfirm={doDelete}
        onCancel={() => setConfirmDeleteId(null)}
        destructive
        colors={colors}
      />

      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.myAddresses}</Text>
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
            <MaterialCommunityIcons name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.oceanBlue} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="map-marker-off" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved addresses</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Add your delivery addresses for faster checkout</Text>
          <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.oceanBlue }]} onPress={() => setShowModal(true)}>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>{t.addNewAddress}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {addresses.map((a) => (
            <AddressCard key={a.id} address={a} colors={colors} onSetDefault={handleSetDefault} onDelete={(id) => setConfirmDeleteId(id)} t={t} />
          ))}
          <TouchableOpacity style={[styles.addNewBtn, { borderColor: colors.oceanBlue }]} onPress={() => setShowModal(true)}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.oceanBlue} />
            <Text style={[styles.addNewText, { color: colors.oceanBlue }]}>{t.addNewAddress}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.addNewAddress}</Text>
            <TouchableOpacity onPress={handleAdd} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={colors.oceanBlue} /> : <Text style={[styles.modalSave, { color: colors.oceanBlue }]}>{t.save}</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t.address}</Text>
              <View style={styles.labelBtns}>
                {ADDRESS_LABELS.map((l, i) => (
                  <TouchableOpacity
                    key={ADDRESS_KEYS[i]}
                    style={[styles.labelBtn, { borderColor: newAddr.label === ADDRESS_KEYS[i] ? colors.oceanBlue : colors.border, backgroundColor: newAddr.label === ADDRESS_KEYS[i] ? colors.oceanBlue + "15" : "transparent" }]}
                    onPress={() => setNewAddr((p) => ({ ...p, label: ADDRESS_KEYS[i] }))}
                  >
                    <Text style={[styles.labelBtnText, { color: newAddr.label === ADDRESS_KEYS[i] ? colors.oceanBlue : colors.textSecondary }]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {[
              { key: "address", label: "Street Address *", placeholder: "e.g. 26 Hassan Sabri St., Zamalek", icon: "map-marker-outline", multiline: true },
              { key: "area", label: "Area / District", placeholder: "e.g. Zamalek, Maadi, Heliopolis", icon: "city-variant-outline", multiline: false },
              { key: "city", label: "City", placeholder: "Cairo", icon: "office-building-outline", multiline: false },
              { key: "landmark", label: "Landmark (optional)", placeholder: "e.g. Near Metro station", icon: "flag-outline", multiline: false },
            ].map((f) => (
              <View key={f.key}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{f.label}</Text>
                <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: isDark ? "#0D1B2A" : "#F8FAFC" }]}>
                  <MaterialCommunityIcons name={f.icon as any} size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
                  <TextInput
                    value={(newAddr as any)[f.key]}
                    onChangeText={(v) => setNewAddr((p) => ({ ...p, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { color: colors.text }]}
                    multiline={f.multiline}
                    numberOfLines={f.multiline ? 3 : 1}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.defaultRow}
              onPress={() => setNewAddr((p) => ({ ...p, isDefault: !p.isDefault }))}
            >
              <View style={[styles.checkbox, { borderColor: newAddr.isDefault ? colors.gold : colors.border, backgroundColor: newAddr.isDefault ? colors.gold : "transparent" }]}>
                {newAddr.isDefault && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
              </View>
              <Text style={[styles.defaultLabel, { color: colors.text }]}>{t.setDefault}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  addNewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderRadius: 16, paddingVertical: 16, borderStyle: "dashed" },
  addNewText: { fontSize: 15, fontWeight: "600" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  modalCancel: { fontSize: 15 },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalSave: { fontSize: 15, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  labelBtns: { flexDirection: "row", gap: 10 },
  labelBtn: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  labelBtnText: { fontSize: 14, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "flex-start", borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15 },
  defaultRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  defaultLabel: { fontSize: 15 },
});
