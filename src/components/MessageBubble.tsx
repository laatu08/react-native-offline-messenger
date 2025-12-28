import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Message, MessageStatus } from "../types/message";
import { Pressable, Alert } from "react-native";

interface Props {
  message: Message;
  onManualRetry: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MessageBubble({
  message,
  onManualRetry,
  onDelete,
}: Props) {
  const [, forceUpdate] = useState(0);

  // Force re-render for countdown (safe + localized)
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function secondsLeft(timestamp?: number): number {
    if (!timestamp) return 0;
    const diff = Math.ceil((timestamp - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }

  function renderStatus() {
    switch (message.status) {
      case MessageStatus.SENT:
        return <Text style={[styles.status, styles.sent]}>Sent</Text>;

      case MessageStatus.PENDING:
        if (message.retryCount > 0 && message.nextRetryAt) {
          return (
            <Text style={[styles.status, styles.retrying]}>
              Retrying in {secondsLeft(message.nextRetryAt)}s ·{" "}
              {message.retryCount}/5
            </Text>
          );
        }
        return <Text style={[styles.status, styles.pending]}>Pending</Text>;

      case MessageStatus.FAILED:
        return (
          <TouchableOpacity
            onPress={() => onManualRetry(message.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.status, styles.failed]}>
              Failed · Tap to retry
            </Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete message?",
      "This message will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(message.id),
        },
      ]
    );
  }

  return (
    <Pressable onLongPress={confirmDelete}>
      <View style={styles.wrapper}>
        <View style={styles.bubble}>
          <Text style={styles.text}>{message.text}</Text>
        </View>
        {renderStatus()}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    alignSelf: "flex-start", // future-proof for left/right alignment
    maxWidth: "85%",
  },

  bubble: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },

  text: {
    fontSize: 15,
    lineHeight: 20,
    color: "#111827",
  },

  status: {
    marginTop: 4,
    fontSize: 12,
  },

  sent: {
    color: "#6b7280",
  },

  pending: {
    color: "#9ca3af",
  },

  retrying: {
    color: "#2563eb",
  },

  failed: {
    color: "#dc2626",
    fontWeight: "500",
  },
});
