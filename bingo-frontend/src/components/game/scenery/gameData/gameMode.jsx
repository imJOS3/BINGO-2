import {
  PatternBoard,
  getPatternForGameMode,
  getModeLabel,
} from "../../create/ModePatternPicker";

/**
 * Muestra el diseño visual del patrón ganador (lleno, diagonal, personalizado…).
 */
export default function GameMode({
  gameModeId = 1,
  pattern,
  size = "md",
  showLabel = true,
  tone = "dark",
  className = "",
}) {
  const cells = getPatternForGameMode(gameModeId, pattern);
  const label = getModeLabel(gameModeId);
  const boardSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "md";
  const onLight = tone === "light";

  return (
    <div className={`flex w-full flex-col items-center gap-2 ${className}`}>
      {showLabel && (
        <p
          className={`text-center text-xs font-bold uppercase tracking-[0.16em] ${
            onLight ? "text-bingo-felt/55" : "text-white/65"
          }`}
        >
          Objetivo
        </p>
      )}
      <PatternBoard
        cells={cells}
        size={boardSize === "md" ? "lg" : boardSize}
        showLetters={boardSize !== "sm"}
        className={`w-full max-w-[12.5rem] shadow-[3px_3px_0_rgba(11,61,50,0.25)] ${
          boardSize === "sm" ? "max-w-[6.5rem]" : ""
        }`}
      />
      <p
        className={`font-bingo text-base ${
          onLight ? "text-[var(--bingo-felt)]" : "text-[var(--bingo-amber)]"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
