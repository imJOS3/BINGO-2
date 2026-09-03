import { useEffect, useRef, useState } from "preact/hooks";
import { connectSocket } from "../../utils/socket";
import useAuthStore from "../../../store/authStore";
import useGameStore from "../../../store/gameStore";
import useChatStore from "../../../store/chatStore";
import { DockHeader } from "../game/scenery/gameData/SideDrawer";

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function MessageBubble({ msg, isMine }) {
  const isHost = Boolean(msg.isHost);

  const align = isMine ? "items-end self-end" : "items-start self-start";
  const bubble = isMine
    ? isHost
      ? "bg-[#ffe08a] text-[#12241f] rounded-2xl rounded-br-md border border-[#c49214]"
      : "bg-[#c8f0c0] text-[#12241f] rounded-2xl rounded-br-md"
    : isHost
      ? "bg-[#ffe9a8] text-[#12241f] rounded-2xl rounded-bl-md border border-[#c49214]"
      : "bg-[#fffdf6] text-[#12241f] rounded-2xl rounded-bl-md border border-[#0b3d32]/15";

  return (
    <div className={`flex max-w-[85%] flex-col gap-0.5 ${align}`}>
      {!isMine && (
        <div className="mb-0.5 flex items-center gap-1.5 px-1">
          <span
            className={`text-xs font-bold ${
              isHost ? "text-[#8a5a00]" : "text-[#0a5f7a]"
            }`}
          >
            {msg.nickname || "Jugador"}
          </span>
          {isHost && (
            <span className="rounded bg-[#f0b429] px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-[#12241f]">
              Host
            </span>
          )}
        </div>
      )}

      {isMine && isHost && (
        <div className="mb-0.5 flex justify-end px-1">
          <span className="rounded bg-[#f0b429] px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-[#12241f]">
            Host
          </span>
        </div>
      )}

      <div className={`relative px-3 py-2 shadow-sm ${bubble}`}>
        <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-snug text-[#12241f]">
          {msg.message}
        </p>
        <div className="mt-1 flex items-center justify-end gap-1">
          {isMine && (
            <span className="text-[0.65rem] font-bold text-[#0b3d32]">
              Tú
            </span>
          )}
          <span className="text-[0.65rem] font-semibold text-[#3d4f4a]">
            {formatTime(msg.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Chat({ isOpen, toggleChat, gameId, docked = false }) {
  const [socket, setSocket] = useState(null);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  const { userInfo } = useAuthStore();
  const { selectedGame } = useGameStore();
  const addMessage = useChatStore((s) => s.addMessage);
  const setHistory = useChatStore((s) => s.setHistory);

  const myId = userInfo?.id ?? null;
  const myNickname = userInfo?.nickname || "Jugador";
  const hostId = selectedGame?.creator_id ?? null;
  const amHost = myId != null && hostId != null && String(myId) === String(hostId);
  const roomId = gameId || selectedGame?.id || null;
  const messages = useChatStore(
    (s) => s.messagesByGame[roomId != null ? String(roomId) : ""] || []
  );

  useEffect(() => {
    if (!isOpen || !roomId) return;

    const socketUrl = import.meta.env.VITE_API_URL;
    if (!socketUrl) {
      console.error("VITE_API_URL no está definida");
      return;
    }

    const newSocket = connectSocket();
    setSocket(newSocket);

    newSocket.on("chatHistory", (list) => {
      setHistory(roomId, list);
    });

    newSocket.on("chatMessage", (msg) => {
      if (!msg?.message) return;
      addMessage(msg.gameId || roomId, msg);
    });

    newSocket.emit("joinGameChat", roomId);

    return () => {
      newSocket.off("chatHistory");
      newSocket.off("chatMessage");
      newSocket.close();
      setSocket(null);
    };
  }, [isOpen, roomId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socket) return;

    socket.emit("chatMessage", {
      message: text,
      nickname: myNickname,
      userId: myId,
      isHost: amHost,
      gameId: roomId,
      createdAt: new Date().toISOString(),
    });
    setInput("");
  };

  if (!isOpen) return null;

  const panel = (
    <div
      className={`flex min-h-0 flex-col overflow-hidden border border-white/20 text-[#12241f] shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${
        docked
          ? "h-full w-full rounded-2xl"
          : "h-full w-full rounded-l-2xl rounded-r-none"
      }`}
      role="dialog"
      aria-label="Chat de la partida"
    >
      {/* Header */}
      <DockHeader
        title="Chat"
        subtitle={`${selectedGame?.game_name || "Sala"}${amHost ? " · Host" : ""}`}
        onClose={toggleChat}
      />

      {/* Messages — fondo tipo WhatsApp */}
      <div
        ref={listRef}
        className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-3 py-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,61,50,0.12), rgba(6,40,32,0.18)), repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(0,0,0,0.02) 11px, rgba(0,0,0,0.02) 12px), #ece5dd",
        }}
      >
        {messages.length === 0 ? (
          <p className="mx-auto mt-8 max-w-[15rem] rounded-xl border border-[#0b3d32]/20 bg-[#fffdf6] px-3 py-2.5 text-center text-sm font-semibold leading-snug text-[#12241f] shadow-sm">
            Sé el primero en saludar. Los mensajes del host se marcan en dorado.
          </p>
        ) : (
          <div className="mt-auto flex flex-col gap-2">
            {messages.map((msg) => {
              const isMine =
                (myId != null &&
                  msg.userId != null &&
                  String(msg.userId) === String(myId)) ||
                (myId == null && msg.nickname === myNickname);
              return (
                <MessageBubble
                  key={msg.id || `${msg.createdAt}-${msg.nickname}-${msg.message}`}
                  msg={msg}
                  isMine={isMine}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 border-t border-black/10 bg-[#f0f2f5] px-3 py-2.5"
      >
        <input
          className="min-w-0 flex-1 rounded-full border border-[#0b3d32]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#12241f] outline-none placeholder:text-[#5a6e68] focus:border-[#0b3d32]"
          value={input}
          onInput={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          maxLength={500}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bingo-felt)] text-white shadow transition hover:bg-[var(--bingo-felt-deep)] disabled:opacity-40"
          aria-label="Enviar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );

  if (docked) return panel;

  return (
    <div className="fixed inset-0 z-[1000]">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Cerrar chat"
        onClick={toggleChat}
      />
      <div className="absolute inset-y-0 right-0 w-[min(20rem,calc(100vw-3.25rem))]">
        {panel}
      </div>
    </div>
  );
}
