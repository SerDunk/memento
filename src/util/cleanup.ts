import { BookmarkStore } from "./types";

const TTL_DAYS = 1;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

export function cleanupOldChats(store: BookmarkStore): BookmarkStore {
  const now = Date.now();
  const cleaned: BookmarkStore = {};

  for (const [chatId, data] of Object.entries(store)) {
    if (now - data.lastSeenAt < TTL_MS) {
      cleaned[chatId] = data;
    }
  }

  return cleaned;
}
