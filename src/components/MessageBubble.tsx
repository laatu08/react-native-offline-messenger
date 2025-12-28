import { View, Text, StyleSheet } from "react-native";
import { Message, MessageStatus } from "../types/message";
import { MAX_RETRIES } from "../storage/messageQueue";
import { useEffect, useState } from "react";

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
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
        return "✅ Sent";

      case MessageStatus.PENDING:
        if (message.retryCount > 0 && message.nextRetryAt) {
          return `🔁 Retrying in ${secondsLeft(message.nextRetryAt)}s… (${
            message.retryCount
          }/5)`;
        }
        return "⏳ Pending";

      case MessageStatus.FAILED:
        if (message.retryCount >= MAX_RETRIES) {
          return "❌ Failed (max retries)";
        }
        return `🔁 Retry ${message.retryCount}/${MAX_RETRIES}`;

      default:
        return "";
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
      <Text style={styles.status}>{renderStatus()}</Text>
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
});
