const LETTERS = ["B", "I", "N", "G", "O"];

const isMarked = (selectedCard, selectedNumbers, letter, rowIdx) => {
  if (letter === "N" && rowIdx === 2) return true; // FREE
  const number = selectedCard?.numbers?.[letter]?.[rowIdx];
  if (number == null) return false;
  return !!selectedNumbers[`${letter}-${number}`];
};

const matchesPattern = (selectedCard, selectedNumbers, pattern) => {
  if (!Array.isArray(pattern) || pattern.length !== 5) return false;
  for (let r = 0; r < 5; r++) {
    const row = pattern[r];
    if (!Array.isArray(row) || row.length !== 5) return false;
    for (let c = 0; c < 5; c++) {
      if (!row[c]) continue;
      if (!isMarked(selectedCard, selectedNumbers, LETTERS[c], r)) {
        return false;
      }
    }
  }
  return pattern.some((row) => row.some(Boolean));
};

/** Comprueba si el cartón cumple el modo de juego (game_mode_id 1–9). */
export function checkBingoWin(selectedCard, selectedNumbers, gameModeId, winPattern) {
  if (!selectedCard?.numbers) return false;

  const mode = Number(gameModeId) || 1;

  if (mode === 9 && winPattern) {
    return matchesPattern(selectedCard, selectedNumbers, winPattern);
  }

  switch (mode) {
    case 2: // Right Diagonal
      return LETTERS.every((letter, i) => isMarked(selectedCard, selectedNumbers, letter, i));
    case 3: // Left Diagonal
      return LETTERS.every((letter, i) => isMarked(selectedCard, selectedNumbers, letter, 4 - i));
    case 4: // Column B
      return [0, 1, 2, 3, 4].every((row) => isMarked(selectedCard, selectedNumbers, "B", row));
    case 5: // Column I
      return [0, 1, 2, 3, 4].every((row) => isMarked(selectedCard, selectedNumbers, "I", row));
    case 6: // Column N
      return [0, 1, 2, 3, 4].every((row) => isMarked(selectedCard, selectedNumbers, "N", row));
    case 7: // Column G
      return [0, 1, 2, 3, 4].every((row) => isMarked(selectedCard, selectedNumbers, "G", row));
    case 8: // Column O
      return [0, 1, 2, 3, 4].every((row) => isMarked(selectedCard, selectedNumbers, "O", row));
    case 1: // Full Card
    case 9: // Custom sin patrón → cartón completo
    default:
      return LETTERS.every((letter) =>
        [0, 1, 2, 3, 4].every((row) => isMarked(selectedCard, selectedNumbers, letter, row))
      );
  }
}

export const GAME_MODE_UI = {
  1: { mode: "full", message: "Llena todo el cartón" },
  2: { mode: "rightDiagonal", message: "Completa la diagonal derecha" },
  3: { mode: "leftDiagonal", message: "Completa la diagonal izquierda" },
  4: { mode: "BsingleColumn", message: "Completa la columna B" },
  5: { mode: "IsingleColumn", message: "Completa la columna I" },
  6: { mode: "NsingleColumn", message: "Completa la columna N" },
  7: { mode: "GsingleColumn", message: "Completa la columna G" },
  8: { mode: "OsingleColumn", message: "Completa la columna O" },
  9: { mode: "custom", message: "Completa el patrón personalizado" },
};
