import { useState, useEffect } from "preact/hooks";
import { connectSocket } from "../../utils/socket";
import { route } from "preact-router";
import { motion } from "framer-motion";
import BingoCardPlaying from "../../components/game/scenery/cardBingo/BIngoCArdPlaying";
import GameHud from "../../components/game/scenery/gameData/GameHud";
import GameMode from "../../components/game/scenery/gameData/gameMode";
import PatternProgress from "../../components/game/scenery/gameData/PatternProgress";
import {
  BoardIcon,
  ChartIcon,
  ChatIcon,
  MenuIcon,
  UsersIcon,
} from "../../components/game/scenery/gameData/icons";
import { getModeLabel } from "../../components/game/create/ModePatternPicker";
import WrapperStructureBall from "../../components/game/scenery/structureBall/wrapperStructureBall";
import WrapperSetting from "../../components/game/scenery/setting/wrapperSetting";
import Chat from "../../components/chat/chat";
import SideDrawer from "../../components/game/scenery/gameData/SideDrawer";
import useGameStore from "../../../store/gameStore";
import useCalledNumbersStore from "../../../store/useCalledNumberStore";
import useAuthStore from "../../../store/authStore";
import usePresenceStore from "../../../store/presenceStore";
import useUsersGame from "../../../store/usersGame";
import RestartRoundModal from "../../components/game/create/RestartRoundModal";
import GamePlayers from "../../components/game/seeGames/InGameData/gamePlayer";
import CasinoStats from "../../components/game/scenery/stats/CasinoStats";
import TableToasts from "../../components/game/TableToasts";
import SpectatorQueue from "../../components/game/scenery/cardBingo/SpectatorQueue";
import ConsolationRoulette from "../../components/game/scenery/cardBingo/ConsolationRoulette";
import JoinKeyGate from "../../components/game/searchGame/JoinKeyGate";

export default function Playing({ id }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState(null);
  const [unreadChat, setUnreadChat] = useState(0);
  const [showRestart, setShowRestart] = useState(false);
  const [seatChecked, setSeatChecked] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [rafflePayload, setRafflePayload] = useState(null);
  const [endedByRaffle, setEndedByRaffle] = useState(false);
  const [stayAtTable, setStayAtTable] = useState(false);
  const gameId = id;
  const {
    selectedGame,
    winner,
    setWinner,
    setSelectedGame,
    fetchGameById,
    clearWinner,
    applyRestart,
  } = useGameStore();
  const {
    calledNumbers,
    prepareForGame,
    loadCalledNumbers,
    startNewRound,
    applyCalledNumber,
  } = useCalledNumbersStore();
  const { userInfo } = useAuthStore();
  const onlineCount = usePresenceStore((s) => s.onlineCount);
  const seatedCount = Math.max(onlineCount, userInfo?.id ? 1 : 0);
  const ensureSeat = useUsersGame((s) => s.ensureSeat);
  const spectatorGameId = useUsersGame((s) => s.spectatorGameId);
  const setSpectatorSeat = useUsersGame((s) => s.setSpectatorSeat);
  const setEliminatedSeat = useUsersGame((s) => s.setEliminatedSeat);
  const inQueue =
    spectatorGameId != null && String(spectatorGameId) === String(gameId);

  useEffect(() => {
    if (gameId) {
      prepareForGame(gameId);
      loadCalledNumbers(gameId);
      clearWinner();
      fetchGameById(gameId, userInfo?.id);
    }
  }, [gameId]);

  // Hasta saber si tengo silla o estoy en cola no se pide cartón.
  useEffect(() => {
    if (!gameId) return;
    if (!userInfo?.id) {
      setSeatChecked(true);
      return;
    }
    setSeatChecked(false);
    setNeedsKey(false);
    void ensureSeat(gameId, userInfo.id).then((data) => {
      if (!data) setNeedsKey(true);
      setSeatChecked(true);
    });
  }, [gameId, userInfo?.id]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL;
    if (!socketUrl || !gameId) return;

    const socket = connectSocket();

    const seatIfPromoted = (payload) => {
      if (!userInfo?.id) return;
      const ids = payload?.promoted || payload?.userIds || [];
      const mine = ids.some((uid) => String(uid) === String(userInfo.id));
      if (mine) {
        setSpectatorSeat(null);
        void ensureSeat(gameId, userInfo.id);
      }
    };

    socket.on("gameWon", (payload) => {
      if (String(payload.gameId) !== String(gameId)) return;
      if (payload.winner) setWinner(payload.winner);
      if (payload.game) setSelectedGame(payload.game);
      setStayAtTable(false);
      seatIfPromoted(payload);
    });

    socket.on("gameRestarted", (payload) => {
      if (String(payload.gameId) !== String(gameId)) return;
      if (payload.game) applyRestart(payload.game);
      setShowRestart(false);
      setRafflePayload(null);
      setEndedByRaffle(false);
      setStayAtTable(false);
      setEliminatedSeat(null);
      if (payload.resetNumbers) {
        startNewRound(gameId);
        loadCalledNumbers(gameId);
      }
    });

    socket.on("roundRaffle", (payload) => {
      if (String(payload.gameId) !== String(gameId)) return;
      if (payload.game) setSelectedGame(payload.game);
      setRafflePayload(payload);
      seatIfPromoted(payload);
    });

    socket.on("playerEliminated", (payload) => {
      if (String(payload.gameId) !== String(gameId)) return;
      if (
        userInfo?.id != null &&
        String(payload.userId) === String(userInfo.id)
      ) {
        setEliminatedSeat(gameId);
      }
    });

    socket.on("numberCalled", (payload) => {
      if (!payload?.number) return;
      if (String(payload.gameId) !== String(gameId)) return;
      applyCalledNumber(gameId, payload.number, payload.letter);
    });

    socket.on("spectatorsPromoted", (payload) => {
      if (String(payload?.gameId) !== String(gameId)) return;
      if (!userInfo?.id) return;
      const mine = (payload.userIds || []).some(
        (uid) => String(uid) === String(userInfo.id)
      );
      if (mine) {
        setSpectatorSeat(null);
        void ensureSeat(gameId, userInfo.id);
      }
    });

    socket.on("gameClosed", (payload) => {
      if (String(payload?.gameId) !== String(gameId)) return;
      route("/game");
    });

    return () => {
      socket.off("gameWon");
      socket.off("gameRestarted");
      socket.off("roundRaffle");
      socket.off("playerEliminated");
      socket.off("numberCalled");
      socket.off("spectatorsPromoted");
      socket.off("gameClosed");
      socket.close();
    };
  }, [gameId, userInfo?.id]);

  useEffect(() => {
    if (selectedGame?.game_status === "completed" && selectedGame.winner_nickname) {
      setWinner({
        id: selectedGame.winner_id,
        nickname: selectedGame.winner_nickname,
      });
    }
  }, [selectedGame?.game_status, selectedGame?.winner_nickname]);

  const winnerName = winner?.nickname || selectedGame?.winner_nickname;
  const winnerId = winner?.id ?? selectedGame?.winner_id;
  const showWinnerModal = winnerName && !rafflePayload && !stayAtTable;
  const iWon =
    userInfo?.id != null &&
    winnerId != null &&
    String(userInfo.id) === String(winnerId);
  const isHost =
    userInfo?.id != null &&
    selectedGame?.creator_id != null &&
    String(userInfo.id) === String(selectedGame.creator_id);

  const togglePanel = (id) => {
    if (openPanel === id) {
      setOpenPanel(null);
      return;
    }
    if (id === "chat") setUnreadChat(0);
    setOpenPanel(id);
  };

  const closePanel = () => setOpenPanel(null);
  const panelBtn = (id) =>
    openPanel === id
      ? "border-[var(--bingo-amber)] bg-[var(--bingo-amber)]/20"
      : "border-white/20 bg-white/10 hover:bg-white/20";

  return (
    <div className="bingo-felt relative flex h-full max-h-full w-full flex-col overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-bingo-amber/25 blur-3xl" />
        <div className="absolute bottom-16 right-8 h-56 w-56 rounded-full bg-bingo-red/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 gap-1.5 p-1.5 pb-[4.25rem] sm:gap-3 sm:p-3 lg:pb-3">
        <aside className="hidden min-h-0 w-[11.25rem] shrink-0 flex-col gap-2 overflow-y-auto no-scrollbar lg:flex">
          <div className="rounded-2xl border border-white/15 bg-black/30 p-2.5">
            <GameMode
              gameModeId={selectedGame?.game_mode_id}
              pattern={selectedGame?.win_pattern}
              size="sm"
            />
          </div>

          {!inQueue && <PatternProgress />}

          <button
            type="button"
            title={openPanel === "players" ? "Cerrar jugadores" : "Ver quién está en la mesa"}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${panelBtn("players")}`}
            onClick={() => togglePanel("players")}
          >
            <UsersIcon size={16} className="text-[#3ecf8e]" />
            <span className="flex-1 text-sm font-bold text-white">Jugadores</span>
            <span className="font-bingo text-sm text-[var(--bingo-amber)]">
              {seatedCount}
            </span>
          </button>

          <button
            type="button"
            title={openPanel === "stats" ? "Cerrar estadísticas" : "Ver tablero y estadísticas"}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${panelBtn("stats")}`}
            onClick={() => togglePanel("stats")}
          >
            <ChartIcon size={16} className="text-sky-300" />
            <span className="flex-1 text-sm font-bold text-white">Tablero</span>
          </button>

          <button
            type="button"
            title={openPanel === "chat" ? "Cerrar chat" : "Abrir chat"}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${panelBtn("chat")}`}
            onClick={() => togglePanel("chat")}
          >
            <ChatIcon size={16} className="text-[var(--bingo-amber)]" />
            <span className="flex-1 text-sm font-bold text-white">Chat</span>
            {unreadChat > 0 && (
              <span className="rounded-full bg-[var(--bingo-red)] px-1.5 text-[0.65rem] font-bold">
                {unreadChat > 9 ? "9+" : unreadChat}
              </span>
            )}
          </button>

          <button
            type="button"
            title="Opciones de la partida"
            className="mt-auto flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--bingo-amber)] px-3 py-2.5 font-bingo text-sm text-[var(--bingo-ink)] shadow-[0_3px_0_rgba(0,0,0,0.35)] transition hover:brightness-110"
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon size={16} />
            Menú
          </button>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
          <GameHud
            paused={!!winnerName || !!rafflePayload || selectedGame?.game_status === "completed"}
            onOpenStats={() => togglePanel("stats")}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            {!seatChecked ? (
              <p className="rounded-xl bg-white/10 px-4 py-6 text-center text-sm text-white/75">
                Buscando tu lugar en la mesa...
              </p>
              ) : inQueue ? (
                <SpectatorQueue gameId={gameId} roundOver={!!winnerName} />
              ) : (
              <BingoCardPlaying
                key={selectedGame?.started_at || gameId}
                gameId={gameId}
              />
            )}
          </motion.div>
        </main>

        <SideDrawer open={!!openPanel} onClose={closePanel}>
          {openPanel === "chat" && (
            <Chat
              isOpen
              toggleChat={closePanel}
              gameId={gameId}
              docked
            />
          )}
          {openPanel === "players" && (
            <GamePlayers docked onClose={closePanel} />
          )}
          {openPanel === "stats" && (
            <CasinoStats docked onClose={closePanel} />
          )}
        </SideDrawer>

        <aside className="h-full w-[5rem] shrink-0 sm:w-[6.5rem] lg:w-[8rem]">
          <WrapperStructureBall
            gameId={gameId}
            roundKey={selectedGame?.started_at}
          />
        </aside>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[90] flex items-end justify-between gap-2 px-3 lg:hidden"
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
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold backdrop-blur-sm ${
              openPanel === "players"
                ? "border-[var(--bingo-amber)] bg-[var(--bingo-amber)]/25 text-white"
                : "border-white/25 bg-black/65 text-white"
            }`}
            onClick={() => togglePanel("players")}
          >
            <UsersIcon size={17} className="text-[#3ecf8e]" />
            {seatedCount}
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold backdrop-blur-sm ${
              openPanel === "stats"
                ? "border-[var(--bingo-amber)] bg-[var(--bingo-amber)]/25 text-white"
                : "border-white/25 bg-black/65 text-white"
            }`}
            onClick={() => togglePanel("stats")}
          >
            <BoardIcon size={17} className="text-sky-300" />
            Tablero
          </button>
          <button
            type="button"
            className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold backdrop-blur-sm ${
              openPanel === "chat"
                ? "border-[var(--bingo-amber)] bg-[var(--bingo-amber)]/25 text-white"
                : "border-white/25 bg-black/65 text-white"
            }`}
            onClick={() => togglePanel("chat")}
          >
            <ChatIcon size={17} className="text-[var(--bingo-amber)]" />
            Chat
            {unreadChat > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--bingo-red)] px-1 text-[0.6rem] font-bold">
                {unreadChat > 9 ? "9+" : unreadChat}
              </span>
            )}
          </button>
        </div>
      </div>

      <WrapperSetting isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {needsKey && selectedGame?.is_public === false && (
        <JoinKeyGate
          game={selectedGame}
          onJoined={() => setNeedsKey(false)}
        />
      )}
      <TableToasts
        gameId={gameId}
        chatOpen={openPanel === "chat"}
        onUnreadChat={() => setUnreadChat((n) => n + 1)}
        onOpenChat={() => {
          setUnreadChat(0);
          setOpenPanel("chat");
        }}
      />

      {rafflePayload && (
        <ConsolationRoulette
          payload={rafflePayload}
          onDone={() => {
            if (rafflePayload.winner) setWinner(rafflePayload.winner);
            if (rafflePayload.game) setSelectedGame(rafflePayload.game);
            setEndedByRaffle(true);
            setRafflePayload(null);
          }}
        />
      )}

      {showWinnerModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-bingo-felt-deep/80 p-4 backdrop-blur-sm">
          <motion.div
            className="bingo-ticket w-full max-w-md rounded-2xl p-8 text-center shadow-[10px_10px_0_rgba(0,0,0,0.35)]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-bingo-felt/55">
              {endedByRaffle ? "Ruleta de consolación" : "Partida terminada"}
            </p>
            <h2 className="mt-2 font-bingo text-4xl text-[var(--bingo-red)]">
              {iWon
                ? endedByRaffle
                  ? "¡Ganaste el sorteo!"
                  : "¡Ganaste!"
                : endedByRaffle
                  ? "¡Sorteo!"
                  : "¡Bingo!"}
            </h2>
            <p className="mt-3 text-lg text-[var(--bingo-ink)]">
              {endedByRaffle ? "Ganador del sorteo: " : "Ganador: "}
              <span className="font-bingo text-[var(--bingo-felt)]">
                {winnerName}
              </span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-xl bg-white/60 px-3 py-2">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-bingo-felt/55">
                  Bolas cantadas
                </p>
                <p className="font-bingo text-lg text-[var(--bingo-felt)]">
                  {calledNumbers.length}/75
                </p>
              </div>
              <div className="rounded-xl bg-white/60 px-3 py-2">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-bingo-felt/55">
                  Figura
                </p>
                <p className="truncate font-bingo text-lg text-[var(--bingo-felt)]">
                  {getModeLabel(selectedGame?.game_mode_id)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-bingo-ink/60">
              La mesa sigue abierta: puede entrar gente y quienes estaban en cola
              ya tienen silla.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-[var(--bingo-felt)] px-6 py-3 font-bingo text-sm text-white shadow-[3px_3px_0_#062820] transition hover:brightness-110"
              onClick={() => setStayAtTable(true)}
            >
              Seguir en la mesa
            </button>
            {isHost ? (
              <button
                type="button"
                className="mt-3 w-full rounded-xl bg-[var(--bingo-amber)] px-6 py-3 font-bingo text-sm text-[var(--bingo-ink)] shadow-[3px_3px_0_#9a7510] transition hover:brightness-110"
                onClick={() => setShowRestart(true)}
              >
                Siguiente ronda / otra figura
              </button>
            ) : (
              <p className="mt-3 text-sm text-bingo-ink/60">
                Esperando a que el anfitrión abra la siguiente ronda.
              </p>
            )}
            <button
              type="button"
              className="mt-3 w-full rounded-xl border-2 border-bingo-felt/25 bg-transparent px-6 py-2.5 font-semibold text-[var(--bingo-felt)] transition hover:bg-white/40"
              onClick={() => route("/game")}
            >
              Volver a partidas
            </button>
          </motion.div>
        </div>
      )}
      {showRestart && selectedGame && (
        <RestartRoundModal
          game={selectedGame}
          onClose={() => setShowRestart(false)}
        />
      )}
    </div>
  );
}
