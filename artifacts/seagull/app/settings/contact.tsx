import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const CONTACT_CHANNELS_CONFIG = [
  { icon: "phone", key: "contactCallUs" as const, value: "+20 12 00157302", color: "#22C55E", onPress: () => Linking.openURL("tel:+201200157302") },
  { icon: "whatsapp", key: "contactWhatsApp" as const, value: "+20 12 00157302", color: "#25D366", onPress: () => Linking.openURL("https://wa.me/201200157302") },
  { icon: "email", key: "contactEmail" as const, value: "support@seagull.eg", color: "#3B82F6", onPress: () => Linking.openURL("mailto:support@seagull.eg") },
];

export default function ContactScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const { user } = useAuth();

  const { t } = useLanguage();
  const TOPICS = [t.topicGeneralInquiry, t.topicOrderIssue, t.topicPaymentProblem, t.topicFeedback, t.topicPartnership, t.topicOther];
  const CONTACT_CHANNELS = CONTACT_CHANNELS_CONFIG.map(ch => ({ ...ch, label: t[ch.key] }));
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!topic) { setFormError(t.selectTopicError); return; }
    if (!message.trim() || message.trim().length < 20) { setFormError(t.messageTooShort); return; }
    setFormError("");
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setMessage(""); setTopic("");
    setTimeout(() => { setSent(false); router.back(); }, 2000);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[colors.navyDeep, colors.oceanBlue]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.contactUs}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>{t.contactHeaderSub}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        <View style={[styles.hoursCard, { backgroundColor: colors.gold + "15", borderColor: colors.gold + "40" }]}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.gold} />
          <Text style={[styles.hoursText, { color: colors.textSecondary }]}>{t.supportHoursLabel}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.contactUs.toUpperCase()}</Text>
        <View style={styles.channelsRow}>
          {CONTACT_CHANNELS.map((ch) => (
            <TouchableOpacity
              key={ch.label}
              style={[styles.channelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={ch.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.channelIcon, { backgroundColor: ch.color + "20" }]}>
                <MaterialCommunityIcons name={ch.icon as any} size={22} color={ch.color} />
              </View>
              <Text style={[styles.channelLabel, { color: colors.text }]}>{ch.label}</Text>
              <Text style={[styles.channelValue, { color: colors.textSecondary }]}>{ch.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.sendMessage.toUpperCase()}</Text>
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {user && (
            <View style={[styles.userRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={[styles.userAvatar, { backgroundColor: colors.oceanBlue + "20" }]}>
                <Text style={[styles.userAvatarText, { color: colors.oceanBlue }]}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{user.phone}</Text>
              </View>
            </View>
          )}

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.topicLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={styles.topicsRow}>
              {TOPICS.map((tp) => (
                <TouchableOpacity
                  key={tp}
                  style={[styles.topicChip, {
                    backgroundColor: topic === tp ? colors.oceanBlue : "transparent",
                    borderColor: topic === tp ? colors.oceanBlue : colors.border,
                  }]}
                  onPress={() => { setTopic(tp); setFormError(""); }}
                >
                  <Text style={[styles.topicText, { color: topic === tp ? "#fff" : colors.textSecondary }]}>{tp}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t.messageLabel}</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue or question in detail…"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={[styles.messageInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? "#0D1B2A" : "#F8FAFC" }]}
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>{message.length} / 500</Text>

          {formError ? (
            <Text style={{ color: "#EF4444", fontSize: 13, marginBottom: 6 }}>{formError}</Text>
          ) : null}
          {sent ? (
            <View style={{ backgroundColor: "#22C55E20", borderRadius: 10, padding: 12, marginBottom: 6 }}>
              <Text style={{ color: "#22C55E", fontSize: 13, fontWeight: "600", textAlign: "center" }}>{t.messageSent}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.oceanBlue, opacity: (sending || sent) ? 0.7 : 1 }]}
            onPress={handleSend}
            disabled={sending || sent}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
                <Text style={styles.sendText}>{t.sendMessage}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.branchesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.branchTitle, { color: colors.text }]}>📍 Our Branches</Text>
          {[
            { name: "Sea Gull Zamalek", phone: "+20 2 2738-1234", hours: "12 PM – 11 PM" },
            { name: "Sea Gull Maadi", phone: "+20 2 2378-5678", hours: "12 PM – 11 PM" },
            { name: "Sea Gull New Cairo", phone: "+20 2 2618-9012", hours: "1 PM – 12 AM" },
          ].map((b, i) => (
            <View key={b.name} style={[styles.branchRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.branchName, { color: colors.text }]}>{b.name}</Text>
                <Text style={[styles.branchInfo, { color: colors.textSecondary }]}>{b.hours}</Text>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${b.phone.replace(/\s/g, "")}`)}>
                <MaterialCommunityIcons name="phone" size={20} color={colors.oceanBlue} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, textAlign: "center" },
  hoursCard: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  hoursText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  channelsRow: { flexDirection: "row", gap: 10 },
  channelCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  channelIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  channelLabel: { fontSize: 13, fontWeight: "700" },
  channelValue: { fontSize: 10, textAlign: "center" },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 14 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  userAvatarText: { fontSize: 18, fontWeight: "700" },
  userName: { fontSize: 14, fontWeight: "700" },
  userPhone: { fontSize: 12 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8, marginTop: 4 },
  topicsRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
  topicChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  topicText: { fontSize: 13, fontWeight: "600" },
  messageInput: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 14, minHeight: 120 },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 4, marginBottom: 4 },
  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 8 },
  sendText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  branchesCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  branchTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  branchRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  branchName: { fontSize: 13, fontWeight: "600" },
  branchInfo: { fontSize: 12, marginTop: 1 },
});
