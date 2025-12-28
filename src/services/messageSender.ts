import { Message } from "../types/message";

/**
 * Simulates sending a message to a backend server
 * - Adds artificial delay
 * - Randomly fails to simulate network/server issues
 */
export async function sendMessageToServer(message: Message): Promise<void> {
  return new Promise((resolve, reject) => {
    const NETWORK_DELAY_MS = 800;
    const FAILURE_RATE = 0.3; // 30% failure rate

    setTimeout(() => {
      const didFail = Math.random() < FAILURE_RATE;

      if (didFail) {
        reject(new Error("Network or server error"));
      } else {
        resolve();
      }
    }, NETWORK_DELAY_MS);
  });
}
