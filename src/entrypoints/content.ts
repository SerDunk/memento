import { mountBookmarkUI } from "../ui/content-ui";
import { getConversationId } from "@/util/helper";
import { getStore, setStore } from "@/util/storage";
import tailwindStyles from "../ui/tailwind-inline";
import "./tailwind.css";

//SVG to use

const BOOKMARK_OUTLINE = `
<svg viewBox="0 0 24 24" width="20" height="20"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  class="bookmark-svg">
  <path
    d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="currentColor"
    fill-opacity="0"
  />
</svg>
`;

const BOOKMARK_FILLED = `
<svg viewBox="0 0 24 24" width="20" height="20"
  xmlns="http://www.w3.org/2000/svg"
  fill="currentColor">
  <path
    d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z"
  />
</svg>
`;

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main() {
    console.log("Context script has been loaded into ChatGPT");

    (async function markChatAsSeen() {
      const chatId = getConversationId();

      if (!chatId) return;

      const store = await getStore();

      if (!store[chatId]) {
        store[chatId] = {
          bookmarks: [],
          lastSeenAt: Date.now(),
        };
      } else {
        store[chatId].lastSeenAt = Date.now();
      }

      await setStore(store);
    })();

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

      // Inject Tailwind styles into shadow DOM
      const style = document.createElement("style");
      style.textContent = tailwindStyles;
      shadowRoot.appendChild(style);

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
      responses.forEach((node) => {
        //Change to HTML element
        const response = node as HTMLElement;
        //Check and skip if it already book marked
        if (response.getAttribute("data-bookmark-added")) return;

        if (!response.id) {
          response.id = `ai-response-${crypto.randomUUID()}`;
        }

        //Mark it as processed
        response.setAttribute("data-bookmark-added", "true");

        //Create a button to bookmark
        const button = document.createElement("button");

        button.innerHTML = BOOKMARK_OUTLINE;

        button.style.position = "absolute";
        button.style.top = "8px";
        button.style.right = "8px";
        button.style.padding = "4px";
        button.style.border = "none";
        button.style.background = "transparent";
        button.style.cursor = "pointer";
        button.style.color = "#ffffff";

        button.style.transition = "opacity 120ms ease,color 120ms ease";

        const path = button.querySelector("path")!;

        button.addEventListener("mouseenter", () => {
          if (button.dataset.saved === "true") return;

          path.animate([{ fillOpacity: 0 }, { fillOpacity: 0.95 }], {
            duration: 150,
            fill: "forwards",
            easing: "ease-out",
          });
        });

        button.addEventListener("mouseleave", () => {
          if (button.dataset.saved === "true") return;

          path.animate([{ fillOpacity: 0.95 }, { fillOpacity: 0 }], {
            duration: 150,
            fill: "forwards",
            easing: "ease-in",
          });
        });

        function bounce(button: HTMLButtonElement) {
          button.animate(
            [
              { transform: "translateY(0)" },
              { transform: "translateY(-6px)" },
              { transform: "translateY(0)" },
            ],
            {
              duration: 260,
              easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            }
          );
        }

        //Handle Click
        button.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();

          bounce(button);
          const text = response.textContent;

          button.dataset.saved = "true";

          //Get Conversation Id
          const activeConversationId = getConversationId();

          if (!activeConversationId) {
            return;
          }

          const store = await getStore();

          if (!store[activeConversationId]) {
            store[activeConversationId] = {
              bookmarks: [],
              lastSeenAt: Date.now(),
            };
          }

          const exists = store[activeConversationId].bookmarks.some(
            (bm) => bm.responseId == response.id
          );

          if (exists) return;

          store[activeConversationId].bookmarks.push({
            id: crypto.randomUUID(),
            text,
            createdAt: Date.now(),
            responseId: response.id,
          });

          await setStore(store);
        });

        response.style.paddingRight = "2rem";
        response.prepend(button);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
});
