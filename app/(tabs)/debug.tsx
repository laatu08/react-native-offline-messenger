import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Message } from "../../src/types/message";
import { getQueue } from "../../src/storage/messageQueue";
import useNetwork from "../../src/hooks/useNetwork";

export default function DebugScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const { isOnline } = useNetwork();

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  async function load() {
    const queue = await getQueue();
    setMessages(queue);
    setLastRefresh(Date.now());
  }

  const pending = messages.filter(m => m.status === "pending").length;
  const sent = messages.filter(m => m.status === "sent").length;
  const failed = messages.filter(m => m.status === "failed").length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛠 Debug / Observability</Text>

      <View style={styles.section}>
        <Text>Network: {isOnline ? "🟢 Online" : "🔴 Offline"}</Text>
        <Text>Total messages: {messages.length}</Text>
        <Text>Pending: {pending}</Text>
        <Text>Sent: {sent}</Text>
        <Text>Failed: {failed}</Text>
        <Text>
          Last refresh: {new Date(lastRefresh).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Messages</Text>

        {messages.map((m) => (
          <View key={m.id} style={styles.card}>
            <Text>ID: {m.id}</Text>
            <Text>Status: {m.status}</Text>
            <Text>Retry Count: {m.retryCount}</Text>
            <Text>
              Manual Retry: {m.manualRetryRequested ? "YES" : "NO"}
            </Text>
            <Text>
              Created: {new Date(m.createdAt).toLocaleTimeString()}
            </Text>
            <Text>
              Last Tried:{" "}
              {m.lastTriedAt
                ? new Date(m.lastTriedAt).toLocaleTimeString()
                : "—"}
            </Text>
            <Text>
              Next Retry:{" "}
              {m.nextRetryAt
                ? new Date(m.nextRetryAt).toLocaleTimeString()
                : "—"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
  },
});
