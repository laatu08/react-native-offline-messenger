// Message can exist in only ONE of these states
export enum MessageStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
}

export interface Message {
  id: string; // unique & deterministic
  text: string; // message body
  status: MessageStatus; // lifecycle state
  createdAt: number; // timestamp (Date.now())
  lastTriedAt?: number; // last send attempt (undefined if never tried)
  retryCount: number; // number of send attempts
  nextRetryAt?: number; // timestamp when next retry is allowed
}

// Stored queue type (FIFO)
export type MessageQueue = Message[];
