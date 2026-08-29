import useBingoCardStore from "../../../../../store/bingoCardStore";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import useGameStore from "../../../../../store/gameStore";
import { LETTERS, getPatternForGameMode } from "../../create/ModePatternPicker";
import { TargetIcon } from "./icons";

const FREE_ROW = 2;
const FREE_COL = 2;

/**
 * Cuánto le falta al jugador para completar la figura de la ronda.
 * Las marcas salen del cartón guardado, así que se actualizan al tocar casillas.
 */
export default function PatternProgress() {
  const { selectedGame } = useGameStore();
  const { selectedCard } = useBingoCardStore();
  const { calledNumbers } = useCalledNumbersStore();

  const cells = getPatternForGameMode(
    selectedGame?.game_mode_id,
    selectedGame?.win_pattern
  );
  const marks =
    selectedCard?.marked_numbers && typeof selectedCard.marked_numbers === "object"
      ? selectedCard.marked_numbers
      : {};
  const calledSet = new Set(calledNumbers.map((item) => Number(item.number)));

  let required = 0;
  let done = 0;
  let ready = 0;

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (!cells[r]?.[c]) continue;
      required += 1;

      if (r === FREE_ROW && c === FREE_COL) {
        done += 1;
        continue;
      }

      const number = selectedCard?.numbers?.[LETTERS[c]]?.[r];
      if (number == null) continue;
      if (marks[`${LETTERS[c]}-${number}`]) done += 1;
      else if (calledSet.has(Number(number))) ready += 1;
    }
  }

  const pct = required ? Math.round((done / required) * 100) : 0;
  const missing = Math.max(0, required - done);

  return (
    <section className="rounded-2xl border border-white/15 bg-black/30 p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/65">
          <TargetIcon size={15} className="text-white/50" />
          Tu figura
        </p>
        <p className="font-bingo text-base leading-none text-white">
          {done}
          <span className="text-xs text-white/45">/{required || 0}</span>
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            missing === 0 ? "bg-[#3ecf8e]" : "bg-[var(--bingo-amber)]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-sm font-semibold text-white/75">
        {missing === 0
          ? "¡Figura completa!"
          : `Te faltan ${missing} casilla${missing === 1 ? "" : "s"}`}
      </p>

      {ready > 0 && (
        <p className="mt-1 animate-pulse text-sm font-bold text-[var(--bingo-amber)]">
          {ready} por marcar en tu cartón
        </p>
      )}
    </section>
  );
}
