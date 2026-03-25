import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  colors: any;
}

export default function ConfirmModal({
  visible, title, message, confirmLabel, cancelLabel,
  onConfirm, onCancel, destructive, colors,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={s.overlay} onPress={onCancel}>
        <Pressable style={[s.card, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <Text style={[s.title, { color: colors.text }]}>{title}</Text>
          <Text style={[s.message, { color: colors.textSecondary }]}>{message}</Text>
          <View style={s.buttons}>
            <TouchableOpacity
              style={[s.btn, { borderColor: colors.border, borderWidth: 1.5 }]}
              onPress={onCancel}
            >
              <Text style={[s.btnText, { color: colors.text }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: destructive ? "#EF4444" : colors.primary }]}
              onPress={onConfirm}
            >
              <Text style={[s.btnText, { color: "#fff" }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  message: { fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 4 },
  buttons: { flexDirection: "row", gap: 10, marginTop: 8 },
  btn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 15, fontWeight: "600" },
});
