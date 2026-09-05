import games from "../model/games.js";
import User from "../model/Users.js";
import UserGames from "../model/UserGames.js";
import BingoCards from "../model/bingoCards.js";
import CalledNumbers from "../model/calledNumber.js";
import db from "../database/db.js";
import { getIO } from "../socket.js";
import { stopBallCaller } from "./ballCaller.js";
import { promoteSpectators } from "./playerRoster.js";
import { countValidMarks } from "../utils/bingoCard/winPattern.js";

/** Tramo final en el que cantar un bingo falso deja fuera de la ronda. */
export const LAST_CALL_MS = 60000;

const timers = new Map();

const key = (gameId) => String(gameId);

export const remainingMs = (game) => {
  const total = (Number(game?.game_time) || 0) * 60000;
  if (!game?.started_at) return total;

  const startedAt = new Date(game.started_at).getTime();
  if (Number.isNaN(startedAt)) return total;

  return Math.max(0, startedAt + total - Date.now());
};

/** Últimos segundos de la ronda: aquí fallar un bingo cuesta la silla. */
export const isLastCall = (game) =>
  game?.game_status === "in_progress" && remainingMs(game) <= LAST_CALL_MS;

export const cancelTimeUp = (gameId) => {
  const handle = timers.get(key(gameId));
  if (!handle) return;
  clearTimeout(handle);
  timers.delete(key(gameId));
};

export const scheduleTimeUp = (game) => {
  if (!game?.id) return;
  cancelTimeUp(game.id);
  if (game.game_status !== "in_progress") return;

  const handle = setTimeout(() => {
    timers.delete(key(game.id));
    runConsolationRaffle(game.id).catch((error) => {
      console.warn(`No se pudo sortear la mesa ${game.id}:`, error.message);
    });
  }, remainingMs(game));

  timers.set(key(game.id), handle);
};

/** Tras un reinicio del servidor los relojes viven solo en memoria. */
export const resumeTimeUps = async () => {
  try {
    const active = await games.findAll({ where: { game_status: "in_progress" } });
    for (const game of active) scheduleTimeUp(game);
  } catch (error) {
    console.warn("No se pudieron reanudar los relojes:", error.message);
  }
};

/**
 * Papeletas: una de regalo para que nadie quede fuera del sorteo y una más
 * por cada ficha puesta sobre un número cantado. Quien cantó un bingo falso
 * en el último minuto se queda sin ninguna.
 */
const ticketsFor = ({ eliminated, marks }) => (eliminated ? 0 : marks + 1);

const drawWinner = (participants) => {
  const total = participants.reduce((sum, p) => sum + p.tickets, 0);
  if (!total) return null;

  let roll = Math.random() * total;
  for (const participant of participants) {
    roll -= participant.tickets;
    if (roll < 0) return participant;
  }
  return participants[participants.length - 1];
};

export const runConsolationRaffle = async (gameId) => {
  cancelTimeUp(gameId);

  const result = await db.transaction(async (t) => {
    const game = await games.findByPk(gameId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!game || game.game_status !== "in_progress") return { skipped: true };

    // El temporizador puede despertar antes de tiempo si la ronda se reinició.
    if (remainingMs(game) > 1500) return { skipped: true, reschedule: game };

    const seats = await UserGames.findAll({
      where: { game_id: gameId, is_spectator: false },
      include: { model: User, attributes: ["id", "nickname"] },
      transaction: t,
    });
    const cards = await BingoCards.findAll({
      where: { game_id: gameId },
      transaction: t,
    });
    const called = await CalledNumbers.findAll({
      where: { game_id: gameId },
      attributes: ["number_called"],
      transaction: t,
    });

    const calledSet = new Set(called.map((row) => Number(row.number_called)));
    const cardByUser = new Map(cards.map((card) => [String(card.user_id), card]));

    const participants = seats
      .map((seat) => {
        const card = cardByUser.get(String(seat.user_id));
        const eliminated = Boolean(seat.eliminated_at);
        const marks = countValidMarks(card?.numbers, calledSet, card?.marked_numbers);
        return {
          userId: Number(seat.user_id),
          nickname: seat.User?.nickname || `Jugador ${seat.user_id}`,
          marks,
          eliminated,
          tickets: ticketsFor({ eliminated, marks }),
        };
      })
      .sort((a, b) => b.tickets - a.tickets);

    const winner = drawWinner(participants.filter((p) => p.tickets > 0));

    game.game_status = "completed";
    game.ended_at = new Date();
    game.winner_id = winner ? winner.userId : null;
    game.winner_nickname = winner ? winner.nickname : null;
    await game.save({ transaction: t });

    return { game, participants, winner };
  });

  if (result.skipped) {
    if (result.reschedule) scheduleTimeUp(result.reschedule);
    return result;
  }

  stopBallCaller(gameId);
  const promoted = await promoteSpectators(gameId);

  const payload = {
    gameId: Number(gameId),
    reason: "timeUp",
    participants: result.participants,
    totalTickets: result.participants.reduce((sum, p) => sum + p.tickets, 0),
    winner: result.winner
      ? {
          id: result.winner.userId,
          nickname: result.winner.nickname,
          tickets: result.winner.tickets,
        }
      : null,
    game: result.game.get({ plain: true }),
    promoted,
  };

  const io = getIO();
  if (io) io.emit("roundRaffle", payload);

  return payload;
};
