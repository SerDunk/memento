// Get conversation ID of chatgpt from url
export function getConversationId() {
  const match = window.location.pathname.match(/\/c\/([^/]+)/);
  return match ? match[1] : null;
}
