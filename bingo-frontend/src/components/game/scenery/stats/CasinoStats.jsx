import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import {
  LETTERS,
  LETTER_COLORS,
  LETTER_RANGES,
  buildLiveStats,
  getBingoLetter,
} from "../../../../utils/bingoStats";
import { backdropClose } from "../../../../utils/modal";
import { DockHeader } from "../gameData/SideDrawer";

function StatChip({ label, value, hint }) {
  return (
    <div className="flex h-full min-h-[5.5rem] flex-col rounded-xl border border-bingo-felt/10 bg-white/55 px-3 py-2">
      <p className="min-h-[2em] text-[0.6rem] font-bold uppercase leading-tight tracking-wide text-bingo-felt/55">
        {label}
      </p>
      <p className="mt-auto font-bingo text-lg leading-none text-[var(--bingo-felt)]">
        {value}
      </p>
      <p className="mt-0.5 min-h-[0.85rem] text-[0.65rem] text-bingo-ink/50">
        {hint || "\u00a0"}
      </p>
    </div>
  );
}

function NumberPill({ number }) {
  const letter = getBingoLetter(number);
  return (
    <span
      className="inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
      style={{ background: LETTER_COLORS[letter] }}
    >
      {number}
    </span>
  );
}

export default function CasinoStats({ onClose, docked = false }) {
  const { calledNumbers } = useCalledNumbersStore();
  const live = buildLiveStats(calledNumbers);

  const maxLetter = Math.max(1, ...LETTERS.map((l) => live.letterCounts[l]));

  const body = (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <StatChip label="Salidas" value={`${live.total}/75`} />
              <StatChip label="Quedan" value={live.remaining} />
              <StatChip
                label="Columna caliente"
                value={live.total ? live.hottestLetter : "—"}
                hint={
                  live.total
                    ? `${live.letterCounts[live.hottestLetter]} bolas`
                    : undefined
                }
              />
              <StatChip
                label="Columna fría"
                value={live.total ? live.coldestLetter : "—"}
                hint={
                  live.total
                    ? `${live.letterCounts[live.coldestLetter]} bolas`
                    : undefined
                }
              />
            </div>

            <div>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                Últimos números
              </p>
              <div className="flex flex-wrap gap-1.5">
                {live.last.length ? (
                  live.last.map((n) => <NumberPill key={n} number={n} />)
                ) : (
                  <p className="text-sm text-bingo-ink/55">Aún no sale ninguna bola.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatChip label="Pares" value={live.even} hint={`${live.odd} impares`} />
              <StatChip label="Bajos 1-37" value={live.low} hint={`${live.high} altos`} />
            </div>

            <div>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                Por letra
              </p>
              <div className="space-y-1.5">
                {LETTERS.map((letter) => (
                  <div key={letter} className="flex items-center gap-2">
                    <span
                      className="w-5 text-center text-xs font-bingo text-white"
                      style={{ color: LETTER_COLORS[letter] }}
                    >
                      {letter}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-bingo-felt/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(live.letterCounts[letter] / maxLetter) * 100}%`,
                          background: LETTER_COLORS[letter],
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-bold text-bingo-ink/70">
                      {live.letterCounts[letter]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                Tablero 1-75
              </p>
              <div className="grid grid-cols-5 gap-2">
                {LETTERS.map((letter) => {
                  const [min, max] = LETTER_RANGES[letter];
                  const nums = [];
                  for (let n = min; n <= max; n++) nums.push(n);
                  return (
                    <div key={letter} className="flex flex-col items-center gap-1">
                      <span
                        className="font-bingo text-xs"
                        style={{ color: LETTER_COLORS[letter] }}
                      >
                        {letter}
                      </span>
                      {nums.map((n) => (
                        <span
                          key={n}
                          className={`flex h-6 w-full items-center justify-center rounded text-[0.65rem] font-bold ${
                            live.calledSet.has(n)
                              ? "text-white"
                              : "bg-white/40 text-bingo-ink/35"
                          }`}
                          style={
                            live.calledSet.has(n)
                              ? { background: LETTER_COLORS[letter] }
                              : undefined
                          }
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
  );

  if (docked) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#ece5dd] shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
        <DockHeader
          title="Estadísticas"
          subtitle={`${live.total}/75 bolas`}
          onClose={onClose}
        />
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{body}</div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-bingo-felt-deep/75 p-4 backdrop-blur-sm"
      onClick={backdropClose(onClose)}
    >
      <div className="bingo-ticket max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5 shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-bingo-felt/55">
          Tablero
        </p>
        <h2 className="font-bingo text-2xl text-[var(--bingo-felt)]">Estadísticas</h2>
        <div className="mt-3">{body}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border-2 border-bingo-felt/25 px-4 py-2.5 font-semibold text-[var(--bingo-felt)] transition hover:bg-white/50"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
