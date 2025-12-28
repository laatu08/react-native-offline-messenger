import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Message } from "../../src/types/message";
import { getQueue } from "../../src/storage/messageQueue";
import useNetwork from "../../src/hooks/useNetwork";

export default function DebugScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const { isOnline } = useNetwork();

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <Text style={styles.title}>Debug / Observability</Text>

      {/* System Status */}
      <View style={styles.systemCard}>
        <Text style={styles.systemRow}>
          Network:{" "}
          <Text style={{ color: isOnline ? "#059669" : "#dc2626" }}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </Text>
        <Text style={styles.systemRow}>
          Last refresh: {new Date(lastRefresh).toLocaleTimeString()}
        </Text>
      </View>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <Metric label="Total" value={messages.length} />
        <Metric label="Pending" value={pending} color="#f59e0b" />
        <Metric label="Sent" value={sent} color="#10b981" />
        <Metric label="Failed" value={failed} color="#ef4444" />
      </View>

      {/* Message Inspector */}
      <Text style={styles.subtitle}>Message Inspector</Text>

      {messages.length === 0 && (
        <Text style={styles.empty}>No messages in queue</Text>
      )}

      {messages.map((m) => (
        <View key={m.id} style={styles.messageCard}>
          <Text style={styles.messageText}>{m.text}</Text>

          <View style={styles.row}>
            <Label label="Status" value={m.status} />
            <Label label="Retries" value={m.retryCount.toString()} />
          </View>

          <View style={styles.row}>
            <Label
              label="Manual Retry"
              value={m.manualRetryRequested ? "YES" : "NO"}
            />
          </View>

          <View style={styles.timestamps}>
            <Text>Created: {formatTime(m.createdAt)}</Text>
            <Text>Last Tried: {m.lastTriedAt ? formatTime(m.lastTriedAt) : "—"}</Text>
            <Text>Next Retry: {m.nextRetryAt ? formatTime(m.nextRetryAt) : "—"}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------- Small Components ---------- */

function Metric({
  label,
  value,
  color = "#111827",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Label({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.label}>
      <Text style={styles.labelKey}>{label}</Text>
      <Text style={styles.labelValue}>{value}</Text>
    </View>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString();
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 12,
  },

  systemCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 12,
  },

  systemRow: {
    fontSize: 14,
    marginBottom: 4,
  },

  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
  },

  metricValue: {
    fontSize: 20,
    fontWeight: "700",
  },

  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  messageCard: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "white",
  },

  messageText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 6,
  },

  label: {
    flexDirection: "row",
    gap: 6,
  },

  labelKey: {
    fontSize: 12,
    color: "#6b7280",
  },

  labelValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  timestamps: {
    marginTop: 6,
    gap: 2,
  },

  empty: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 40,
  },
});
