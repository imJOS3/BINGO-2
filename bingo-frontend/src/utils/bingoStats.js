export const LETTERS = ["B", "I", "N", "G", "O"];

export const LETTER_RANGES = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

export const LETTER_COLORS = {
  B: "#e23d3d",
  I: "#1f8a5a",
  N: "#1d6fb8",
  G: "#f0b429",
  O: "#d97706",
};

export function getBingoLetter(number) {
  if (number >= 1 && number <= 15) return "B";
  if (number >= 16 && number <= 30) return "I";
  if (number >= 31 && number <= 45) return "N";
  if (number >= 46 && number <= 60) return "G";
  if (number >= 61 && number <= 75) return "O";
  return "";
}

export function buildLiveStats(calledNumbers = []) {
  const called = calledNumbers
    .map((item) => Number(item.number ?? item.number_called))
    .filter((n) => n >= 1 && n <= 75);
  const calledSet = new Set(called);
  const last = [...called].reverse().slice(0, 10);

  const letterCounts = { B: 0, I: 0, N: 0, G: 0, O: 0 };
  let even = 0;
  let odd = 0;
  let low = 0;
  let high = 0;

  for (const number of called) {
    const letter = getBingoLetter(number);
    if (letter) letterCounts[letter] += 1;
    if (number % 2 === 0) even += 1;
    else odd += 1;
    if (number <= 37) low += 1;
    else high += 1;
  }

  const hottestLetter = LETTERS.reduce((best, letter) =>
    letterCounts[letter] > letterCounts[best] ? letter : best
  );

  const coldestLetter = LETTERS.reduce((worst, letter) =>
    letterCounts[letter] < letterCounts[worst] ? letter : worst
  );

  const remainingByLetter = {};
  for (const letter of LETTERS) {
    const [min, max] = LETTER_RANGES[letter];
    remainingByLetter[letter] = [];
    for (let n = min; n <= max; n++) {
      if (!calledSet.has(n)) remainingByLetter[letter].push(n);
    }
  }

  return {
    total: called.length,
    remaining: 75 - called.length,
    last,
    letterCounts,
    hottestLetter,
    coldestLetter,
    even,
    odd,
    low,
    high,
    remainingByLetter,
    calledSet,
  };
}
