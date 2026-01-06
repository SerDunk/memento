import { createRoot } from "react-dom/client";
import { browser } from "wxt/browser";
import { useState, useEffect } from "react";

interface Bookmark {
  id: string;
  text: string;
  createdAt: Date;
  responseId: string;
}

function BookmarkApp() {
  const [open, setOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  //Navigate to Chat Message
  function jumpTo(responseId: string) {
    const element = document.getElementById(responseId);

    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.style.backgroundColor = "#fff3cd";

    setTimeout(() => (element.style.backgroundColor = ""), 1200);
  }

  //Delete bookmarks that dont exist
  async function cleanupDeletedBookmarks() {
    const result = await browser.storage.local.get("bookmarks");
    const allBookmarks: Bookmark[] = result.bookmarks || [];

    const validBookmarks = allBookmarks.filter((bm: Bookmark) =>
      document.getElementById(bm.responseId)
    );

    //Only update if something if something is changed
    if (validBookmarks.length != allBookmarks.length) {
      await browser.storage.local.set({ bookmarks: validBookmarks });
    }

    return validBookmarks;
  }

  //Function to open panel
  async function openPanel() {
    const cleaned = await cleanupDeletedBookmarks();
    setBookmarks(cleaned);
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
          <h4>AI Bookmarks</h4>

          {bookmarks.length === 0 && <p>No Bookmarks Yet</p>}

          {bookmarks.map((bm, i) => (
            <div
              key={bm.id}
              onClick={() => jumpTo(bm.responseId)}
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
