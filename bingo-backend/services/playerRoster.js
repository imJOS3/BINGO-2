import UserGames from "../model/UserGames.js";
import User from "../model/Users.js";
import games from "../model/games.js";
import db from "../database/db.js";
import { getIO } from "../socket.js";
import { stopBallCaller } from "./ballCaller.js";
import { Op } from "sequelize";

export async function closeGameIfEmpty(game) {
  if (!game) return { closed: false, game };

  const count = await UserGames.count({ where: { game_id: game.id } });
  game.user_count = count;

  if (count > 0) {
    if (game.changed("user_count")) await game.save();
    return { closed: false, game };
  }

  const wasOpen = game.game_status !== "completed";
  if (wasOpen) {
    game.game_status = "completed";
    game.ended_at = new Date();
  }
  await game.save();
  stopBallCaller(game.id);

  if (wasOpen) {
    const io = getIO();
    if (io) {
      const payload = {
        gameId: game.id,
        game: game.get({ plain: true }),
        reason: "empty",
      };
      io.emit("gameClosed", payload);
      io.to(`game:${game.id}`).emit("gameClosed", payload);
    }
  }

  return { closed: wasOpen, game };
}

export async function closeDesertedGame(game) {
  if (!game || game.game_status === "completed") {
    return { closed: false, game };
  }

  game.game_status = "completed";
  game.ended_at = new Date();
  await game.save();
  stopBallCaller(game.id);

  const io = getIO();
  if (io) {
    const payload = {
      gameId: game.id,
      game: game.get({ plain: true }),
      reason: "empty",
    };
    io.emit("gameClosed", payload);
    io.to(`game:${game.id}`).emit("gameClosed", payload);
  }

  return { closed: true, game };
}

export async function closeAbandonedGames() {
  const openGames = await games.findAll({
    where: { game_status: { [Op.ne]: "completed" } },
  });
  for (const game of openGames) {
    await closeGameIfEmpty(game);
  }
}

/**
 * Sienta a quienes esperaban en cola porque llegaron con la ronda empezada.
 * Se llama al abrir una ronda nueva. Devuelve los ids promovidos.
 */
export async function promoteSpectators(gameId) {
  const waiting = await UserGames.findAll({
    where: { game_id: gameId, is_spectator: true },
    attributes: ["user_id"],
  });
  if (!waiting.length) return [];

  await UserGames.update(
    { is_spectator: false },
    { where: { game_id: gameId, is_spectator: true } }
  );

  const userIds = waiting.map((row) => Number(row.user_id));

  const io = getIO();
  if (io) {
    io.emit("spectatorsPromoted", { gameId: Number(gameId), userIds });
  }

  return userIds;
}

export async function removePlayerFromGame(gameId, userId, { reason = "left" } = {}) {
  const game = await games.findByPk(gameId);
  if (!game) return { ok: false, status: 404, message: "Partida no encontrada" };

  const leaver = await User.findByPk(userId);

  const deleted = await db.transaction(async (t) => {
    const count = await UserGames.destroy({
      where: { game_id: gameId, user_id: userId },
      transaction: t,
    });

    if (count > 0 && game.user_count > 0) {
      await game.decrement("user_count", { by: 1, transaction: t });
    }

    return count;
  });

  if (!deleted) {
    return { ok: false, status: 404, message: "El jugador no está en la partida o ya salió" };
  }

  await game.reload();
  const { closed } = await closeGameIfEmpty(game);
  await game.reload();

  const gamePayload = game.get({ plain: true });
  const payload = {
    gameId: game.id,
    userId: Number(userId),
    nickname: leaver?.nickname || "Un jugador",
    userCount: game.user_count,
    game: gamePayload,
    reason,
    closed,
  };

  const io = getIO();
  if (io) io.emit("playerLeft", payload);

  return { ok: true, game, payload, closed };
}
