export interface Bookmark {
  id: string;
  text: string;
  createdAt: number;
  responseId: string;
}

export interface ChatBookmarks {
  bookmarks: Bookmark[];
  lastSeenAt: number;
}

export interface BookmarkStore {
  [chatId: string]: ChatBookmarks;
}
