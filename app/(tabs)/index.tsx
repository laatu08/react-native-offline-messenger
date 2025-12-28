import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
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
    <View style={styles.container}>
      <Text style={styles.header}>
        Offline Messenger ({isOnline ? "Online" : "Offline"})
      </Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          style={styles.input}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  header: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
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
    color: "gray",
    marginTop: 2,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
  },
});
