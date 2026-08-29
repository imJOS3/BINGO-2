const LETTER_COLORS = {
  B: { mid: "#e23d3d", light: "#ff7a7a", dark: "#9a1c1c", ink: "#7a1212" },
  I: { mid: "#1f8a5a", light: "#3ecf8e", dark: "#0f5a3a", ink: "#0a472e" },
  N: { mid: "#1d6fb8", light: "#4da3e8", dark: "#0e4578", ink: "#0a3560" },
  G: { mid: "#f0b429", light: "#ffd666", dark: "#b07d0f", ink: "#6b4a08" },
  O: { mid: "#d97706", light: "#f5a623", dark: "#8a4b04", ink: "#5c3203" },
};

/**
 * Bola de bingo estilo casino: esfera brillante + medallón blanco.
 * @param {'sm'|'md'|'lg'|'fill'} size
 */
export default function BingoBall({
  letter = "B",
  number,
  size = "md",
  className = "",
  style,
}) {
  const colors = LETTER_COLORS[letter] || LETTER_COLORS.B;
  const sizeClass =
    size === "sm"
      ? "bingo-ball--sm"
      : size === "lg"
        ? "bingo-ball--lg"
        : size === "fill"
          ? "bingo-ball--fill"
          : "bingo-ball--md";

  return (
    <div
      className={`bingo-ball ${sizeClass} ${className}`.trim()}
      data-letter={letter}
      style={{
        "--ball-mid": colors.mid,
        "--ball-light": colors.light,
        "--ball-dark": colors.dark,
        "--ball-ink": colors.ink,
        ...style,
      }}
      aria-label={number != null ? `${letter}-${number}` : letter}
    >
      <span className="bingo-ball__glow" aria-hidden="true" />
      <span className="bingo-ball__shell" aria-hidden="true" />
      <span className="bingo-ball__shine" aria-hidden="true" />
      <span className="bingo-ball__band" aria-hidden="true" />
      <div className="bingo-ball__badge">
        <span className="bingo-ball__letter">{letter}</span>
        {number != null && <span className="bingo-ball__number">{number}</span>}
      </div>
      <span className="bingo-ball__rim" aria-hidden="true" />
    </div>
  );
}

export { LETTER_COLORS };
