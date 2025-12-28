import { getRetryableMessages, updateAfterAttempt } from '../storage/messageQueue';
import { sendMessageToServer } from '../services/messageSender';
import { Message } from '../types/message';

/**
 * Processes the offline message queue.
 * Attempts to send retryable messages sequentially.
 */
export async function processQueue(): Promise<void> {
  const messages: Message[] = await getRetryableMessages();

  for (const message of messages) {
    try {
      await sendMessageToServer(message);
      await updateAfterAttempt(message.id, true);
    } catch (error) {
      await updateAfterAttempt(message.id, false);
    }
  }
}
