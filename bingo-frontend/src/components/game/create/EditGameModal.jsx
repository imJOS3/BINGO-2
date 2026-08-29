import { useState } from "preact/hooks";
import { motion } from "framer-motion";
import useGameStore from "../../../../store/gameStore";
import useAuthStore from "../../../../store/authStore";
import ModePatternPicker, {
  MODE_PATTERNS,
  emptyPattern,
  countActiveCells,
  clonePattern,
  getModeKey,
  getPatternForGameMode,
} from "./ModePatternPicker";
import { backdropClose } from "../../../utils/modal";

const gameModeMapping = Object.fromEntries(
  MODE_PATTERNS.map((m) => [m.key, m.id])
);

export default function EditGameModal({ game, onClose }) {
  const [gameName, setGameName] = useState(game?.game_name || "");
  const [gameMode, setGameMode] = useState(getModeKey(game?.game_mode_id));
  const [customCells, setCustomCells] = useState(
    clonePattern(
      getPatternForGameMode(game?.game_mode_id, game?.win_pattern) || emptyPattern()
    )
  );
  const [gameTime, setGameTime] = useState(Number(game?.game_time) || 3);
  const [isPublic, setIsPublic] = useState(game?.is_public !== false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const { updateGame } = useGameStore();
  const { userInfo } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!userInfo?.id || !game?.id) {
      setFormError("No hay usuario o partida");
      return;
    }

    if (gameMode === "Custom" && countActiveCells(customCells) < 1) {
      setFormError("En modo personalizado elige al menos una casilla, fila o columna");
      return;
    }

    const modeId = gameModeMapping[gameMode] || 1;

    setSubmitting(true);
    try {
      await updateGame(game.id, userInfo.id, {
        game_name: gameName.trim(),
        game_mode_id: modeId,
        game_time: gameTime,
        is_public: isPublic,
        win_pattern: modeId === 9 ? clonePattern(customCells) : null,
      });
      onClose();
    } catch (error) {
      setFormError("No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-bingo-felt-deep/80 p-4 backdrop-blur-sm"
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
        <h2 className="relative font-bingo text-2xl text-[var(--bingo-felt)]">
          Configurar mesa
        </h2>
        <p className="relative mb-5 text-sm text-bingo-ink/65">
          Cambia el nombre, el modo, el tiempo o si la mesa es pública.
        </p>

        <form onSubmit={handleSubmit} className="relative space-y-5 overflow-x-hidden">
          <div>
            <label
              className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--bingo-felt)]"
              htmlFor="editGameName"
            >
              Nombre
            </label>
            <input
              id="editGameName"
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
              htmlFor="editGameTime"
            >
              Tiempo (minutos)
            </label>
            <select
              id="editGameTime"
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
                  Visible en el listado
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                  !isPublic
                    ? "border-[var(--bingo-felt)] bg-[var(--bingo-felt)] text-white shadow-[3px_3px_0_#062820]"
                    : "border-bingo-felt/20 bg-white/50 text-[var(--bingo-felt)] hover:bg-white/80"
                }`}
              >
                <span className="block font-bingo text-sm leading-none">Privada</span>
                <span
                  className={`mt-1 block text-[0.7rem] leading-snug ${
                    !isPublic ? "text-white/80" : "text-bingo-ink/55"
                  }`}
                >
                  Solo con código
                </span>
              </button>
            </div>
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
              className="rounded-xl bg-[var(--bingo-felt)] px-5 py-2.5 font-bingo text-sm text-white shadow-[3px_3px_0_#062820] transition hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
