import { browser } from "wxt/browser";
import { BookmarkStore } from "./types";

const STORAGE_KEY = "bookmarkStore";

export async function getStore(): Promise<BookmarkStore> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? {};
}

export async function setStore(store: BookmarkStore) {
  await browser.storage.local.set({ [STORAGE_KEY]: store });
}
