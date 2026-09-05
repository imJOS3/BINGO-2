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
  const modeLabel = getModeLabel(selectedGame?.game_mode_id);
  const betweenRounds = selectedGame?.game_status === "completed";

  return (
    <motion.div
      className="flex w-full shrink-0 flex-col gap-2 rounded-2xl border border-white/15 bg-black/35 px-2.5 py-2 sm:px-4 sm:py-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex min-w-0 items-baseline justify-between gap-2 md:block">
        <p className="min-w-0 truncate font-bingo text-base leading-none text-white sm:text-xl md:leading-tight">
          {selectedGame?.game_name || "Mesa de bingo"}
        </p>
        <p className="shrink-0 text-xs font-semibold text-white/70 md:mt-0.5 md:truncate md:text-sm">
          {selectedGame?.room_code ? (
            <>
              <span className="hidden md:inline">Código </span>
              <span className="font-bold tracking-[0.12em] text-[var(--bingo-amber)]">
                {selectedGame.room_code}
              </span>
              <span className="hidden md:inline"> · </span>
            </>
          ) : null}
          <span className="hidden md:inline">
            {modeLabel}
            {betweenRounds ? " · Entre rondas" : ""}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-stretch gap-2 md:contents">
        <Chronometer paused={paused} />

        <div className="flex min-w-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={onOpenStats}
            title="Ver estadísticas de la ronda"
            className="flex min-w-0 w-full flex-col items-stretch rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-left transition hover:bg-white/20 sm:px-3 sm:py-2 md:max-w-[11rem]"
          >
            <span className="flex items-baseline justify-between gap-1.5">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/70 sm:text-xs">
                Bolas
              </span>
              <span className="font-bingo text-base leading-none text-[var(--bingo-amber)] sm:text-lg">
                {total}
                <span className="text-xs text-white/50 sm:text-sm">/75</span>
              </span>
            </span>
            <span className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/40 sm:mt-1.5 sm:h-2">
              <span
                className="block h-full rounded-full bg-[var(--bingo-amber)] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
          </button>

          {lastLetter ? (
            <div
              className="hidden h-12 min-w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-xl px-2.5 text-white shadow-[0_3px_8px_rgba(0,0,0,0.4)] md:flex sm:h-14 sm:min-w-[3.75rem]"
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
            <div className="hidden h-12 shrink-0 items-center rounded-xl border border-dashed border-white/30 px-3 text-xs font-bold uppercase tracking-[0.1em] text-white/50 md:flex sm:h-14">
              Sin bolas
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
