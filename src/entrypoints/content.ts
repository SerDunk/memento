import { browser } from "wxt/browser";
import { mountBookmarkUI } from "../ui/content-ui";

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main() {
    console.log("Context script has been loaded into ChatGPT");

    //React Entry Point
    function mountReactUI() {
      if (document.getElementById("ai-bookmark-root")) return;

      const host = document.createElement("div");
      host.id = "ai-bookmark-root";
      host.style.position = "fixed";
      host.style.bottom = "20px";
      host.style.right = "20px";
      host.style.zIndex = "9999";

      document.body.appendChild(host);

      const shadowRoot = host.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      shadowRoot.appendChild(container);

      return container;
    }

    const container = mountReactUI();

    if (container) {
      mountBookmarkUI(container);
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
  },
});
