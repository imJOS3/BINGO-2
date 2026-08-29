import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import {
  LETTER_COLORS,
  buildLiveStats,
  getBingoLetter,
} from "../../../../utils/bingoStats";
import { ChartIcon } from "../gameData/icons";

export default function LiveStatsCard({ onOpen }) {
  const { calledNumbers } = useCalledNumbersStore();
  const live = buildLiveStats(calledNumbers);

  return (
    <button
      type="button"
      onClick={onOpen}
      title="Abrir estadísticas de la ronda"
      className="w-full rounded-xl border border-white/15 bg-black/30 p-2.5 text-left transition hover:bg-black/45"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/65">
          <ChartIcon size={15} className="text-white/50" />
          Últimas bolas
        </p>
        <span className="font-bingo text-base leading-none text-[var(--bingo-amber)]">
          {live.total}
          <span className="text-xs text-white/45">/75</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {live.last.slice(0, 5).length ? (
          live.last.slice(0, 5).map((n) => (
            <span
              key={n}
              className="inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-bold text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              style={{ background: LETTER_COLORS[getBingoLetter(n)] }}
            >
              {n}
            </span>
          ))
        ) : (
          <span className="text-xs text-white/45">Sin bolas aún</span>
        )}
      </div>

      {live.total > 0 && (
        <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-white/60">
          <p>
            Caliente{" "}
            <span className="font-bingo text-[var(--bingo-amber)]">
              {live.hottestLetter}
            </span>
          </p>
          <p>
            Fría <span className="font-bingo text-sky-300">{live.coldestLetter}</span>
          </p>
        </div>
      )}
    </button>
  );
}
