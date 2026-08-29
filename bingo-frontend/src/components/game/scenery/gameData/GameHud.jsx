import { motion } from "framer-motion";
import Chronometer from "../chronometer/chronometer";
import useGameStore from "../../../../../store/gameStore";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import { getModeLabel } from "../../create/ModePatternPicker";
import { LETTER_COLORS, getBingoLetter } from "../../../../utils/bingoStats";

export default function GameHud({ paused = false, onOpenStats }) {
  const { selectedGame } = useGameStore();
  const { calledNumbers } = useCalledNumbersStore();

  const total = calledNumbers.length;
  const lastBall = calledNumbers[total - 1];
  const lastLetter = lastBall
    ? lastBall.letter || getBingoLetter(lastBall.number)
    : null;
  const pct = Math.round((total / 75) * 100);

  return (
    <motion.div
      className="grid w-full shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-white/15 bg-black/35 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="min-w-0">
        <p className="truncate font-bingo text-lg leading-tight text-white sm:text-xl">
          {selectedGame?.game_name || "Mesa de bingo"}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-white/70">
          {selectedGame?.room_code ? (
            <>
              Código{" "}
              <span className="font-bold tracking-[0.16em] text-[var(--bingo-amber)]">
                {selectedGame.room_code}
              </span>
              {" · "}
            </>
          ) : null}
          {getModeLabel(selectedGame?.game_mode_id)}
        </p>
      </div>

      <Chronometer paused={paused} />

      <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenStats}
          title="Ver estadísticas de la ronda"
          className="flex min-w-0 max-w-[11rem] flex-col items-stretch rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-left transition hover:bg-white/20"
        >
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">
              Bolas
            </span>
            <span className="font-bingo text-lg leading-none text-[var(--bingo-amber)]">
              {total}
              <span className="text-sm text-white/50">/75</span>
            </span>
          </span>
          <span className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/40">
            <span
              className="block h-full rounded-full bg-[var(--bingo-amber)] transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </span>
        </button>

        {lastLetter ? (
          <div
            className="flex h-12 min-w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-xl px-2.5 text-white shadow-[0_3px_8px_rgba(0,0,0,0.4)] sm:h-14 sm:min-w-[3.75rem]"
            style={{ background: LETTER_COLORS[lastLetter] }}
            title="Última bola cantada"
          >
            <span className="font-bingo text-xs leading-none opacity-90 sm:text-sm">
              {lastLetter}
            </span>
            <span className="font-bingo text-xl leading-none sm:text-2xl">
              {lastBall.number}
            </span>
          </div>
        ) : (
          <div className="flex h-12 shrink-0 items-center rounded-xl border border-dashed border-white/30 px-3 text-xs font-bold uppercase tracking-[0.1em] text-white/50 sm:h-14">
            Sin bolas
          </div>
        )}
      </div>
    </motion.div>
  );
}
