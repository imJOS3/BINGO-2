import UserGames from "../model/UserGames.js";
import User from "../model/Users.js";
import games from "../model/games.js";
import db from "../database/db.js";
import { getIO } from "../socket.js";
import { removePlayerFromGame, closeGameIfEmpty } from "../services/playerRoster.js";
import { presenceMap, onlineCount } from "../services/presence.js";
import { keysMatch, toClientGame } from "../utils/gamePublic.js";

const sameId = (a, b) => Number(a) === Number(b);

export const joinGame = async (req, res) => {
    const { game_id } = req.params;
    const user_id = req.userId || req.body.user_id;

    try {
        if (!game_id || !user_id) {
            return res.status(400).json({ message: "game_id y user_id son obligatorios" });
        }

        const game = await games.findByPk(game_id);
        if (!game) {
            return res.status(404).json({ message: "Partida no encontrada" });
        }

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const existing = await UserGames.findOne({ where: { user_id, game_id } });
        if (existing) {
            return res.status(200).json({
                message: existing.is_spectator
                    ? "Ya estás en la cola de esta mesa"
                    : "Ya estás unido a esta partida",
                alreadyJoined: true,
                spectator: existing.is_spectator,
                eliminated: Boolean(existing.eliminated_at),
                game: toClientGame(game, { viewerId: user_id }),
            });
        }

        if (!game.is_public && !sameId(game.creator_id, user_id)) {
            if (!keysMatch(game.join_key, req.body.join_key)) {
                return res.status(403).json({
                    code: "BAD_JOIN_KEY",
                    message: "Clave incorrecta",
                });
            }
        }

        const { closed } = await closeGameIfEmpty(game);
        await game.reload();
        if (closed || game.user_count === 0) {
            return res.status(400).json({
                message: "No se puede unir a esta mesa ahora",
            });
        }

        // Mesa en juego sin nadie conectado: el barrido de presencia la cerrará.
        if (game.game_status === "in_progress" && onlineCount(game.id) === 0) {
            return res.status(400).json({
                message: "No se puede unir a esta mesa ahora",
            });
        }

        // Solo entra a cola si la ronda va en marcha. Entre rondas se sienta.
        const spectator = game.game_status === "in_progress";

        await db.transaction(async (t) => {
            await UserGames.create(
                { user_id, game_id, is_spectator: spectator },
                { transaction: t }
            );
            await game.increment("user_count", { by: 1, transaction: t });
        });

        await game.reload();
        const gamePayload = toClientGame(game);

        const io = getIO();
        if (io) {
            io.emit("playerJoined", {
                gameId: game.id,
                userId: user.id,
                nickname: user.nickname,
                userCount: game.user_count,
                spectator,
                game: gamePayload,
            });
        }

        res.status(200).json({
            message: spectator
                ? "La ronda ya empezó: estás en cola para la siguiente"
                : "Unido a la partida con éxito",
            spectator,
            game: toClientGame(game, { viewerId: user_id }),
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(200).json({
                message: "Ya estás unido a esta partida",
                alreadyJoined: true,
            });
        }
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const leaveGame = async (req, res) => {
    const { game_id } = req.params;
    const user_id = req.userId || req.body.user_id;

    try {
        if (!game_id || !user_id) {
            return res.status(400).json({ message: "game_id y user_id son obligatorios" });
        }

        const result = await removePlayerFromGame(game_id, user_id, { reason: "left" });
        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }
        res.status(200).json({ message: "Has salido de la partida exitosamente", game: result.game });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const getPlayersByGameId = async (req, res) => {
    const { id } = req.params;

    try {
        const game = await games.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Partida no encontrada" });
        }

        const rows = await UserGames.findAll({
            where: { game_id: id },
            include: {
                model: User,
                attributes: ["id", "nickname"],
            },
        });

        const presence = presenceMap(id);
        const players = rows.map((row) => {
            const data = row.toJSON();
            return {
                ...data,
                presence: presence[String(data.user_id)] || "disconnected",
            };
        });

        res.status(200).json({ players });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};
