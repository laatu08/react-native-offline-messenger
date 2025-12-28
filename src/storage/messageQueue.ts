import AsyncStorage from "@react-native-async-storage/async-storage";
import { Message, MessageQueue, MessageStatus } from "../types/message";

const STORAGE_KEY = "MESSAGE_QUEUE";
export const MAX_RETRIES = 5;

export async function getQueue(): Promise<MessageQueue> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as MessageQueue) : [];
}

async function saveQueue(queue: MessageQueue): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function enqueueMessage(text: string): Promise<Message> {
  const queue = await getQueue();

  const message: Message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    status: MessageStatus.PENDING,
    createdAt: Date.now(),
    retryCount: 0,
  };

  queue.push(message);
  await saveQueue(queue);

  return message;
}

export async function updateAfterAttempt(
  id: string,
  success: boolean
): Promise<void> {
  const queue = await getQueue();

  const updatedQueue = queue.map((msg) => {
    if (msg.id !== id) return msg;

    if (msg.status === MessageStatus.SENT) return msg;

    const retryCount = msg.retryCount + 1;
    const lastTriedAt = Date.now();

    if (success) {
      return {
        ...msg,
        status: MessageStatus.SENT,
        retryCount,
        lastTriedAt,
        nextRetryAt: undefined,
      };
    }

    // failure case
    if (retryCount >= MAX_RETRIES) {
      return {
        ...msg,
        status: MessageStatus.FAILED,
        retryCount,
        lastTriedAt,
        nextRetryAt: undefined,
      };
    }

    // Failed attempt
    const delay = getBackoffDelayMs(retryCount);

    return {
      ...msg,
      status: MessageStatus.PENDING,
      retryCount,
      lastTriedAt,
      nextRetryAt: lastTriedAt + delay,
      manualRetryRequested: false,
    };
  });

  await saveQueue(updatedQueue);
}

export async function getRetryableMessages(): Promise<Message[]> {
  const queue = await getQueue();
  const now = Date.now();

  return queue.filter((msg) => {
    if (msg.status === MessageStatus.SENT) return false;
    // Allow ONE retry if user explicitly requested it
    if (msg.manualRetryRequested) return true;

    // Otherwise enforce retry limit
    if (msg.retryCount >= MAX_RETRIES) return false;

    // Automatic retry respects backoff
    if (!msg.nextRetryAt) return true;
    return msg.nextRetryAt <= now;
  });
}

function getBackoffDelayMs(retryCount: number): number {
  // 2^retryCount seconds
  return Math.pow(2, retryCount) * 1000;
}

export async function requestManualRetry(id: string): Promise<void> {
  const queue = await getQueue();

  const updatedQueue = queue.map((msg) => {
    if (msg.id !== id) return msg;
    if (msg.status === MessageStatus.SENT) return msg;

    return {
      ...msg,
      status: MessageStatus.PENDING,
      manualRetryRequested: true,
      nextRetryAt: undefined, // ignore backoff
    };
  });

  await saveQueue(updatedQueue);
}
