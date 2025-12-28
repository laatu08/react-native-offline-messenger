import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Message, MessageStatus } from "../../src/types/message";
import {
  enqueueMessage,
  getQueue,
  requestManualRetry,
} from "../../src/storage/messageQueue";
import { processQueue } from "../../src/sync/processQueue";
import useNetwork from "../../src/hooks/useNetwork";
import MessageBubble from "../../src/components/MessageBubble";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { isOnline } = useNetwork();

  // Load messages on app start
  useEffect(() => {
    loadMessages();
  }, []);

  // Auto-sync when network comes back
  useEffect(() => {
    if (isOnline) {
      syncMessages();
    }
  }, [isOnline]);

  async function loadMessages() {
    const queue = await getQueue();
    setMessages(queue);
  }

  async function syncMessages() {
    await processQueue();
    await loadMessages();
  }

  async function handleSend() {
    if (!input.trim()) return;

    await enqueueMessage(input.trim());
    setInput("");
    await loadMessages();

    if (isOnline) {
      await syncMessages();
    }
  }

  function renderItem({ item }: { item: Message }) {
    return <MessageBubble message={item} onManualRetry={handleManualRetry} />;
  }

  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(async () => {
      await syncMessages();
    }, 4000); // retry every 4 seconds while online

    return () => clearInterval(interval);
  }, [isOnline]);

  async function handleManualRetry(id: string) {
    // 1️⃣ Update storage
    await requestManualRetry(id);

    // 2️⃣ IMMEDIATELY reload UI state (this was missing)
    await loadMessages();

    // 3️⃣ THEN attempt network retry
    await processQueue();

    // 4️⃣ Reload UI again after attempt
    await loadMessages();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {" "}
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Offline Messenger</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isOnline ? "#d1fae5" : "#fee2e2" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? "#065f46" : "#991b1b" },
            ]}
          >
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </View>
      {/* Messages */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={[...messages].sort((a, b) => a.createdAt - b.createdAt)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      </View>
      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message…"
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />
        <Text style={styles.sendButton} onPress={handleSend}>
          Send
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 20,
  },

  /* Header */
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /* Message list */
  list: {
    padding: 12,
  },

  /* Input bar */
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
});
