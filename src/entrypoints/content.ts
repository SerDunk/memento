export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main() {
    console.log("Context script has been loaded into ChatGPT");
  },
});
