import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl cursor-pointer border-none"
        onClick={() => openPanel()}
      >
        📌
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-5 w-80 max-h-96 bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 font-semibold text-lg">
              📚 AI Bookmarks
            </div>

            <div className="p-4 overflow-y-auto max-h-80">
              {bookmarks.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No bookmarks yet
                </p>
              )}

              {bookmarks.map((bm, i) => (
                <motion.div
                  key={bm.id}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={() => jumpTo(bm)}
                  className="py-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 text-sm">
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm line-clamp-2">
                        {bm.text.slice(0, 100)}...
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBookmark(bm.id);
                        }}
                        className="text-red-500 text-xs mt-1 hover:text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function mountBookmarkUI(container: HTMLElement) {
  createRoot(container).render(<BookmarkApp />);
}
