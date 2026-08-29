import { useState } from "preact/hooks";
import { motion } from "framer-motion";
import { route } from "preact-router";
import useUsersGame from "../../../../store/usersGame";
import useAuthStore from "../../../../store/authStore";
import useGameStore from "../../../../store/gameStore";
import JoiningOverlay from "../JoiningOverlay";
import { backdropClose } from "../../../utils/modal";

const STATUS_LABEL = {
  active: "Abierta",
  in_progress: "En juego",
  completed: "Finalizada",
};

export default function OneGame({ game, onClose }) {
  const { joinGame } = useUsersGame();
  const { userInfo } = useAuthStore();
  const { setSelectedGame } = useGameStore();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);

  const handleGame = async () => {
    if (joining) return;
    if (!userInfo?.id) {
      setJoinError("No se pudo unir a la mesa. Inténtalo de nuevo.");
      return;
    }
    // El resto de comprobaciones las hace el servidor, que es quien sabe
    // cuánta gente sigue conectada en la mesa.
    if (game.game_status === "completed") {
      setJoinError("Esta mesa ya no está disponible.");
      return;
    }
    setJoinError(null);
    setJoining(true);
    try {
      const joined = await joinGame(game.id, userInfo.id);
      const table = joined?.game || game;
      setSelectedGame(table);
      if (table.game_status === "in_progress") {
        route(`/playing/${table.id}`);
      } else {
        route(`/game/${table.id}`);
      }
    } catch (error) {
      console.log(error);
      setJoining(false);
      setJoinError("No se pudo unir a la mesa. Inténtalo de nuevo.");
    }
  };

  const started = game.game_status === "in_progress";
  const joinLabel = started ? "Ver la partida" : "Unirse a la mesa";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bingo-felt-deep/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={backdropClose(onClose, joining)}
    >
      <motion.div
        className="bingo-ticket relative w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-[8px_8px_0_rgba(0,0,0,0.35)]"
        initial={{ scale: 0.9, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute left-0 top-0 h-full w-3 bg-[var(--bingo-red)]" />

        <p className="pl-3 text-xs font-semibold uppercase tracking-[0.2em] text-bingo-felt/55">
          Ticket de mesa
        </p>
        <h2 className="mt-1 pl-3 font-bingo text-3xl text-[var(--bingo-felt)]">
          {game.game_name}
        </h2>

        <div className="mt-5 space-y-2 rounded-xl bg-white/50 p-4 text-sm pl-3">
          <p>
            <span className="font-semibold text-[var(--bingo-felt)]">Código:</span>{" "}
            <span className="tracking-[0.2em]">{game.room_code || "—"}</span>
          </p>
          <p>
            <span className="font-semibold text-[var(--bingo-felt)]">Visibilidad:</span>{" "}
            {game.is_public === false ? "Privada" : "Pública"}
          </p>
          <p>
            <span className="font-semibold text-[var(--bingo-felt)]">Estado:</span>{" "}
            {STATUS_LABEL[game.game_status] || game.game_status}
          </p>
          <p>
            <span className="font-semibold text-[var(--bingo-felt)]">Creada:</span>{" "}
            {game.created_at
              ? new Date(game.created_at).toLocaleDateString("es-ES")
              : "—"}
          </p>
          {game.ended_at && (
            <p>
              <span className="font-semibold text-[var(--bingo-felt)]">Finalizada:</span>{" "}
              {new Date(game.ended_at).toLocaleDateString("es-ES")}
            </p>
          )}
          <p>
            <span className="font-semibold text-[var(--bingo-felt)]">Jugadores:</span>{" "}
            {game.online_count ?? game.user_count ?? 0}
          </p>
        </div>

        {started && (
          <p className="mt-4 rounded-lg border-2 border-dashed border-bingo-felt/25 bg-white/40 px-3 py-2 text-sm text-[var(--bingo-ink)]">
            La ronda ya empezó: entras a mirar y quedas en cola para jugar la
            siguiente.
          </p>
        )}

        {joinError && (
          <p className="mt-4 rounded-lg bg-bingo-red/10 px-3 py-2 text-center text-sm font-medium text-[var(--bingo-red)]">
            {joinError}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={joining}
            className="rounded-xl border-2 border-bingo-felt/30 px-5 py-2.5 font-semibold text-[var(--bingo-felt)] transition hover:bg-white/40 disabled:opacity-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleGame}
            disabled={joining}
            className="rounded-xl bg-[var(--bingo-red)] px-5 py-2.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
          >
            {joining ? (started ? "Entrando..." : "Uniéndote...") : joinLabel}
          </button>
        </div>

        {joining && (
          <JoiningOverlay
            title={started ? "Entrando a mirar" : "Uniendo a la mesa"}
            subtitle={
              started
                ? "La ronda va en marcha: quedas en cola para la próxima…"
                : "Espera un momento, te estamos sentando…"
            }
          />
        )}
      </motion.div>
    </motion.div>
  );
}
