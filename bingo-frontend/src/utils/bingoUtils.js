export const BINGO_LETTERS = ["B", "I", "N", "G", "O"];

function rngFromSeed(seed) {
  let s = Math.abs(Number(seed) || 1) % 2147483646;
  if (s === 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(value) {
  const text = String(value);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

export function numberRangeForLetter(letter) {
  const index = Math.max(0, BINGO_LETTERS.indexOf(letter));
  const start = index * 15 + 1;
  return { start, end: start + 14 };
}

function shuffleInPlace(items, rand) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Pelotas aleatorias. Si count >= 5, incluye al menos una de cada letra B-I-N-G-O.
 */
export function generateRandomBingoBalls(
  count = 5,
  { seed, keepLetterOrder = false } = {}
) {
  const rand =
    seed == null
      ? Math.random
      : rngFromSeed(typeof seed === "string" ? hashString(seed) : seed);
  const used = new Set();

  const pickNumber = (letter) => {
    const { start } = numberRangeForLetter(letter);
    let number;
    let attempts = 0;
    do {
      number = start + Math.floor(rand() * 15);
      attempts += 1;
    } while (used.has(number) && attempts < 30);
    used.add(number);
    return number;
  };

  const balls = [];

  if (count >= 5) {
    for (const letter of BINGO_LETTERS) {
      balls.push({ letter, number: pickNumber(letter) });
    }
    while (balls.length < count) {
      const letter = BINGO_LETTERS[Math.floor(rand() * BINGO_LETTERS.length)];
      balls.push({ letter, number: pickNumber(letter) });
    }
  } else {
    const pool = shuffleInPlace([...BINGO_LETTERS], rand);
    for (let i = 0; i < count; i++) {
      balls.push({ letter: pool[i], number: pickNumber(pool[i]) });
    }
  }

  if (!keepLetterOrder) shuffleInPlace(balls, rand);
  return balls;
}

export function generateBingoCard() {
  const card = [];
  
  for (let i = 0; i < 5; i++) {
    const column = [];
    const start = i * 15 + 1;
    
    for (let j = 0; j < 5; j++) {
      let num;
      do {
        num = Math.floor(Math.random() * 15) + start;
      } while (column.includes(num));
      column.push(num);
    }
    card.push(column);
  }
  
  card[2][2] = "FREE";
  return card;
}

export function getBallVariants() {
  return {
    entering: {
      left: '50%',
      x: '-50%',
      rotate: 720,
      transition: {
        left: { duration: 2, ease: "easeOut" },
        x: { duration: 2, ease: "easeOut" },
        rotate: { duration: 2, ease: "linear" }
      }
    },
    stopped: {
      left: '50%',
      x: '-50%',
      rotate: 720,
      transition: { duration: 0 }
    },
    exiting: {
      left: '100%',
      x: '100%',
      rotate: 1440,
      transition: {
        duration: 2,
        ease: "easeIn"
      }
    }
  };
}

export function generateBingoBall(usedNumbers, setUsedNumbers) {
  const letters = ["B", "I", "N", "G", "O"];
  let num, letter, columnIndex;
  
  // Genera un número que no haya sido usado anteriormente
  do {
    // Selecciona una columna aleatoria (0-4)
    columnIndex = Math.floor(Math.random() * 5);
    // Calcula el rango de números para esa columna
    const start = columnIndex * 15 + 1;
    // Genera un número aleatorio en ese rango
    num = Math.floor(Math.random() * 15) + start;
  } while (usedNumbers.has(num)); // Repite si el número ya fue usado

  // Agrega el número al conjunto de números usados
  setUsedNumbers(prev => new Set([...prev, num]));
  
  // Asigna la letra correspondiente según la columna
  letter = letters[columnIndex];
  
  return { letter, num };
}