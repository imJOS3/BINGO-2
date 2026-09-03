import { useState, useEffect } from "preact/hooks";
import { motion } from "framer-motion";
import { route } from "preact-router";
import useGameStore from "../../../../store/gameStore";
import useAuthStore from "../../../../store/authStore";
import useUsersGame from "../../../../store/usersGame";
import ModePatternPicker, {
  MODE_PATTERNS,
  emptyPattern,
  countActiveCells,
  clonePattern,
} from "./ModePatternPicker";
import JoiningOverlay from "../JoiningOverlay";
import { backdropClose } from "../../../utils/modal";

const gameModeMapping = Object.fromEntries(
  MODE_PATTERNS.map((m) => [m.key, m.id])
);

export default function CreateGameModal({ onClose }) {
  const [gameName, setGameName] = useState("");
  const [gameMode, setGameMode] = useState("Full Card");
  const [customCells, setCustomCells] = useState(emptyPattern());
  const [gameTime, setGameTime] = useState(3);
  const [isPublic, setIsPublic] = useState(true);
  const [joinKey, setJoinKey] = useState("");
  const [creatorId, setCreatorId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const { createGame, fetchGames, setSelectedGame } = useGameStore();
  const { userInfo } = useAuthStore();
  const { joinGame } = useUsersGame();

  useEffect(() => {
    if (userInfo) {
      setCreatorId(userInfo.id);
    }
  }, [userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!creatorId) {
      setFormError("No hay usuario en sesión");
      return;
    }

    if (gameMode === "Custom" && countActiveCells(customCells) < 1) {
      setFormError("En modo personalizado elige al menos una casilla, fila o columna");
      return;
    }

    if (!isPublic && joinKey.trim().length < 4) {
      setFormError("Crea una clave de 4 a 20 caracteres para la mesa privada");
      return;
    }

    const modeId = gameModeMapping[gameMode] || 1;

    const newGame = {
      game_name: gameName,
      game_mode_id: modeId,
      game_time: gameTime,
      game_status: "active",
      is_public: isPublic,
      join_key: isPublic ? undefined : joinKey.trim(),
      creator_id: creatorId,
      win_pattern:
        modeId === 9 ? clonePattern(customCells) : null,
    };

    setSubmitting(true);
    try {
      const createdGame = await createGame(newGame);
      setSelectedGame(createdGame);
      if (createdGame && createdGame.id) {
        await joinGame(createdGame.id, creatorId);
        await fetchGames();
        route(`/game/${createdGame.id}`);
      } else {
        setFormError("No se pudo crear la partida");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      setFormError("No se pudo crear la mesa. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bingo-felt-deep/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={backdropClose(onClose, submitting)}
    >
      <motion.div
        className="bingo-ticket relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.35)]"
        initial={{ scale: 0.9, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3 rounded-l-2xl bg-[var(--bingo-amber)]" />
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-5 pl-6 sm:p-6 sm:pl-7">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-bingo-amber/20" />
        <h2 className="relative font-bingo text-2xl text-[var(--bingo-felt)]">
          Nueva partida
        </h2>
        <p className="relative mb-5 text-sm text-bingo-ink/65">
          Configura tu mesa y elige el patrón ganador
        </p>

        <form onSubmit={handleSubmit} className="relative space-y-5 overflow-x-hidden">
          <div>
            <label
              className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--bingo-felt)]"
              htmlFor="gameName"
            >
              Nombre
            </label>
            <input
              id="gameName"
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full rounded-xl border-2 border-bingo-felt/15 bg-white/70 px-3 py-2.5 outline-none focus:border-[var(--bingo-felt)]"
              required
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--bingo-felt)]">
              Modo de juego
            </p>
            <ModePatternPicker
              value={gameMode}
              onChange={setGameMode}
              customCells={customCells}
              onCustomCellsChange={setCustomCells}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--bingo-felt)]"
              htmlFor="gameTime"
            >
              Tiempo (minutos)
            </label>
            <select
              id="gameTime"
              value={gameTime}
              onChange={(e) => setGameTime(Number(e.target.value))}
              className="w-full rounded-xl border-2 border-bingo-felt/15 bg-white/70 px-3 py-2.5 outline-none focus:border-[var(--bingo-felt)]"
            >
              {[3, 4, 5, 6].map((time) => (
                <option key={time} value={time}>
                  {time} minutos
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--bingo-felt)]">
              Visibilidad
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                  isPublic
                    ? "border-[var(--bingo-felt)] bg-[var(--bingo-felt)] text-white shadow-[3px_3px_0_#062820]"
                    : "border-bingo-felt/20 bg-white/50 text-[var(--bingo-felt)] hover:bg-white/80"
                }`}
              >
                <span className="block font-bingo text-sm leading-none">Pública</span>
                <span
                  className={`mt-1 block text-[0.7rem] leading-snug ${
                    isPublic ? "text-white/80" : "text-bingo-ink/55"
                  }`}
                >
                  Visible, entra cualquiera
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                  !isPublic
                    ? "border-[var(--bingo-amber)] bg-[var(--bingo-amber)] text-[var(--bingo-ink)] shadow-[3px_3px_0_#9a7510]"
                    : "border-bingo-felt/20 bg-white/50 text-[var(--bingo-felt)] hover:bg-white/80"
                }`}
              >
                <span className="block font-bingo text-sm leading-none">Privada</span>
                <span
                  className={`mt-1 block text-[0.7rem] leading-snug ${
                    !isPublic ? "text-bingo-ink/70" : "text-bingo-ink/55"
                  }`}
                >
                  Visible, pide tu clave
                </span>
              </button>
            </div>
            {!isPublic && (
              <div className="mt-3">
                <label
                  className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--bingo-felt)]"
                  htmlFor="joinKey"
                >
                  Clave de entrada
                </label>
                <input
                  id="joinKey"
                  type="text"
                  value={joinKey}
                  onChange={(e) => setJoinKey(e.target.value)}
                  minLength={4}
                  maxLength={20}
                  placeholder="Ej: bingo2026"
                  className="w-full rounded-xl border-2 border-bingo-felt/15 bg-white/70 px-3 py-2.5 outline-none focus:border-[var(--bingo-felt)]"
                  required
                />
                <p className="mt-1.5 text-xs text-bingo-ink/65">
                  Quien vea la mesa necesitará esta clave para entrar.
                </p>
              </div>
            )}
          </div>

          {formError && (
            <p className="rounded-lg bg-bingo-red/10 px-3 py-2 text-center text-sm font-medium text-[var(--bingo-red)]">
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border-2 border-bingo-felt/30 px-5 py-2.5 font-semibold text-[var(--bingo-felt)] transition hover:bg-white/40 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[var(--bingo-red)] px-5 py-2.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
            >
              {submitting ? "Abriendo tu mesa..." : "Crear mesa"}
            </button>
          </div>
        </form>
        </div>
        {submitting && (
          <JoiningOverlay
            title="Abriendo tu mesa"
            subtitle="Creando la partida y sentándote en ella…"
          />
        )}
      </motion.div>
    </motion.div>
  );
}
