import { useState } from "preact/hooks";
import { motion } from "framer-motion";
import useGameStore from "../../../../../store/gameStore";
import BingoCard from "../../scenery/cardBingo/BingoCard";
import TableGameData from "./tableGameData";
import useUsersGame from "../../../../../store/usersGame";
import useAuthStore from "../../../../../store/authStore";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import usePresenceStore from "../../../../../store/presenceStore";
import GamePlayers from "./gamePlayer";
import { route } from "preact-router";
import RestartRoundModal from "../../create/RestartRoundModal";
import EditGameModal from "../../create/EditGameModal";
import LeaveConfirmModal from "../../scenery/setting/LeaveConfirmModal";

export default function GameData() {
  const { selectedGame, clearSelectedGame, startGame } = useGameStore();
  const { userInfo } = useAuthStore();
  const { leaveGame, fetchPlayers, loading: leaving } = useUsersGame();
  const { resetCalledNumbers } = useCalledNumbersStore();
  const onlineCount = usePresenceStore((s) => s.onlineCount);
  const seatedCount = Math.max(onlineCount, userInfo?.id ? 1 : 0);
  const [showPlayers, setShowPlayers] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  const isHost =
    userInfo?.id != null &&
    selectedGame?.creator_id != null &&
    String(userInfo.id) === String(selectedGame.creator_id);

  const canEdit = isHost && selectedGame?.game_status === "active";

  const handleLeaveGame = async () => {
    setLeaveError(null);
    try {
      if (selectedGame?.id && userInfo?.id) {
        await leaveGame(selectedGame.id, userInfo.id);
      }
      clearSelectedGame();
      setShowLeaveConfirm(false);
      route("/game");
    } catch (error) {
      console.error("Error al salir del juego:", error);
      setLeaveError("No se pudo salir de la partida. Inténtalo de nuevo.");
    }
  };

  const handleShowPlayers = async () => {
    if (!selectedGame?.id) return;
    await fetchPlayers(selectedGame.id);
    setShowPlayers(true);
  };

  const handleStartGame = async () => {
    if (!selectedGame?.id || !userInfo?.id) return;

    setStarting(true);
    try {
      await startGame(selectedGame.id, userInfo.id);
      resetCalledNumbers();
      route(`/playing/${selectedGame.id}`);
    } catch (error) {
      console.error("Error al iniciar el juego:", error);
      alert("No se pudo iniciar la partida. Inténtalo de nuevo.");
    } finally {
      setStarting(false);
    }
  };

  const startControl = isHost ? (
    selectedGame?.game_status === "completed" ? (
      <button
        type="button"
        className="w-full rounded-xl bg-[var(--bingo-amber)] px-4 py-3 font-bingo text-base text-[var(--bingo-ink)] shadow-[3px_3px_0_#9a7510] transition hover:brightness-105 sm:text-lg"
        onClick={() => setShowRestart(true)}
      >
        Siguiente ronda
      </button>
    ) : (
      <button
        type="button"
        className="w-full rounded-xl bg-[var(--bingo-amber)] px-4 py-3 font-bingo text-base text-[var(--bingo-ink)] shadow-[3px_3px_0_#9a7510] transition hover:brightness-105 disabled:opacity-60 sm:text-lg"
        onClick={handleStartGame}
        disabled={starting || selectedGame?.game_status === "in_progress"}
      >
        {starting ? "Iniciando..." : "¡Empezar partida!"}
      </button>
    )
  ) : (
    <div className="w-full rounded-xl border border-dashed border-white/30 bg-black/20 px-4 py-2.5 text-center">
      <p className="font-bingo text-base text-white">Esperando al host</p>
      <p className="text-xs text-white/65">
        La partida arranca cuando el anfitrión pulse Empezar.
      </p>
    </div>
  );

  const sideActions = (
    <>
      {canEdit && (
        <button
          type="button"
          className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-left font-semibold text-white transition hover:bg-white/15"
          onClick={() => setShowEdit(true)}
        >
          <span className="block font-bingo text-sm">Configurar mesa</span>
          <span className="mt-0.5 block text-[0.7rem] text-white/65">
            Modo, tiempo y nombre
          </span>
        </button>
      )}
      <button
        type="button"
        className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-left font-semibold text-white transition hover:bg-white/15"
        onClick={handleShowPlayers}
      >
        <span className="block font-bingo text-sm">Jugadores</span>
        <span className="mt-0.5 block text-[0.7rem] text-white/65">
          {seatedCount} en la mesa
        </span>
      </button>
      <button
        type="button"
        className="w-full rounded-xl bg-[var(--bingo-red)] px-3 py-2.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 md:col-span-2"
        onClick={() => {
          setLeaveError(null);
          setShowLeaveConfirm(true);
        }}
      >
        Salir de la mesa
      </button>
    </>
  );

  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col px-3 pt-3 sm:px-5 md:h-full md:min-h-0"
      style={{ paddingBottom: "max(5.5rem, calc(4.5rem + env(safe-area-inset-bottom)))" }}
    >
      <motion.div
        className="mb-2 flex shrink-0 items-center justify-between gap-2"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--bingo-amber)]">
            Sala de espera
          </p>
          <h1 className="font-bingo text-xl leading-none text-white sm:text-3xl">
            Prepara tu cartón
          </h1>
        </div>
        {isHost && (
          <span className="shrink-0 rounded-full bg-[var(--bingo-amber)] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--bingo-ink)] sm:px-3 sm:text-xs">
            Eres el host
          </span>
        )}
      </motion.div>

      <div className="flex flex-col gap-3 md:grid md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-stretch">
        <motion.div
          className="flex flex-col gap-2 md:min-h-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <TableGameData />
          <div className="hidden gap-2 md:grid md:grid-cols-2">{sideActions}</div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-2 md:min-h-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex w-full justify-center md:min-h-0 md:flex-1">
            <BingoCard compact />
          </div>

          <p className="shrink-0 text-center text-xs text-white/70">
            Pulsa <span className="font-bold text-[var(--bingo-amber)]">+</span>{" "}
            para cambiar tu cartón.
          </p>

          <div className="w-full max-w-md shrink-0">{startControl}</div>
        </motion.div>

        <div className="flex flex-col gap-2 md:hidden">{sideActions}</div>
      </div>

      {showPlayers && <GamePlayers onClose={() => setShowPlayers(false)} />}
      {showEdit && selectedGame && (
        <EditGameModal game={selectedGame} onClose={() => setShowEdit(false)} />
      )}
      {showRestart && selectedGame && (
        <RestartRoundModal
          game={selectedGame}
          onClose={() => setShowRestart(false)}
          onStarted={() => route(`/playing/${selectedGame.id}`)}
        />
      )}
      {showLeaveConfirm && (
        <LeaveConfirmModal
          gameName={selectedGame?.game_name}
          gameStatus={selectedGame?.game_status || "active"}
          loading={leaving}
          error={leaveError}
          onCancel={() => setShowLeaveConfirm(false)}
          onConfirm={handleLeaveGame}
        />
      )}
    </div>
  );
}
