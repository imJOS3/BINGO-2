import games from "../model/games.js";
import { getIO } from "../socket.js";
import { removePlayerFromGame, closeDesertedGame } from "./playerRoster.js";

/** Margen para volver tras recargar la página antes de soltar la silla. */
const RECONNECT_GRACE_MS = 20000;
/** Tiempo sin nadie conectado antes de cerrar la mesa. */
const DESERTED_CLOSE_MS = 60000;

/** gameId -> userId -> { nickname, sockets, status, graceTimer } */
const rooms = new Map();
/** socket.id -> { gameId, userId } */
const socketIndex = new Map();
/** gameId -> timeout */
const desertedTimers = new Map();

const roomOf = (gameId) => {
  const key = String(gameId);
  if (!rooms.has(key)) rooms.set(key, new Map());
  return rooms.get(key);
};

const clearGrace = (entry) => {
  if (entry?.graceTimer) {
    clearTimeout(entry.graceTimer);
    entry.graceTimer = null;
  }
};

const snapshot = (gameId) => {
  const room = rooms.get(String(gameId));
  if (!room) return [];
  return [...room.entries()]
    .filter(([, entry]) => entry.sockets.size > 0)
    .map(([userId, entry]) => ({
      userId: Number(userId),
      nickname: entry.nickname,
      status: entry.status,
    }));
};

const emitPresence = (gameId, change = null) => {
  const io = getIO();
  if (!io) return;
  io.to(`game:${gameId}`).emit("playerPresence", {
    gameId: Number(gameId) || gameId,
    players: snapshot(gameId),
    change,
  });
};

export const onlineCount = (gameId) => snapshot(gameId).length;

export const presenceMap = (gameId) => {
  const room = rooms.get(String(gameId));
  if (!room) return {};
  return Object.fromEntries(
    [...room.entries()].map(([userId, entry]) => [
      String(userId),
      entry.sockets.size > 0 ? entry.status : "disconnected",
    ])
  );
};

const cancelDesertedCheck = (gameId) => {
  const key = String(gameId);
  const timer = desertedTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    desertedTimers.delete(key);
  }
};

/** Cierra la mesa si pasa el tiempo y sigue sin nadie conectado. */
const scheduleDesertedCheck = (gameId) => {
  const key = String(gameId);
  cancelDesertedCheck(gameId);

  desertedTimers.set(
    key,
    setTimeout(async () => {
      desertedTimers.delete(key);
      if (onlineCount(gameId) > 0) return;

      try {
        const game = await games.findByPk(gameId);
        if (game && game.game_status !== "completed") {
          await closeDesertedGame(game);
        }
      } catch (error) {
        console.warn("No se pudo cerrar la mesa vacía:", error.message);
      }

      const room = rooms.get(key);
      if (room) {
        for (const entry of room.values()) clearGrace(entry);
        rooms.delete(key);
      }
    }, DESERTED_CLOSE_MS)
  );
};

export const joinPresence = (socket, { gameId, userId, nickname }) => {
  if (!gameId || userId == null) return;

  const prev = socketIndex.get(socket.id);
  if (prev) leavePresence(socket, { silent: true });

  const uid = String(userId);
  const room = roomOf(gameId);
  const existing = room.get(uid) || {
    nickname: nickname || "Jugador",
    sockets: new Set(),
    status: "online",
    graceTimer: null,
  };

  const wasOffline = existing.sockets.size === 0;
  clearGrace(existing);
  existing.nickname = nickname || existing.nickname || "Jugador";
  existing.sockets.add(socket.id);
  existing.status = "online";
  room.set(uid, existing);

  socket.join(`game:${gameId}`);
  socketIndex.set(socket.id, { gameId: String(gameId), userId: uid });
  cancelDesertedCheck(gameId);

  emitPresence(gameId, {
    userId: Number(uid),
    nickname: existing.nickname,
    status: "online",
    reason: wasOffline ? "back" : "join",
  });
};

export const setAway = (socket, away) => {
  const meta = socketIndex.get(socket.id);
  if (!meta) return;
  const entry = rooms.get(meta.gameId)?.get(meta.userId);
  if (!entry || entry.sockets.size === 0) return;

  const next = away ? "away" : "online";
  if (entry.status === next) return;
  entry.status = next;

  emitPresence(meta.gameId, {
    userId: Number(meta.userId),
    nickname: entry.nickname,
    status: next,
    reason: away ? "away" : "back",
  });
};

export const leavePresence = (socket, { silent = false } = {}) => {
  const meta = socketIndex.get(socket.id);
  if (!meta) return;
  socketIndex.delete(socket.id);

  const room = rooms.get(meta.gameId);
  const entry = room?.get(meta.userId);
  if (!entry) return;

  entry.sockets.delete(socket.id);
  if (entry.sockets.size > 0) return;

  if (silent) {
    clearGrace(entry);
    room.delete(meta.userId);
    emitPresence(meta.gameId);
    if (room.size === 0) rooms.delete(meta.gameId);
    if (onlineCount(meta.gameId) === 0) scheduleDesertedCheck(meta.gameId);
    return;
  }

  entry.status = "disconnected";
  emitPresence(meta.gameId, {
    userId: Number(meta.userId),
    nickname: entry.nickname,
    status: "disconnected",
    reason: "disconnect",
  });

  if (onlineCount(meta.gameId) === 0) scheduleDesertedCheck(meta.gameId);

  clearGrace(entry);
  entry.graceTimer = setTimeout(
    () => void releaseSeat(meta.gameId, meta.userId),
    RECONNECT_GRACE_MS
  );
};

/** Tras el margen de reconexión: en sala de espera libera la silla. */
const releaseSeat = async (gameId, userId) => {
  const room = rooms.get(String(gameId));
  const entry = room?.get(String(userId));
  if (!entry || entry.sockets.size > 0) return;

  clearGrace(entry);
  room.delete(String(userId));
  if (room.size === 0) rooms.delete(String(gameId));

  try {
    const game = await games.findByPk(gameId);
    if (game?.game_status === "active") {
      await removePlayerFromGame(gameId, userId, { reason: "disconnect" });
    }
  } catch (error) {
    console.warn("No se pudo liberar la silla:", error.message);
  }

  emitPresence(gameId);
};

/**
 * Al arrancar el servidor la presencia está vacía: damos margen a que los
 * clientes se reconecten y solo después cerramos las mesas sin nadie.
 */
export const scheduleStartupSweep = async () => {
  try {
    const openGames = await games.findAll({
      where: { game_status: ["active", "in_progress"] },
    });
    for (const game of openGames) scheduleDesertedCheck(game.id);
  } catch (error) {
    console.warn("No se pudo revisar mesas al arrancar:", error.message);
  }
};
