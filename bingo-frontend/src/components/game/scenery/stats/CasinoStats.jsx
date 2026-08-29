import { useEffect, useState } from "preact/hooks";
import axios from "axios";
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

const apiUrl = import.meta.env.VITE_API_URL;

function StatChip({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-bingo-felt/10 bg-white/55 px-3 py-2">
      <p className="text-[0.6rem] font-bold uppercase tracking-wide text-bingo-felt/55">
        {label}
      </p>
      <p className="font-bingo text-lg leading-none text-[var(--bingo-felt)]">{value}</p>
      {hint && <p className="mt-0.5 text-[0.65rem] text-bingo-ink/50">{hint}</p>}
    </div>
  );
}

function NumberPill({ number, dim = false }) {
  const letter = getBingoLetter(number);
  return (
    <span
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white ${
        dim ? "opacity-40" : ""
      }`}
      style={{ background: LETTER_COLORS[letter] }}
    >
      {number}
    </span>
  );
}

export default function CasinoStats({ onClose, docked = false }) {
  const { calledNumbers } = useCalledNumbersStore();
  const live = buildLiveStats(calledNumbers);
  const [tab, setTab] = useState("round");
  const [casino, setCasino] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${apiUrl}/api/stats`);
        if (!cancelled) setCasino(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxLetter = Math.max(1, ...LETTERS.map((l) => live.letterCounts[l]));

  const body = (
    <>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab("round")}
            className={`rounded-xl px-3 py-2 text-sm font-bold ${
              tab === "round"
                ? "bg-[var(--bingo-felt)] text-white"
                : "bg-white/50 text-[var(--bingo-felt)]"
            }`}
          >
            Esta ronda
          </button>
          <button
            type="button"
            onClick={() => setTab("casino")}
            className={`rounded-xl px-3 py-2 text-sm font-bold ${
              tab === "casino"
                ? "bg-[var(--bingo-felt)] text-white"
                : "bg-white/50 text-[var(--bingo-felt)]"
            }`}
          >
            Casino
          </button>
        </div>

        {tab === "round" && (
          <div className="mt-4 space-y-4">
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
        )}

        {tab === "casino" && (
          <div className="mt-4 space-y-4">
            {loading && !casino && (
              <p className="text-sm text-bingo-ink/60">Cargando histórico...</p>
            )}
            {casino && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <StatChip label="Bolas históricas" value={casino.totalDraws || 0} />
                  <StatChip label="Mesas" value={casino.gamesPlayed || 0} />
                  <StatChip label="Finalizadas" value={casino.gamesCompleted || 0} />
                </div>

                <div>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                    Letras más calientes
                  </p>
                  <div className="flex gap-1">
                    {LETTERS.map((letter) => (
                      <div
                        key={letter}
                        className="flex flex-1 flex-col items-center rounded-lg px-1 py-2 text-white"
                        style={{ background: LETTER_COLORS[letter] }}
                      >
                        <span className="font-bingo text-sm">{letter}</span>
                        <span className="text-[0.65rem] font-bold">
                          {casino.letterCounts?.[letter] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                    Números más seguidos
                  </p>
                  <div className="space-y-1.5">
                    {(casino.hotNumbers || []).length ? (
                      casino.hotNumbers.map((item, i) => (
                        <div
                          key={item.number}
                          className="flex items-center justify-between rounded-xl bg-white/55 px-3 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-4 text-xs font-bold text-bingo-felt/45">
                              {i + 1}
                            </span>
                            <NumberPill number={item.number} />
                          </span>
                          <span className="text-sm font-bold text-[var(--bingo-felt)]">
                            {item.times} veces
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-bingo-ink/55">
                        Aún no hay historial de bolas.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                    Números fríos
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(casino.coldNumbers || []).map((item) => (
                      <span key={item.number} className="flex items-center gap-1">
                        <NumberPill number={item.number} dim={item.times === 0} />
                        <span className="text-[0.65rem] text-bingo-ink/45">
                          {item.times}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                    Ganadores
                  </p>
                  {(casino.topWinners || []).length ? (
                    <ul className="space-y-1.5">
                      {casino.topWinners.map((row) => (
                        <li
                          key={row.nickname}
                          className="flex items-center justify-between rounded-xl bg-white/55 px-3 py-2"
                        >
                          <span className="font-semibold text-[var(--bingo-ink)]">
                            {row.nickname}
                          </span>
                          <span className="font-bingo text-sm text-[var(--bingo-felt)]">
                            {row.wins} bingo{Number(row.wins) === 1 ? "" : "s"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-bingo-ink/55">
                      Todavía no hay ganadores registrados.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
    </>
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
