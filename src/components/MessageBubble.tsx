import { View, Text, StyleSheet } from "react-native";
import { Message, MessageStatus } from "../types/message";
import { MAX_RETRIES } from "../storage/messageQueue";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { requestManualRetry } from "../storage/messageQueue";

interface Props {
  message: Message;
  onManualRetry: (id: string) => void;
}

export default function MessageBubble({ message, onManualRetry }: Props) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function renderStatus() {
    switch (message.status) {
      case MessageStatus.SENT:
        return <Text style={styles.status}>✅ Sent</Text>;

      case MessageStatus.PENDING:
        if (message.retryCount > 0 && message.nextRetryAt) {
          return (
            <Text style={styles.status}>
              🔁 Retrying in {secondsLeft(message.nextRetryAt)}s… (
              {message.retryCount}/5)
            </Text>
          );
        }
        return <Text style={styles.status}>⏳ Pending</Text>;

      case MessageStatus.FAILED:
        return (
          <TouchableOpacity onPress={() => onManualRetry(message.id)}>
            <Text style={styles.retry}>❌ Failed — Tap to retry</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  }

  function secondsLeft(timestamp?: number): number {
    if (!timestamp) return 0;
    const diff = Math.ceil((timestamp - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message.text}</Text>
      {renderStatus()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  text: {
    fontSize: 14,
  },
  status: {
    fontSize: 12,
    marginTop: 4,
    color: "#555",
  },
  retry: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
