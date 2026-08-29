import { create } from "zustand";

const liveOf = (players = []) =>
  players.filter((p) => p.status === "online" || p.status === "away");

const usePresenceStore = create((set, get) => ({
  byUser: {},
  onlineCount: 0,
  connected: true,

  applySnapshot: (players = []) => {
    const live = liveOf(players);
    set({
      byUser: Object.fromEntries(
        live.map((p) => [String(p.userId), p.status || "online"])
      ),
      onlineCount: live.length,
    });
  },

  setUserStatus: (userId, status) => {
    if (userId == null) return;
    set((state) => {
      const byUser = { ...state.byUser };
      if (status === "disconnected") delete byUser[String(userId)];
      else byUser[String(userId)] = status;
      const onlineCount = Object.values(byUser).filter(
        (s) => s === "online" || s === "away"
      ).length;
      return { byUser, onlineCount };
    });
  },

  reset: () => set({ byUser: {}, onlineCount: 0, connected: true }),

  setConnected: (connected) => set({ connected }),

  statusOf: (userId) => {
    if (userId == null) return "disconnected";
    return get().byUser[String(userId)] || "disconnected";
  },
}));

export default usePresenceStore;
