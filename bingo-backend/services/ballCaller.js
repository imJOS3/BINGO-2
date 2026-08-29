import games from "../model/games.js";
import CalledNumbers from "../model/calledNumber.js";
import db from "../database/db.js";
import { getIO } from "../socket.js";

const CALL_EVERY_MS = 5000;
const FIRST_DELAY_MS = 2000;
const timers = new Map();

export const letterOf = (number) => {
  if (number >= 1 && number <= 15) return "B";
  if (number >= 16 && number <= 30) return "I";
  if (number >= 31 && number <= 45) return "N";
  if (number >= 46 && number <= 60) return "G";
  if (number >= 61 && number <= 75) return "O";
  return "";
};

const timerKey = (gameId) => String(gameId);

export const stopBallCaller = (gameId) => {
  const key = timerKey(gameId);
  const handle = timers.get(key);
  if (!handle) return;
  if (handle.timeout) clearTimeout(handle.timeout);
  if (handle.interval) clearInterval(handle.interval);
  timers.delete(key);
};

const emitCalled = (gameId, payload) => {
  const io = getIO();
  if (!io) return;
  io.emit("numberCalled", {
    gameId: Number(gameId),
    ...payload,
  });
};

export const callNextNumber = async (gameId) => {
  const result = await db.transaction(async (t) => {
    const game = await games.findByPk(gameId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!game) return { notFound: true };
    if (game.game_status === "completed") {
      return {
        finished: true,
        game,
        winner: { id: game.winner_id, nickname: game.winner_nickname },
      };
    }
    if (game.game_status !== "in_progress") {
      return { invalidStatus: true, status: game.game_status };
    }

    const existing = await CalledNumbers.findAll({
      where: { game_id: gameId },
      attributes: ["number_called"],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    const calledSet = new Set(existing.map((row) => row.number_called));
    if (calledSet.size >= 75) return { allCalled: true, calledCount: 75 };

    let nextNumber;
    do {
      nextNumber = Math.floor(Math.random() * 75) + 1;
    } while (calledSet.has(nextNumber));

    const row = await CalledNumbers.create(
      { game_id: gameId, number_called: nextNumber },
      { transaction: t }
    );

    return {
      row,
      number: nextNumber,
      letter: letterOf(nextNumber),
      calledCount: calledSet.size + 1,
    };
  });

  if (result.finished || result.invalidStatus || result.notFound) {
    stopBallCaller(gameId);
    return result;
  }
  if (result.allCalled) {
    stopBallCaller(gameId);
    return result;
  }

  emitCalled(gameId, {
    number: result.number,
    letter: result.letter,
    calledCount: result.calledCount,
    calledAt: result.row.called_at || new Date().toISOString(),
  });

  return result;
};

export const startBallCaller = (gameId) => {
  if (!gameId) return;
  const key = timerKey(gameId);
  if (timers.has(key)) return;

  const tick = () => {
    callNextNumber(gameId).catch((error) => {
      console.warn(`No se pudo cantar bola de la mesa ${gameId}:`, error.message);
    });
  };

  const timeout = setTimeout(() => {
    tick();
    const interval = setInterval(tick, CALL_EVERY_MS);
    const current = timers.get(key);
    if (current) {
      current.timeout = null;
      current.interval = interval;
    }
  }, FIRST_DELAY_MS);

  timers.set(key, { timeout, interval: null });
};

export const restartBallCaller = (gameId) => {
  stopBallCaller(gameId);
  startBallCaller(gameId);
};

export const resumeActiveCallers = async () => {
  try {
    const active = await games.findAll({
      where: { game_status: "in_progress" },
      attributes: ["id"],
    });
    for (const game of active) startBallCaller(game.id);
    if (active.length) {
      console.log(`Cantando bolas en ${active.length} partida(s) en curso`);
    }
  } catch (error) {
    console.warn("No se pudieron reanudar las bolas:", error.message);
  }
};
