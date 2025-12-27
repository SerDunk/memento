import { useEffect, useState } from "react";
import { browser } from "wxt/browser";

function App() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    async function loadBookmarks() {
      const result = await browser.storage.local.get("bookmarks");
      setBookmarks(result.bookmarks || []);
    }
    loadBookmarks();
  }, []);

  return (
    <div style={{ padding: 12, width: 100 }}>
      <h3>Memento</h3>
      {bookmarks.length === 0 && <p>No Bookmarks Yet</p>}

      {bookmarks.map((bm, index) => (
        <div
          key={bm.id}
          style={{
            borderBottom: "1px solid #ddd",
            padding: "6px 0",
            fontSize: 12,
          }}
        >
          <strong>#{index + 1}</strong>
          <div>{bm.text.slice(0, 100)}...</div>
        </div>
      ))}
    </div>
  );
}

export default App;
