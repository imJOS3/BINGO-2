import { useState, useEffect } from "preact/hooks";
import { motion } from "framer-motion";
import ModePatternPicker, {
  MODE_PATTERNS,
  emptyPattern,
  clonePattern,
  countActiveCells,
  getModeKey,
  getPatternForGameMode,
} from "./ModePatternPicker";
import useGameStore from "../../../../store/gameStore";
import useAuthStore from "../../../../store/authStore";
import useUsersGame from "../../../../store/usersGame";
import useCalledNumbersStore from "../../../../store/useCalledNumberStore";
import { backdropClose } from "../../../utils/modal";

const gameModeMapping = Object.fromEntries(
  MODE_PATTERNS.map((m) => [m.key, m.id])
);

const suggestedNextKey = (game) => {
  const currentId = Number(game?.game_mode_id) || 1;
  if (currentId !== 1) return "Full Card";
  return "Right Diagonal";
};

export default function RestartRoundModal({ game, onClose, onStarted }) {
  const currentKey = getModeKey(game?.game_mode_id);
  const [style, setStyle] = useState("continue");
  const [gameMode, setGameMode] = useState(suggestedNextKey(game));
  const [customCells, setCustomCells] = useState(
    clonePattern(getPatternForGameMode(game?.game_mode_id, game?.win_pattern))
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const { restartGame } = useGameStore();
  const { userInfo } = useAuthStore();
  const queued = useUsersGame(
    (s) => (s.players || []).filter((p) => p.is_spectator).length
  );
  const { loadCalledNumbers, startNewRound } = useCalledNumbersStore();

  useEffect(() => {
    if (style === "continue") {
      setGameMode(suggestedNextKey(game));
    } else {
      setGameMode(currentKey);
      setCustomCells(
        clonePattern(getPatternForGameMode(game?.game_mode_id, game?.win_pattern))
      );
    }
  }, [style]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!userInfo?.id || !game?.id) {
      setFormError("No hay usuario o partida");
      return;
    }

    if (gameMode === "Custom" && countActiveCells(customCells) < 1) {
      setFormError("En modo personalizado elige al menos una casilla");
      return;
    }

    const modeId = gameModeMapping[gameMode] || 1;
    const keepBalls = style === "continue";

    if (keepBalls && modeId === Number(game.game_mode_id) && modeId !== 9) {
      setFormError(
        "Para continuar elige otra figura. Si quieres la misma, usa Reiniciar de cero."
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await restartGame(game.id, userInfo.id, {
        game_mode_id: modeId,
        win_pattern: modeId === 9 ? clonePattern(customCells) : null,
        keep_called_numbers: keepBalls,
      });

      if (result.resetNumbers) {
        startNewRound(game.id);
        await loadCalledNumbers(game.id);
      }

      onStarted?.(result.game);
      onClose();
    } catch (error) {
      setFormError("No se pudo pasar de ronda. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-bingo-felt-deep/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={backdropClose(onClose, submitting)}
    >
      <motion.div
        className="bingo-ticket relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.35)]"
        initial={{ scale: 0.9, y: 24 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3 rounded-l-2xl bg-[var(--bingo-amber)]" />
        <div className="min-h-0 flex-1 overflow-y-auto p-5 pl-6 sm:p-6 sm:pl-7">
        <h2 className="relative font-bingo text-2xl text-[var(--bingo-felt)]">
          Siguiente ronda
        </h2>
        <p className="relative mb-4 text-sm text-bingo-ink/65">
          Elige si continúas con las bolas actuales u otra figura, o si empiezas de cero.
        </p>

        {queued > 0 && (
          <p className="relative mb-4 rounded-lg border-2 border-dashed border-bingo-felt/25 bg-white/40 px-3 py-2 text-sm text-[var(--bingo-ink)]">
            {queued === 1
              ? "1 persona en cola entra a jugar en esta ronda."
              : `${queued} personas en cola entran a jugar en esta ronda.`}
          </p>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStyle("continue")}
              className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                style === "continue"
                  ? "border-[var(--bingo-felt)] bg-[var(--bingo-felt)] text-white"
                  : "border-bingo-felt/20 bg-white/50 text-[var(--bingo-felt)]"
              }`}
            >
              <span className="block font-bingo text-sm">Continuar</span>
              <span
                className={`mt-1 block text-[0.7rem] leading-snug ${
                  style === "continue" ? "text-white/80" : "text-bingo-ink/55"
                }`}
              >
                Mismas bolas y cartones. Cambia a otra figura (lleno, diagonal…).
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStyle("reset")}
              className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                style === "reset"
                  ? "border-[var(--bingo-amber)] bg-[var(--bingo-amber)] text-[var(--bingo-ink)]"
                  : "border-bingo-felt/20 bg-white/50 text-[var(--bingo-felt)]"
              }`}
            >
              <span className="block font-bingo text-sm">Reiniciar de cero</span>
              <span
                className={`mt-1 block text-[0.7rem] leading-snug ${
                  style === "reset" ? "text-bingo-ink/70" : "text-bingo-ink/55"
                }`}
              >
                Nuevas bolas. Misma figura u otra, con los mismos cartones.
              </span>
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--bingo-felt)]">
              Figura ganadora
            </p>
            <ModePatternPicker
              value={gameMode}
              onChange={setGameMode}
              customCells={customCells}
              onCustomCellsChange={setCustomCells}
            />
          </div>

          {formError && (
            <p className="rounded-lg bg-bingo-red/10 px-3 py-2 text-center text-sm font-medium text-[var(--bingo-red)]">
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border-2 border-bingo-felt/30 px-5 py-2.5 font-semibold text-[var(--bingo-felt)] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[var(--bingo-red)] px-5 py-2.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] disabled:opacity-60"
            >
              {submitting
                ? "Preparando..."
                : style === "continue"
                  ? "Jugar siguiente figura"
                  : "Empezar nueva ronda"}
            </button>
          </div>
        </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
