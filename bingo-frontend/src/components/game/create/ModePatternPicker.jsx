/** Patrones 5x5: [fila][columna] — columnas = B I N G O */

export const LETTERS = ["B", "I", "N", "G", "O"];

export const emptyPattern = () =>
  Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => false));

export const fullPattern = () =>
  Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => true));

const column = (col) =>
  Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, (_, c) => c === col)
  );

const rightDiagonal = () =>
  Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (_, c) => c === r)
  );

const leftDiagonal = () =>
  Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (_, c) => c === 4 - r)
  );

export const clonePattern = (cells) => cells.map((row) => [...row]);

export const countActiveCells = (cells) =>
  cells.reduce((sum, row) => sum + row.filter(Boolean).length, 0);

export const MODE_PATTERNS = [
  {
    id: 1,
    key: "Full Card",
    label: "Cartón completo",
    hint: "Marca las 25 casillas",
    cells: fullPattern(),
  },
  {
    id: 2,
    key: "Right Diagonal",
    label: "Diagonal ╲",
    hint: "Esquina superior izquierda a inferior derecha",
    cells: rightDiagonal(),
  },
  {
    id: 3,
    key: "Left Diagonal",
    label: "Diagonal ╱",
    hint: "Esquina superior derecha a inferior izquierda",
    cells: leftDiagonal(),
  },
  {
    id: 4,
    key: "Column B",
    label: "Columna B",
    hint: "Toda la columna B",
    cells: column(0),
  },
  {
    id: 5,
    key: "Column I",
    label: "Columna I",
    hint: "Toda la columna I",
    cells: column(1),
  },
  {
    id: 6,
    key: "Column N",
    label: "Columna N",
    hint: "Toda la columna N",
    cells: column(2),
  },
  {
    id: 7,
    key: "Column G",
    label: "Columna G",
    hint: "Toda la columna G",
    cells: column(3),
  },
  {
    id: 8,
    key: "Column O",
    label: "Columna O",
    hint: "Toda la columna O",
    cells: column(4),
  },
  {
    id: 9,
    key: "Custom",
    label: "Personalizado",
    hint: "Toca casillas, filas o columnas para armar tu patrón",
    cells: emptyPattern(),
    custom: true,
  },
];

/** Devuelve la matriz 5x5 del modo (usa win_pattern si es personalizado). */
export function getPatternForGameMode(gameModeId, winPattern) {
  const id = Number(gameModeId) || 1;
  if (id === 9 && Array.isArray(winPattern) && winPattern.length === 5) {
    return winPattern.map((row) =>
      Array.isArray(row) ? row.map(Boolean) : [false, false, false, false, false]
    );
  }
  const found = MODE_PATTERNS.find((m) => m.id === id);
  return clonePattern(found?.cells || fullPattern());
}

export function getModeKey(gameModeId) {
  const id = Number(gameModeId) || 1;
  return MODE_PATTERNS.find((m) => m.id === id)?.key || "Full Card";
}

export function getModeLabel(gameModeId) {
  const id = Number(gameModeId) || 1;
  return MODE_PATTERNS.find((m) => m.id === id)?.label || "Bingo";
}
export function toggleCell(cells, r, c) {
  const next = clonePattern(cells);
  next[r][c] = !next[r][c];
  return next;
}

export function toggleRow(cells, r) {
  const next = clonePattern(cells);
  const turnOn = next[r].some((v) => !v);
  next[r] = next[r].map(() => turnOn);
  return next;
}

export function toggleColumn(cells, c) {
  const next = clonePattern(cells);
  const turnOn = next.some((row) => !row[c]);
  for (let r = 0; r < 5; r++) next[r][c] = turnOn;
  return next;
}

/**
 * Mini / preview de cartón con patrón marcado en círculos rojos.
 */
export function PatternBoard({
  cells,
  selected = false,
  onClick,
  onToggleCell,
  interactive = false,
  size = "md",
  showLetters = false,
  className = "",
}) {
  const cellSize =
    size === "lg"
      ? "aspect-square w-full max-w-10"
      : size === "sm"
        ? "aspect-square w-full"
        : "aspect-square w-full max-w-6";
  const gap = size === "lg" ? "gap-1.5" : size === "sm" ? "gap-0.5" : "gap-1";
  const pad = size === "lg" ? "p-3" : size === "sm" ? "p-1.5" : "p-2";
  const dot =
    size === "lg"
      ? "h-[55%] w-[55%] max-h-6 max-w-6"
      : size === "sm"
        ? "h-[55%] w-[55%]"
        : "h-[55%] w-[55%] max-h-3 max-w-3";

  const Wrapper = onClick && !interactive ? "button" : "div";

  return (
    <Wrapper
      type={onClick && !interactive ? "button" : undefined}
      onClick={onClick && !interactive ? onClick : undefined}
      className={`rounded-xl transition ${pad} ${
        selected
          ? "bg-[var(--bingo-felt)] ring-2 ring-[var(--bingo-amber)]"
          : "bg-[var(--bingo-felt-light)] hover:bg-[var(--bingo-felt)]"
      } ${onClick && !interactive ? "cursor-pointer" : ""} ${className}`}
      aria-pressed={onClick && !interactive ? selected : undefined}
    >
      {showLetters && (
        <div className={`mb-1.5 grid grid-cols-5 ${gap}`}>
          {LETTERS.map((letter) => (
            <span
              key={letter}
              className="text-center font-bingo text-[0.55rem] leading-none text-white/90 sm:text-[0.65rem]"
            >
              {letter}
            </span>
          ))}
        </div>
      )}
      <div className={`grid grid-cols-5 ${gap}`}>
        {cells.map((rowCells, r) =>
          rowCells.map((active, c) => {
            const CellTag = interactive ? "button" : "span";
            return (
              <CellTag
                key={`${r}-${c}`}
                type={interactive ? "button" : undefined}
                onClick={
                  interactive
                    ? (e) => {
                        e.stopPropagation();
                        onToggleCell?.(r, c);
                      }
                    : undefined
                }
                className={`flex ${cellSize} items-center justify-center rounded-md bg-[#1a2744] shadow-inner ${
                  interactive
                    ? "cursor-pointer transition hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-[var(--bingo-amber)]"
                    : ""
                }`}
                aria-label={
                  interactive
                    ? `${LETTERS[c]} fila ${r + 1}${active ? " (activa)" : ""}`
                    : undefined
                }
              >
                {active && (
                  <span
                    className={`${dot} rounded-full bg-[var(--bingo-red)] shadow-[0_1px_3px_rgba(0,0,0,0.35)]`}
                  />
                )}
              </CellTag>
            );
          })
        )}
      </div>
    </Wrapper>
  );
}

export default function ModePatternPicker({
  value,
  onChange,
  customCells,
  onCustomCellsChange,
}) {
  const isCustom = value === "Custom";
  const preset = MODE_PATTERNS.find((m) => m.key === value) || MODE_PATTERNS[0];
  const previewCells = isCustom ? customCells : preset.cells;
  const activeCount = countActiveCells(previewCells);

  const selectMode = (key) => {
    onChange(key);
    if (key !== "Custom") {
      const mode = MODE_PATTERNS.find((m) => m.key === key);
      if (mode) onCustomCellsChange?.(clonePattern(mode.cells));
    }
  };

  return (
    <div className="w-full max-w-full space-y-3 overflow-x-hidden">
      <div className="flex flex-col items-center gap-3">
        <PatternBoard
          cells={previewCells}
          size="lg"
          showLetters
          interactive={isCustom}
          onToggleCell={(r, c) =>
            onCustomCellsChange?.(toggleCell(customCells, r, c))
          }
          className="w-[min(100%,13.5rem)] shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
        />
        <div className="w-full min-w-0 text-center">
          <p className="font-bingo text-lg leading-none text-[var(--bingo-felt)]">
            {isCustom ? "Personalizado" : preset.label}
          </p>
          <p className="mt-1.5 text-sm text-bingo-ink/65">
            {isCustom
              ? "Toca casillas del cartón o usa filas/columnas rápidas"
              : preset.hint}
          </p>
          <p className="mt-2 text-xs font-semibold text-bingo-felt/70">
            {activeCount} casilla{activeCount === 1 ? "" : "s"} requerida
            {activeCount === 1 ? "" : "s"}
          </p>

          {isCustom && (
            <div className="mt-3 space-y-2">
              <div>
                <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                  Filas
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((r) => (
                    <button
                      key={`row-${r}`}
                      type="button"
                      onClick={() =>
                        onCustomCellsChange?.(toggleRow(customCells, r))
                      }
                      className="rounded-lg border border-bingo-felt/25 bg-white/60 px-2.5 py-1 text-xs font-bold text-[var(--bingo-felt)] transition hover:bg-white"
                    >
                      F{r + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                  Columnas
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {LETTERS.map((letter, c) => (
                    <button
                      key={`col-${letter}`}
                      type="button"
                      onClick={() =>
                        onCustomCellsChange?.(toggleColumn(customCells, c))
                      }
                      className="rounded-lg border border-bingo-felt/25 bg-white/60 px-2.5 py-1 text-xs font-bold text-[var(--bingo-felt)] transition hover:bg-white"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onCustomCellsChange?.(fullPattern())}
                  className="rounded-lg bg-bingo-felt/10 px-2.5 py-1 text-xs font-semibold text-[var(--bingo-felt)]"
                >
                  Llenar todo
                </button>
                <button
                  type="button"
                  onClick={() => onCustomCellsChange?.(emptyPattern())}
                  className="rounded-lg bg-bingo-red/10 px-2.5 py-1 text-xs font-semibold text-[var(--bingo-red)]"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {!isCustom && (
            <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-widest text-bingo-felt/50">
              Elige un patrón abajo
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-sm grid-cols-3 justify-items-center gap-2.5">
        {MODE_PATTERNS.map((mode) => {
          const thumb =
            mode.key === "Custom" ? customCells : mode.cells;
          const isSelected = mode.key === value;
          return (
            <div
              key={mode.key}
              className="flex w-full max-w-[5.5rem] flex-col items-center gap-1"
            >
              <PatternBoard
                cells={thumb}
                size="sm"
                selected={isSelected}
                onClick={() => selectMode(mode.key)}
                className="w-full"
              />
              <span
                className={`w-full truncate text-center text-[0.6rem] font-semibold leading-tight ${
                  isSelected
                    ? "text-[var(--bingo-felt)]"
                    : "text-bingo-ink/55"
                }`}
              >
                {mode.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
