import { useEffect } from "preact/hooks";
import useAuthStore from "../../../../../store/authStore";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import useGameStore from "../../../../../store/gameStore";
import usePresenceStore from "../../../../../store/presenceStore";
import useUsersGame from "../../../../../store/usersGame";
import {
  LETTERS,
  getPatternForGameMode,
} from "../../create/ModePatternPicker";

const REFRESH_MS = 5000;
const FREE_ROW = 2;
const FREE_COL = 2;

const DOT = {
  online: "bg-[#3ecf8e]",
  away: "bg-[var(--bingo-amber)]",
  disconnected: "bg-white/25",
};

const countProgress = (player, cells) => {
  let required = 0;
  let done = 0;

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (!cells[r]?.[c]) continue;
      required += 1;
      if (r === FREE_ROW && c === FREE_COL) {
        done += 1;
        continue;
      }
      const number = player.numbers?.[LETTERS[c]]?.[r];
      if (number != null && player.marked?.[`${LETTERS[c]}-${number}`]) done += 1;
    }
  }

  return { required, done };
};

function MiniCard({ player, calledSet, cells, status, focusFigure }) {
  const { required, done } = countProgress(player, cells);
  const missing = Math.max(0, required - done);

  return (
    <li className="rounded-xl border border-white/15 bg-black/30 p-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[status] || DOT.disconnected}`}
        />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white/85">
          {player.nickname}
        </span>
        {player.isHost && (
          <span className="shrink-0 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--bingo-amber)]">
            Host
          </span>
        )}
        <span
          className={`shrink-0 font-bingo text-xs ${
            missing === 0 ? "text-[#3ecf8e]" : "text-white/70"
          }`}
        >
          {done}/{required}
        </span>
      </div>

      {player.numbers ? (
        <div className="grid grid-cols-5 gap-[3px]">
          {LETTERS.map((letter, colIndex) => (
            <div key={letter} className="flex flex-col gap-[3px]">
              <span className="text-center text-[0.5rem] font-bold uppercase text-white/40">
                {letter}
              </span>
              {Array.from({ length: 5 }).map((_, rowIndex) => {
                const inFigure = !!cells[rowIndex]?.[colIndex];
                const dim = focusFigure && !inFigure;

                if (rowIndex === FREE_ROW && colIndex === FREE_COL) {
                  return (
                    <span
                      key="free"
                      className={`flex aspect-square items-center justify-center rounded bg-[var(--bingo-amber)]/80 text-[0.45rem] font-bold text-[var(--bingo-ink)] ${
                        dim ? "opacity-40" : ""
                      }`}
                    >
                      ★
                    </span>
                  );
                }

                const number = player.numbers?.[letter]?.[rowIndex];
                const marked = !!player.marked?.[`${letter}-${number}`];
                const pending = !marked && calledSet.has(Number(number));

                return (
                  <span
                    key={`${letter}-${rowIndex}`}
                    className={`flex aspect-square items-center justify-center rounded text-[0.55rem] font-bold ${
                      marked
                        ? "bg-[var(--bingo-red)] text-white"
                        : pending
                          ? "bg-[var(--bingo-amber)]/25 text-[var(--bingo-amber)] ring-1 ring-[var(--bingo-amber)]/60"
                          : "bg-white/10 text-white/55"
                    } ${dim ? "opacity-40" : ""}`}
                  >
                    {number ?? ""}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-3 text-center text-[0.65rem] text-white/40">
          Todavía sin cartón
        </p>
      )}
    </li>
  );
}

/** Cartones en vivo de quienes juegan, para el que espera en la cola. */
export default function SpectatorBoards({ gameId }) {
  const viewerId = useAuthStore((s) => s.userInfo?.id);
  const { selectedGame } = useGameStore();
  const { calledNumbers } = useCalledNumbersStore();
  const byUser = usePresenceStore((s) => s.byUser);
  const tableCards = useUsersGame((s) => s.tableCards);
  const fetchTableCards = useUsersGame((s) => s.fetchTableCards);

  const calledCount = calledNumbers.length;

  useEffect(() => {
    if (!gameId || !viewerId) return;
    let alive = true;
    const load = () => {
      if (alive) void fetchTableCards(gameId, viewerId);
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [gameId, viewerId, calledCount]);

  const calledSet = new Set(calledNumbers.map((item) => Number(item.number)));
  const cells = getPatternForGameMode(
    selectedGame?.game_mode_id,
    selectedGame?.win_pattern
  );
  const figureCells = cells.flat().filter(Boolean).length;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <p className="mb-1.5 shrink-0 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/50">
        Cartones en juego
        {tableCards.length ? ` · ${tableCards.length}` : ""}
      </p>

      {tableCards.length ? (
        <ul className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto no-scrollbar sm:grid-cols-2">
          {tableCards.map((player) => (
            <MiniCard
              key={player.userId}
              player={player}
              calledSet={calledSet}
              cells={cells}
              focusFigure={figureCells < 25}
              status={byUser[String(player.userId)] || "disconnected"}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-white/20 px-3 py-4 text-center text-xs text-white/45">
          Nadie está jugando en esta ronda todavía.
        </p>
      )}
    </section>
  );
}
