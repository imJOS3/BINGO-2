import { create } from "zustand";

const MAX_MESSAGES = 200;

const messageKey = (msg) =>
  msg?.id || `${msg?.createdAt || ""}-${msg?.userId ?? ""}-${msg?.message || ""}`;

const useChatStore = create((set, get) => ({
  messagesByGame: {},

  addMessage: (gameId, msg) => {
    if (!gameId || !msg?.message) return;
    const key = String(gameId);
    const incoming = { ...msg, id: messageKey(msg) };
    const list = get().messagesByGame[key] || [];
    if (list.some((item) => messageKey(item) === incoming.id)) return;
    set({
      messagesByGame: {
        ...get().messagesByGame,
        [key]: [...list, incoming].slice(-MAX_MESSAGES),
      },
    });
  },

  setHistory: (gameId, messages) => {
    if (!gameId || !Array.isArray(messages)) return;
    const key = String(gameId);
    const existing = get().messagesByGame[key] || [];
    const merged = [...existing];
    for (const msg of messages) {
      if (!msg?.message) continue;
      const incoming = { ...msg, id: messageKey(msg) };
      if (!merged.some((item) => messageKey(item) === incoming.id)) {
        merged.push(incoming);
      }
    }
    merged.sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
    set({
      messagesByGame: {
        ...get().messagesByGame,
        [key]: merged.slice(-MAX_MESSAGES),
      },
    });
  },
}));

export default useChatStore;
