const LETTERS = ["B", "I", "N", "G", "O"];
const ROWS = [0, 1, 2, 3, 4];

const isFree = (letter, row) => letter === "N" && row === 2;

const columnCells = (letter) => ROWS.map((row) => [letter, row]);

const customCells = (pattern) => {
  if (!Array.isArray(pattern)) return [];
  const cells = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (pattern[row]?.[col]) cells.push([LETTERS[col], row]);
    }
  }
  return cells;
};

/** Casillas que hay que tapar para ganar, según el modo (1-9). */
export const patternCells = (gameModeId, winPattern) => {
  const mode = Number(gameModeId) || 1;

  if (mode === 9) {
    const cells = customCells(winPattern);
    if (cells.length) return cells;
  }

  switch (mode) {
    case 2:
      return LETTERS.map((letter, i) => [letter, i]);
    case 3:
      return LETTERS.map((letter, i) => [letter, 4 - i]);
    case 4:
      return columnCells("B");
    case 5:
      return columnCells("I");
    case 6:
      return columnCells("N");
    case 7:
      return columnCells("G");
    case 8:
      return columnCells("O");
    default:
      return LETTERS.flatMap(columnCells);
  }
};

const numberAt = (numbers, letter, row) => {
  const value = numbers?.[letter]?.[row];
  return typeof value === "number" ? value : null;
};

/**
 * El bingo se juzga contra las bolas cantadas, no contra las fichas del
 * jugador: así nadie pierde una victoria porque su última ficha viajaba
 * todavía hacia el servidor.
 */
export const hasBingo = (numbers, calledSet, cells) => {
  if (!numbers || !Array.isArray(cells) || !cells.length) return false;

  return cells.every(([letter, row]) => {
    if (isFree(letter, row)) return true;
    const number = numberAt(numbers, letter, row);
    return number != null && calledSet.has(number);
  });
};

const asObject = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  return typeof value === "object" ? value : null;
};

/** Fichas que el jugador puso sobre números realmente cantados. */
export const countValidMarks = (numbers, calledSet, marked) => {
  const marks = asObject(marked);
  if (!marks || Array.isArray(marks)) return 0;

  let total = 0;
  for (const [key, on] of Object.entries(marks)) {
    if (!on || key === "__free") continue;
    const match = /^[BINGO]-(\d+)$/.exec(key);
    if (!match) continue;
    if (calledSet.has(Number(match[1]))) total += 1;
  }

  if (total > 0) return total;

  const card = asObject(numbers);
  if (!card) return 0;
  for (const letter of LETTERS) {
    for (const row of ROWS) {
      if (isFree(letter, row)) continue;
      const number = numberAt(card, letter, row);
      if (number == null) continue;
      if (marks[`${letter}-${number}`] && calledSet.has(number)) total += 1;
    }
  }
  return total;
};
