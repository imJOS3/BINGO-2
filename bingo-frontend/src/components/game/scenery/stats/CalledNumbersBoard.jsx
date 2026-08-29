import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import {
  LETTERS,
  LETTER_COLORS,
  LETTER_RANGES,
  buildLiveStats,
} from "../../../../utils/bingoStats";
import { BoardIcon } from "../gameData/icons";

/**
 * Tablero de casino con las 75 bolas: las cantadas se encienden con el color de
 * su letra y la última queda resaltada.
 */
export default function CalledNumbersBoard({ onOpenStats }) {
  const { calledNumbers } = useCalledNumbersStore();
  const live = buildLiveStats(calledNumbers);
  const lastNumber = calledNumbers.length
    ? Number(calledNumbers[calledNumbers.length - 1].number)
    : null;

  return (
    <section className="shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/65">
          <BoardIcon size={15} className="text-white/50" />
          Tablero
        </p>
        <button
          type="button"
          onClick={onOpenStats}
          title="Ver estadísticas completas"
          className="rounded-lg border border-white/15 px-2 py-0.5 font-bingo text-sm text-[var(--bingo-amber)] transition hover:bg-white/10"
        >
          {live.total}
          <span className="text-xs text-white/45">/75</span>
        </button>
      </div>

      <div className="space-y-1">
        {LETTERS.map((letter) => {
          const [min, max] = LETTER_RANGES[letter];
          const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
          return (
            <div key={letter} className="flex items-center gap-1.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-bingo text-[0.7rem] text-white"
                style={{ background: LETTER_COLORS[letter] }}
              >
                {letter}
              </span>
              <div
                className="grid min-w-0 flex-1 gap-[2px]"
                style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}
              >
                {numbers.map((number) => {
                  const called = live.calledSet.has(number);
                  const isLast = number === lastNumber;
                  return (
                    <span
                      key={number}
                      className={`flex h-5 items-center justify-center rounded text-[0.7rem] font-bold leading-none transition-colors xl:h-6 xl:text-xs ${
                        called ? "text-white" : "bg-white/8 text-white/30"
                      } ${
                        isLast ? "ring-2 ring-[var(--bingo-amber)]" : ""
                      }`}
                      style={
                        called ? { background: LETTER_COLORS[letter] } : undefined
                      }
                    >
                      {number}
                    </span>
                  );
                })}
              </div>
              <span className="w-5 shrink-0 text-right text-[0.7rem] font-bold text-white/50">
                {live.letterCounts[letter]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-lg bg-white/8 py-1">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/45">
            Caliente
          </p>
          <p className="font-bingo text-sm text-[var(--bingo-amber)]">
            {live.total ? live.hottestLetter : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-white/8 py-1">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/45">
            Fría
          </p>
          <p className="font-bingo text-sm text-sky-300">
            {live.total ? live.coldestLetter : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-white/8 py-1">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/45">
            Quedan
          </p>
          <p className="font-bingo text-sm text-white">{live.remaining}</p>
        </div>
      </div>
    </section>
  );
}
