import { browser } from "wxt/browser";

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main() {
    console.log("Context script has been loaded into ChatGPT");

    // We are changing the observer to add a star to the answer part
    const observer = new MutationObserver(() => {
      //Find all GPT answers
      const responses = document.querySelectorAll("div.markdown.prose");
      responses.forEach((response) => {
        //Check and skip if it already book marked
        if (response.getAttribute("data-bookmark-added")) return;

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
