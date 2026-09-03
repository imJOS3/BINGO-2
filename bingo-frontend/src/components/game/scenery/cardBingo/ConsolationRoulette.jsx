import { useEffect, useMemo, useState } from "preact/hooks";
import { motion } from "framer-motion";

const COLORS = [
  "#e23d3d",
  "#f0b429",
  "#3ecf8e",
  "#1d6fb8",
  "#d97706",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

/** Ruleta de consolación: cada ficha marcada suma una papeleta más. */
export default function ConsolationRoulette({ payload, onDone }) {
  const [phase, setPhase] = useState("spin");

  const segments = useMemo(() => {
    const list = (payload?.participants || []).filter((p) => p.tickets > 0);
    const out = [];
    list.forEach((player, idx) => {
      for (let i = 0; i < player.tickets; i++) {
        out.push({
          ...player,
          color: COLORS[idx % COLORS.length],
          key: `${player.userId}-${i}`,
        });
      }
    });
    return out;
  }, [payload]);

  const winnerId = payload?.winner?.id;
  const winnerIdx = segments.findIndex((s) => String(s.userId) === String(winnerId));
  const spinTo = winnerIdx >= 0 ? -(winnerIdx * (360 / segments.length)) - 1440 : -1440;

  useEffect(() => {
    if (!payload?.winner) {
      const t = setTimeout(() => onDone?.(), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase("reveal");
      setTimeout(() => onDone?.(), 2200);
    }, 4200);
    return () => clearTimeout(t);
  }, [payload?.winner]);

  if (!segments.length) {
    return (
      <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-bingo-felt-deep/90 p-4 backdrop-blur-sm">
        <motion.div
          className="bingo-ticket w-full max-w-sm rounded-2xl p-8 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-bingo-felt/55">
            Se acabó el tiempo
          </p>
          <h2 className="mt-2 font-bingo text-3xl text-[var(--bingo-ink)]">
            Nadie ganó el sorteo
          </h2>
          <p className="mt-3 text-sm text-bingo-ink/65">
            No hubo papeletas en la ruleta de consolación.
          </p>
        </motion.div>
      </div>
    );
  }

  const slice = 360 / segments.length;

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-bingo-felt-deep/90 p-4 backdrop-blur-sm">
      <motion.div
        className="bingo-ticket w-full max-w-md rounded-2xl p-6 text-center sm:p-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-bingo-felt/55">
          Se acabó el tiempo
        </p>
        <h2 className="mt-1 font-bingo text-3xl text-[var(--bingo-red)]">
          Ruleta de consolación
        </h2>
        <p className="mt-2 text-sm text-bingo-ink/65">
          Más fichas marcadas = más papeletas en la ruleta
        </p>

        <div className="relative mx-auto mt-6 h-52 w-52 sm:h-60 sm:w-60">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
            <span className="block h-0 w-0 border-x-[10px] border-b-[18px] border-x-transparent border-b-[var(--bingo-red)] drop-shadow" />
          </div>
          <motion.div
            className="h-full w-full rounded-full border-4 border-[var(--bingo-ink)] shadow-[0_8px_0_rgba(0,0,0,0.25)]"
            style={{ transformOrigin: "center center" }}
            initial={{ rotate: 0 }}
            animate={{ rotate: spinTo }}
            transition={{ duration: 4, ease: [0.12, 0.8, 0.2, 1] }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full">
              {segments.map((seg, i) => {
                const start = (i * slice - 90) * (Math.PI / 180);
                const end = ((i + 1) * slice - 90) * (Math.PI / 180);
                const x1 = 100 + 95 * Math.cos(start);
                const y1 = 100 + 95 * Math.sin(start);
                const x2 = 100 + 95 * Math.cos(end);
                const y2 = 100 + 95 * Math.sin(end);
                const large = slice > 180 ? 1 : 0;
                const mid = ((i + 0.5) * slice - 90) * (Math.PI / 180);
                const lx = 100 + 62 * Math.cos(mid);
                const ly = 100 + 62 * Math.sin(mid);
                const label =
                  seg.nickname.length > 8
                    ? `${seg.nickname.slice(0, 7)}…`
                    : seg.nickname;
                return (
                  <g key={seg.key}>
                    <path
                      d={`M100,100 L${x1},${y1} A95,95 0 ${large},1 ${x2},${y2} Z`}
                      fill={seg.color}
                      stroke="#062820"
                      strokeWidth="1"
                    />
                    <text
                      x={lx}
                      y={ly}
                      fill="white"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${i * slice + slice / 2}, ${lx}, ${ly})`}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="18" fill="#062820" />
            </svg>
          </motion.div>
        </div>

        {phase === "reveal" && payload?.winner && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl bg-[var(--bingo-felt)]/10 px-4 py-3"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-bingo-felt/55">
              Ganador del sorteo
            </p>
            <p className="font-bingo text-2xl text-[var(--bingo-felt)]">
              {payload.winner.nickname}
            </p>
            <p className="text-sm text-bingo-ink/60">
              {payload.winner.tickets}{" "}
              {payload.winner.tickets === 1 ? "papeleta" : "papeletas"}
            </p>
          </motion.div>
        )}

        <ul className="mt-5 max-h-28 space-y-1 overflow-y-auto text-left text-sm">
          {(payload?.participants || [])
            .filter((p) => p.tickets > 0)
            .map((p) => (
              <li
                key={p.userId}
                className="flex items-center justify-between rounded-lg bg-white/50 px-2.5 py-1.5"
              >
                <span className="font-semibold text-[var(--bingo-ink)]">{p.nickname}</span>
                <span className="font-bingo text-[var(--bingo-felt)]">
                  {p.tickets} {p.tickets === 1 ? "papeleta" : "papeletas"}
                </span>
              </li>
            ))}
        </ul>
      </motion.div>
    </div>
  );
}
