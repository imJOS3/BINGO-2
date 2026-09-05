import { useEffect, useMemo, useState } from "preact/hooks";
import { motion } from "framer-motion";

const COLORS = [
  "#e23d3d",
  "#1d6fb8",
  "#f0b429",
  "#1f8a5a",
  "#8b5cf6",
  "#d97706",
  "#ec4899",
  "#14b8a6",
];

const toRad = (deg) => (deg * Math.PI) / 180;

const slicePath = (startDeg, endDeg, radius = 96) => {
  const start = toRad(startDeg - 90);
  const end = toRad(endDeg - 90);
  const x1 = 100 + radius * Math.cos(start);
  const y1 = 100 + radius * Math.sin(start);
  const x2 = 100 + radius * Math.cos(end);
  const y2 = 100 + radius * Math.sin(end);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M100,100 L${x1},${y1} A${radius},${radius} 0 ${large},1 ${x2},${y2} Z`;
};

const shortName = (name, max) => {
  const raw = String(name || "Jugador").trim() || "Jugador";
  return raw.length > max ? `${raw.slice(0, max - 1)}…` : raw;
};

const spinTransition = { duration: 4, ease: [0.12, 0.8, 0.2, 1] };

/**
 * Un sector por jugador. Los nombres van en pastillas HTML y se
 * contrarrotan, así se leen horizontales aunque gire la rueda.
 */
export default function ConsolationRoulette({ payload, onDone }) {
  const [phase, setPhase] = useState("spin");

  const wedges = useMemo(() => {
    const list = (payload?.participants || []).filter((p) => Number(p.tickets) > 0);
    const total = list.reduce((sum, p) => sum + Number(p.tickets), 0);
    if (!total) return [];

    let cursor = 0;
    return list.map((player, idx) => {
      const tickets = Number(player.tickets);
      const angle = (tickets / total) * 360;
      const start = cursor;
      const end = cursor + angle;
      cursor = end;
      const mid = start + angle / 2;
      const rad = toRad(mid - 90);
      return {
        userId: player.userId,
        nickname: player.nickname || `Jugador ${player.userId}`,
        tickets,
        color: COLORS[idx % COLORS.length],
        start,
        end,
        mid,
        angle,
        x: 50 + 32 * Math.cos(rad),
        y: 50 + 32 * Math.sin(rad),
      };
    });
  }, [payload]);

  const winnerId = payload?.winner?.id;
  const winnerWedge = wedges.find((w) => String(w.userId) === String(winnerId));
  const spinTo = winnerWedge ? -(winnerWedge.mid) - 1440 : -1080;

  useEffect(() => {
    if (!payload?.winner) {
      const t = setTimeout(() => onDone?.(), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase("reveal");
      setTimeout(() => onDone?.(), 2400);
    }, 4200);
    return () => clearTimeout(t);
  }, [payload?.winner]);

  if (!wedges.length) {
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

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-bingo-felt-deep/90 p-4 backdrop-blur-sm">
      <motion.div
        className="bingo-ticket w-full max-w-lg rounded-2xl p-5 text-center sm:p-8"
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
          Más fichas = más papeletas = sector más grande.
        </p>

        <div className="relative mx-auto mt-5 h-64 w-64 sm:h-80 sm:w-80">
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
            <span className="block h-0 w-0 border-x-[12px] border-b-[22px] border-x-transparent border-b-[var(--bingo-red)] drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]" />
          </div>

          <motion.div
            className="relative h-full w-full rounded-full border-[6px] border-[var(--bingo-ink)] shadow-[0_10px_0_rgba(0,0,0,0.28)]"
            style={{ transformOrigin: "center center" }}
            initial={{ rotate: 0 }}
            animate={{ rotate: spinTo }}
            transition={spinTransition}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full">
              {wedges.map((wedge) => (
                <path
                  key={wedge.userId}
                  d={slicePath(wedge.start, wedge.end)}
                  fill={wedge.color}
                  stroke="#062820"
                  strokeWidth="1.5"
                />
              ))}
              <circle cx="100" cy="100" r="22" fill="#062820" />
              <text
                x="100"
                y="100"
                fill="#f0b429"
                fontSize="8"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                BINGO
              </text>
            </svg>

            {wedges.map((wedge) => {
              const showName = wedge.angle >= 18;
              const label = showName
                ? shortName(wedge.nickname, wedge.angle >= 55 ? 14 : 9)
                : (wedge.nickname || "?").charAt(0).toUpperCase();

              return (
                <motion.div
                  key={`label-${wedge.userId}`}
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${wedge.x}%`, top: `${wedge.y}%` }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -spinTo }}
                  transition={spinTransition}
                >
                  <span
                    className={`inline-block rounded-full bg-[#062820]/90 px-2 py-0.5 font-bold leading-none text-[#fff8e7] shadow-[0_1px_0_rgba(0,0,0,0.35)] ${
                      showName ? "text-[11px] sm:text-xs" : "h-6 w-6 text-sm"
                    }`}
                  >
                    {label}
                  </span>
                </motion.div>
              );
            })}
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

        <ul className="mt-5 max-h-32 space-y-1 overflow-y-auto text-left text-sm">
          {wedges.map((p) => (
            <li
              key={p.userId}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/50 px-2.5 py-1.5"
            >
              <span className="flex min-w-0 items-center gap-2 font-semibold text-[var(--bingo-ink)]">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: p.color }}
                />
                <span className="truncate">{p.nickname}</span>
              </span>
              <span className="shrink-0 font-bingo text-[var(--bingo-felt)]">
                {p.tickets} {p.tickets === 1 ? "papeleta" : "papeletas"}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
