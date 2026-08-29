import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import GameData from "../../../components/game/seeGames/InGameData/GameData";
import Chat from "../../../components/chat/chat";
import { ChatIcon, MenuIcon } from "../../../components/game/scenery/gameData/icons";
import WrapperSetting from "../../../components/game/scenery/setting/wrapperSetting";
import TableToasts from "../../../components/game/TableToasts";
import { io } from "socket.io-client";
import useGameStore from "../../../../store/gameStore";
import useAuthStore from "../../../../store/authStore";
import useUsersGame from "../../../../store/usersGame";

const socket = io(import.meta.env.VITE_API_URL);

export default function GameID({ id }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { fetchGameById, selectedGame, setSelectedGame } = useGameStore();
  const userId = useAuthStore((s) => s.userInfo?.id);
  const ensureSeat = useUsersGame((s) => s.ensureSeat);

  useEffect(() => {
    if (!id) return;
    fetchGameById(id);
  }, [id]);

  useEffect(() => {
    if (!id || !userId) return;
    void ensureSeat(id, userId);
  }, [id, userId]);

  useEffect(() => {
    const gid = selectedGame?.id || id;
    if (!gid) return;
    if (String(selectedGame?.id) !== String(id) && selectedGame?.id) return;
    if (selectedGame?.game_status === "in_progress") {
      route(`/playing/${gid}`);
    }
  }, [id, selectedGame?.id, selectedGame?.game_status]);

  useEffect(() => {
    socket.on("notification", (notification) => {
      const notifId = Date.now();
      setNotifications((prev) => [...prev, { ...notification, id: notifId }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      }, 10000);
    });

    const enterIfStarted = (payload) => {
      if (!payload?.game) return;
      const gameId = payload.gameId || payload.game.id;
      if (String(gameId) !== String(id || selectedGame?.id)) return;
      setSelectedGame(payload.game);
      if (payload.game.game_status === "in_progress") {
        route(`/playing/${payload.game.id || gameId}`);
      }
    };

    socket.on("gameStarted", enterIfStarted);
    socket.on("gameUpdated", enterIfStarted);
    socket.on("gameRestarted", enterIfStarted);
    socket.on("gameClosed", (payload) => {
      const gameId = payload?.gameId || payload?.game?.id;
      if (String(gameId) !== String(id || selectedGame?.id)) return;
      route("/game");
    });

    return () => {
      socket.off("notification");
      socket.off("gameStarted");
      socket.off("gameUpdated");
      socket.off("gameRestarted");
      socket.off("gameClosed");
    };
  }, [id, selectedGame?.id]);

  return (
    <div className="bingo-felt relative flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-bingo-amber/20 blur-3xl" />
        <div className="absolute -right-20 bottom-24 h-72 w-72 rounded-full bg-bingo-red/15 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto md:overflow-hidden">
        <GameData />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[90] flex items-end justify-between gap-2 px-3"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-[var(--bingo-amber)] px-3 py-2.5 font-bingo text-sm text-[var(--bingo-ink)] shadow-[0_4px_0_rgba(0,0,0,0.35)]"
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon size={17} />
            Menú
          </button>
          {!isChatOpen && (
            <button
              type="button"
              className="relative flex items-center gap-1.5 rounded-xl border border-white/25 bg-black/65 px-3 py-2.5 text-sm font-bold text-white backdrop-blur-sm"
              onClick={() => {
                setUnreadChat(0);
                setIsChatOpen(true);
              }}
            >
              <ChatIcon size={17} />
              Chat
              {unreadChat > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--bingo-red)] px-1 text-[0.6rem] font-bold text-white">
                  {unreadChat > 9 ? "9+" : unreadChat}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {isChatOpen && (
        <Chat
          isOpen={isChatOpen}
          toggleChat={() => setIsChatOpen(false)}
          gameId={id || selectedGame?.id}
        />
      )}

      <WrapperSetting isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <TableToasts
        gameId={id || selectedGame?.id}
        chatOpen={isChatOpen}
        onUnreadChat={() => setUnreadChat((n) => n + 1)}
        onOpenChat={() => {
          setUnreadChat(0);
          setIsChatOpen(true);
        }}
      />

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex max-w-xs items-center justify-between rounded-xl bg-[var(--bingo-felt)] px-4 py-3 text-sm text-white shadow-lg ring-1 ring-white/20"
          >
            <p>{notif.message}</p>
            <button
              type="button"
              onClick={() =>
                setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
              }
              className="ml-3 text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
