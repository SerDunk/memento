import { createRoot } from "react-dom/client";
import { browser } from "wxt/browser";
import { useState } from "react";
import { Bookmark } from "@/util/types";
import { getConversationId } from "@/util/helper";
import { getStore, setStore } from "@/util/storage";
import { cleanupOldChats } from "@/util/cleanup";

function BookmarkApp() {
  const [open, setOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  //Navigate to Chat Message
  function jumpTo(bm: Bookmark) {
    const element = document.getElementById(bm.responseId);

    if (!element) {
      const shouldDelete = confirm(
        "This chat or message no longer exists . Remove this bookmark? "
      );
      if (shouldDelete) {
        deleteBookmark(bm.id);
      }

      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => (element.style.backgroundColor = ""), 1200);
  }

  //Delete Bookmark
  async function deleteBookmark(bookmarkId: string) {
    const chatId = getConversationId();
    if (!chatId) return;

    const store = await getStore();
    if (!store[chatId]) return;

    store[chatId].bookmarks = store[chatId].bookmarks.filter(
      (bm) => bm.id !== bookmarkId
    );

    await setStore(store);
    setBookmarks(store[chatId].bookmarks);
  }

  //Function to open panel
  async function openPanel() {
    const activeConversationId = getConversationId();
    if (!activeConversationId) return;

    let store = await getStore();

    const cleaned = await cleanupOldChats(store);

    if (Object.keys(cleaned).length !== Object.keys(store).length) {
      await setStore(cleaned);
      store = cleaned;
    }
    setBookmarks(store[activeConversationId]?.bookmarks ?? []);
    setOpen((prev) => !prev);
  }

  return (
    <>
      <button
        onClick={() => openPanel()}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#4f46e5",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
        }}
      >
        📌
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 0,
            width: 320,
            maxHeight: 400,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            padding: 10,
            overflowY: "auto",
          }}
        >
          <h4 style={{ color: "#000" }}>AI Bookmarks</h4>

          {bookmarks.length === 0 && <p>No Bookmarks Yet</p>}

          {bookmarks.map((bm, i) => (
            <div
              key={bm.id}
              onClick={() => jumpTo(bm)}
              style={{
                color: "#000",
                borderBottom: "1px solid #0000",
                padding: "6px 0",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              <strong>#{i + 1}</strong>
              <div>{bm.text.slice(0, 100)}...</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function mountBookmarkUI(container: HTMLElement) {
  createRoot(container).render(<BookmarkApp />);
}
