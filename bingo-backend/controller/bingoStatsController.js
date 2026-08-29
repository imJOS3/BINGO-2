import games from "../model/games.js";
import db from "../database/db.js";

const letterOf = (n) => {
  if (n >= 1 && n <= 15) return "B";
  if (n >= 16 && n <= 30) return "I";
  if (n >= 31 && n <= 45) return "N";
  if (n >= 46 && n <= 60) return "G";
  return "O";
};

export const getCasinoStats = async (req, res) => {
  try {
    const [frequencyRows] = await db.query(`
      SELECT number_called AS number, COUNT(*) AS times
      FROM called_numbers
      GROUP BY number_called
    `);

    const freqMap = new Map(
      (frequencyRows || []).map((row) => [Number(row.number), Number(row.times)])
    );

    const allNumbers = Array.from({ length: 75 }, (_, i) => {
      const number = i + 1;
      return {
        number,
        letter: letterOf(number),
        times: freqMap.get(number) || 0,
      };
    });

    const sorted = [...allNumbers].sort(
      (a, b) => b.times - a.times || a.number - b.number
    );

    const letterCounts = { B: 0, I: 0, N: 0, G: 0, O: 0 };
    let totalDraws = 0;
    for (const item of allNumbers) {
      letterCounts[item.letter] += item.times;
      totalDraws += item.times;
    }

    const [winnerRows] = await db.query(`
      SELECT winner_nickname AS nickname, COUNT(*) AS wins
      FROM games
      WHERE winner_id IS NOT NULL AND winner_nickname IS NOT NULL
      GROUP BY winner_id, winner_nickname
      ORDER BY wins DESC
      LIMIT 8
    `);

    const gamesPlayed = await games.count();
    const gamesCompleted = await games.count({ where: { game_status: "completed" } });

    res.status(200).json({
      totalDraws,
      gamesPlayed,
      gamesCompleted,
      hotNumbers: sorted.filter((n) => n.times > 0).slice(0, 8),
      coldNumbers: [...sorted].reverse().slice(0, 8),
      letterCounts,
      topWinners: winnerRows || [],
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
  }
};
