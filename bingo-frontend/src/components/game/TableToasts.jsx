import { useEffect, useRef, useState } from "preact/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { io } from "socket.io-client";
import BingoBall from "./scenery/structureBall/BingoBall";
import useAuthStore from "../../../store/authStore";
import useGameStore from "../../../store/gameStore";
import useUsersGame from "../../../store/usersGame";
import useChatStore from "../../../store/chatStore";
import usePresenceStore from "../../../store/presenceStore";

const LETTERS = ["B", "I", "N", "G", "O"];

const JOIN_LINES = [
  "se sentó en la mesa",
  "acaba de entrar",
  "toma un cartón",
  "se suma a la ronda",
  "llegó a jugar",
];

const LEAVE_LINES = [
  "dejó la mesa",
  "se levantó de la silla",
  "salió de la ronda",
];

const DISCONNECT_LINES = [
  "perdió la conexión",
  "se quedó sin red",
  "se desconectó",
];

const BACK_LINES = [
  "volvió a la mesa",
  "recuperó la conexión",
  "está de vuelta",
];

const letterFromName = (name = "") => {
  const ch = String(name).trim().charAt(0).toUpperCase();
  const idx = ch.charCodeAt(0) % LETTERS.length;
  return LETTERS[Number.isNaN(idx) ? 0 : idx];
};

const ballNumber = (name = "") => {
  const n = String(name)
    .split("")
    .reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return (n % 75) + 1;
};

const isSameUser = (payloadUserId, myId) =>
  myId != null && payloadUserId != null && String(payloadUserId) === String(myId);

function ChatIcon() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white shadow">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3C6.5 3 2 6.9 2 11.6c0 2.6 1.4 5 3.6 6.6L5 21.5 8.7 20c1 .3 2.1.4 3.3.4 5.5 0 10-3.9 10-8.6S17.5 3 12 3z" />
      </svg>
    </span>
  );
}

export default function TableToasts({
  gameId,
  chatOpen = false,
  onUnreadChat,
  onOpenChat,
}) {
  const [toasts, setToasts] = useState([]);
  const { userInfo } = useAuthStore();
  const { setSelectedGame } = useGameStore();
  const { fetchPlayers } = useUsersGame();
  const addMessage = useChatStore((s) => s.addMessage);
  const setHistory = useChatStore((s) => s.setHistory);
  const applySnapshot = usePresenceStore((s) => s.applySnapshot);
  const setConnected = usePresenceStore((s) => s.setConnected);
  const resetPresence = usePresenceStore((s) => s.reset);
  const connected = usePresenceStore((s) => s.connected);
  const chatOpenRef = useRef(chatOpen);
  const onUnreadRef = useRef(onUnreadChat);
  chatOpenRef.current = chatOpen;
  onUnreadRef.current = onUnreadChat;

  const pushToast = (toast) => {
    setToasts((prev) => [...prev.slice(-3), toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, toast.kind === "chat" ? 6000 : 5200);
  };

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL;
    if (!socketUrl || !gameId) return;

    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
    });

    const announcePresence = () => {
      socket.emit("joinGameChat", gameId);
      if (userInfo?.id) {
        socket.emit("presenceJoin", {
          gameId,
          userId: userInfo.id,
          nickname: userInfo.nickname,
        });
      }
    };

    socket.on("connect", () => {
      setConnected(true);
      announcePresence();
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("chatHistory", (list) => {
      setHistory(gameId, list);
    });

    const onVisibility = () => {
      if (document.hidden) socket.emit("presenceAway");
      else socket.emit("presenceBack");
    };
    document.addEventListener("visibilitychange", onVisibility);

    const applyRoster = (payload) => {
      if (payload.game) {
        setSelectedGame({
          ...payload.game,
          user_count: payload.userCount ?? payload.game.user_count,
        });
      }
      fetchPlayers?.(gameId);
    };

    socket.on("playerJoined", (payload) => {
      if (String(payload.gameId) !== String(gameId)) return;
      applyRoster(payload);
      if (isSameUser(payload.userId, userInfo?.id)) return;

      pushToast({
        id: `join-${payload.userId}-${Date.now()}`,
        kind: "join",
        nickname: payload.nickname || "Un jugador",
        line: payload.spectator
          ? "mira la ronda y juega en la próxima"
          : JOIN_LINES[Math.floor(Math.random() * JOIN_LINES.length)],
        letter: letterFromName(payload.nickname),
        number: ballNumber(payload.nickname),
        userCount: payload.spectator ? null : payload.userCount,
        title: payload.spectator ? "En cola" : "Nueva bola en mesa",
        accent: payload.spectator ? "felt" : "red",
      });
    });

    socket.on("playerLeft", (payload) => {
      if (String(payload.gameId) !== String(gameId)) return;
      applyRoster(payload);
      if (isSameUser(payload.userId, userInfo?.id)) return;

      const disconnected = payload.reason === "disconnect";
      pushToast({
        id: `leave-${payload.userId}-${Date.now()}`,
        kind: "leave",
        nickname: payload.nickname || "Un jugador",
        line: disconnected
          ? "se desconectó y salió de la mesa"
          : LEAVE_LINES[Math.floor(Math.random() * LEAVE_LINES.length)],
        letter: letterFromName(payload.nickname),
        number: ballNumber(payload.nickname),
        userCount: payload.userCount,
        title: disconnected ? "Sin conexión" : "Alguien se retiró",
        accent: "felt",
      });
    });

    socket.on("playerPresence", (payload) => {
      if (!payload) return;
      if (payload.gameId && String(payload.gameId) !== String(gameId)) return;
      if (Array.isArray(payload.players)) applySnapshot(payload.players);

      const change = payload.change;
      if (!change || isSameUser(change.userId, userInfo?.id)) return;
      if (change.reason === "join" || change.reason === "away") return;

      if (change.status === "disconnected") {
        pushToast({
          id: `off-${change.userId}-${Date.now()}`,
          kind: "leave",
          nickname: change.nickname || "Un jugador",
          line: DISCONNECT_LINES[Math.floor(Math.random() * DISCONNECT_LINES.length)],
          letter: letterFromName(change.nickname),
          number: ballNumber(change.nickname),
          title: "Sin conexión",
          accent: "felt",
        });
      }

      if (change.status === "online" && change.reason === "back") {
        pushToast({
          id: `back-${change.userId}-${Date.now()}`,
          kind: "join",
          nickname: change.nickname || "Un jugador",
          line: BACK_LINES[Math.floor(Math.random() * BACK_LINES.length)],
          letter: letterFromName(change.nickname),
          number: ballNumber(change.nickname),
          title: "De vuelta",
          accent: "red",
        });
      }
    });

    socket.on("chatMessage", (msg) => {
      if (!msg?.message) return;
      if (msg.gameId && String(msg.gameId) !== String(gameId)) return;

      addMessage(msg.gameId || gameId, msg);

      const mine = isSameUser(msg.userId, userInfo?.id);
      if (mine) return;
      if (chatOpenRef.current) return;

      onUnreadRef.current?.();
      pushToast({
        id: `chat-${msg.id || Date.now()}`,
        kind: "chat",
        nickname: msg.nickname || "Jugador",
        line: String(msg.message).slice(0, 90),
      });
    });

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("playerJoined");
      socket.off("playerLeft");
      socket.off("playerPresence");
      socket.off("chatHistory");
      socket.off("chatMessage");
      socket.close();
      resetPresence();
    };
  }, [gameId, userInfo?.id]);

  return (
    <>
    <div className="pointer-events-none fixed right-3 top-3 z-[90] flex w-[min(92vw,20rem)] flex-col gap-2 sm:right-4 sm:top-4">
      <AnimatePresence>
        {toasts.map((toast) =>
          toast.kind === "chat" ? (
            <motion.button
              key={toast.id}
              type="button"
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 32, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="pointer-events-auto relative w-full rounded-2xl border border-white/20 bg-[#0f2f28] p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              onClick={() => onOpenChat?.()}
            >
              <div className="flex items-start gap-2.5">
                <ChatIcon />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#25d366]">
                    Chat de la mesa
                  </p>
                  <p className="truncate font-semibold text-white">
                    {toast.nickname}
                  </p>
                  <p className="line-clamp-2 text-sm text-white/80">{toast.line}</p>
                  <p className="mt-1 text-[0.65rem] font-semibold text-[#f0b429]">
                    Toca para abrir
                  </p>
                </div>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 48, rotate: 3, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, rotate: -1, scale: 1 }}
              exit={{ opacity: 0, x: 32, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border-2 bg-[#f7fbf8] p-3 text-[#12241f] shadow-[6px_6px_0_rgba(6,40,32,0.45)] ${
                toast.accent === "felt"
                  ? "border-[#0b3d32]"
                  : "border-[var(--bingo-red)]"
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 w-1.5 ${
                  toast.accent === "felt" ? "bg-[#0b3d32]" : "bg-[var(--bingo-red)]"
                }`}
              />
              <div className="flex items-center gap-3 pl-2">
                <BingoBall
                  letter={toast.letter}
                  number={toast.number}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#0b3d32]">
                    {toast.title}
                  </p>
                  <p className="truncate font-bingo text-lg leading-tight text-[#062820]">
                    {toast.nickname}
                  </p>
                  <p className="text-sm font-medium text-[#1a332c]">
                    {toast.line}
                    {toast.userCount != null
                      ? ` · ${toast.userCount} jugador${toast.userCount === 1 ? "" : "es"}`
                      : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
    <AnimatePresence>
      {!connected && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="pointer-events-none fixed bottom-[5.25rem] left-1/2 z-[96] w-[min(92vw,22rem)] -translate-x-1/2 rounded-2xl border border-[#f0b429]/60 bg-[#12241f] px-4 py-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        >
          <p className="font-bingo text-sm text-[#f0b429]">Sin conexión</p>
          <p className="text-xs font-semibold text-white/80">
            Reconectando… tu cartón se guarda en la mesa.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
