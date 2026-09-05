import { useState, useEffect } from "preact/hooks";
import useGameStore from "../../../../../store/gameStore";

function getRemainingSeconds(game) {
  if (!game) return 0;
  const total = (game.game_time || 0) * 60;
  if (!game.started_at) return total;

  const startedMs = new Date(game.started_at).getTime();
  if (Number.isNaN(startedMs)) return total;

  const elapsed = Math.floor((Date.now() - startedMs) / 1000);
  return Math.max(0, total - elapsed);
}

const formatTime = (time) => {
  const minutes = String(Math.floor(time / 60)).padStart(2, "0");
  const secs = String(time % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
};

export default function Chronometer({ paused = false }) {
  const { selectedGame, winner } = useGameStore();
  const [seconds, setSeconds] = useState(() => getRemainingSeconds(selectedGame));
  const isPaused = paused || !!winner || selectedGame?.game_status === "completed";

  useEffect(() => {
    setSeconds(getRemainingSeconds(selectedGame));

    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds(getRemainingSeconds(selectedGame));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, selectedGame?.id, selectedGame?.game_time, selectedGame?.started_at]);

  const totalSeconds = Math.max(1, (selectedGame?.game_time || 0) * 60);
  const leftPct = Math.max(0, Math.min(100, (seconds / totalSeconds) * 100));
  const urgent = !isPaused && seconds > 0 && seconds <= 30;
  const lastCall = !isPaused && seconds > 0 && seconds <= 60;
  const barColor =
    leftPct > 50
      ? "bg-[#3ecf8e]"
      : leftPct > 20
        ? "bg-[var(--bingo-amber)]"
        : "bg-[var(--bingo-red)]";

  return (
    <div
      className={`flex min-w-0 shrink-0 flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-3 ${
        urgent ? "animate-pulse" : ""
      }`}
    >
      <span
        className={`text-[0.6rem] font-bold uppercase tracking-[0.14em] sm:text-base ${
          lastCall ? "text-[var(--bingo-red)]" : "text-[var(--bingo-amber)]"
        }`}
      >
        {lastCall ? "Bingo o nada" : "Termina en"}
      </span>
      <div className="relative min-w-0 rounded-xl border-2 border-black/70 bg-gray-900 p-1 shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-black px-2 py-0.5 sm:px-4 sm:py-1.5">
          <span
            aria-hidden="true"
            className="clock-container absolute inset-0 flex items-center justify-center font-digital text-2xl text-red-500 opacity-10 sm:text-4xl"
          >
            88:88
          </span>
          <span className="clock-container digit relative z-10 font-digital text-2xl leading-none sm:text-4xl">
            {formatTime(seconds)}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${barColor}`}
            style={{ width: `${leftPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export { getRemainingSeconds };
