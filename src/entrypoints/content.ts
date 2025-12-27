import { browser } from "wxt/browser";

interface Bookmark {
  id: string;
  text: string;
  createdAt: Date;
  responseId: string;
}

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main() {
    console.log("Context script has been loaded into ChatGPT");

    //Floating UI
    function createFloatingUI() {
      if (document.getElementById("ai-bookmark-widget")) return;

      const button = document.createElement("div");
      button.id = "ai-bookmark-widget";
      button.textContent = "📌";

      button.style.position = "fixed";
      button.style.bottom = "20px";
      button.style.right = "20px";
      button.style.width = "48px";
      button.style.height = "48px";
      button.style.borderRadius = "50%";
      button.style.background = "#4f46e5";
      button.style.color = "white";
      button.style.display = "flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.cursor = "pointer";
      button.style.zIndex = "9999";
      button.style.fontSize = "20px";

      document.body.appendChild(button);

      button.addEventListener("click", async () => {
        const panel = document.getElementById("ai-bookmark-panel");
        if (!panel) return;

        const isOpen = panel.style.display === "block";

        if (isOpen) {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
          await renderBookmarks();
        }
      });

      async function renderBookmarks() {
        const list = document.getElementById("ai-bookmark-list");
        if (!list) return;

        const result = await browser.storage.local.get("bookmarks");
        const bookmarks = result.bookmarks || [];

        if (bookmarks.length === 0) {
          list.innerHTML = "<p>No Bookmarks Yet</p>";
          return;
        }

        list.innerHTML = "";

        bookmarks.forEach((bm: Bookmark, index: number) => {
          const item = document.createElement("div");

          item.style.borderBottom = "1px solid #eee";
          item.style.padding = "0";
          item.style.fontSize = "12px";
          item.style.cursor = "pointer";
          item.style.color = "#d04949ff";

          item.innerHTML = `
            <strong>#${index + 1}</strong>
            <div>${bm.text.slice(0, 100)}...</div>
          `;

          //Clicking functionality for item
          item.addEventListener("click", () => {
            const target = document.getElementById(bm.responseId);
            if (!target) {
              alert("This message no longer exists in the chat ");
              return;
            }

            target.scrollIntoView({ behavior: "smooth", block: "center" });

            target.style.transition = "background-color 0.3s";

            const originalBg = target.style.backgroundColor;

            target.style.backgroundColor = "#fff3cd";

            setTimeout(() => {
              target.style.backgroundColor = originalBg || "";
            }, 1200);
          });

          list.appendChild(item);
        });
      }
    }

    //Bookmark Panel UI
    function createBookmarkPanel() {
      if (document.getElementById("ai-bookmark-panel")) return;

      const panel = document.createElement("div");

      panel.id = "ai-bookmark-panel";

      panel.style.position = "fixed";
      panel.style.bottom = "80px";
      panel.style.right = "20px";
      panel.style.width = "320px";
      panel.style.maxHeight = "400px";
      panel.style.background = "white";
      panel.style.border = "1px solid #ddd";
      panel.style.borderRadius = "8px";
      panel.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
      panel.style.padding = "10px";
      panel.style.overflowY = "auto";
      panel.style.zIndex = "9999";

      panel.style.display = "none";

      panel.innerHTML = `
          <h4 style="margin: 0 0 8px 0;">AI Bookmarks</h4>
    <div id="ai-bookmark-list">Loading...</div>
    `;

      document.body.appendChild(panel);
    }

    // We are changing the observer to add a star to the answer part
    const observer = new MutationObserver(() => {
      //Find all GPT answers
      const responses = document.querySelectorAll("div.markdown.prose");
      responses.forEach((response) => {
        //Check and skip if it already book marked
        if (response.getAttribute("data-bookmark-added")) return;

        if (!response.id) {
          response.id = `ai-response-${crypto.randomUUID()}`;
        }

        //Mark it as processed
        response.setAttribute("data-bookmark-added", "true");

        //Create a button to bookmark
        const button = document.createElement("button");
        button.textContent = "⭐";
        button.style.cursor = "pointer";

        //Handle Click
        button.addEventListener("click", async () => {
          const text = response.textContent;

          const bookmark = {
            id: crypto.randomUUID(),
            text,
            createdAt: Date.now(),
            responseId: response.id,
          };

          const result = await browser.storage.local.get("bookmarks");
          const bookmarks = result.bookmarks || [];

          bookmarks.push(bookmark);

          await browser.storage.local.set({ bookmarks });

          console.log("Saved your bookmark", bookmark);
        });

        response.prepend(button);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    createFloatingUI();
    createBookmarkPanel();
  },
});
