import games from "../model/games.js";
import User from "../model/Users.js";
import UserGames from "../model/UserGames.js";
import CalledNumbers from "../model/calledNumber.js";
import BingoCards from "../model/bingoCards.js";
import db from "../database/db.js";
import { getIO } from "../socket.js";
import { restartBallCaller, startBallCaller, stopBallCaller } from "../services/ballCaller.js";
import { cancelTimeUp, isLastCall, scheduleTimeUp } from "../services/roundTimer.js";
import { hasBingo, patternCells } from "../utils/bingoCard/winPattern.js";
import { closeAbandonedGames, promoteSpectators } from "../services/playerRoster.js";
import { onlineCount } from "../services/presence.js";
import { Op } from "sequelize";
import {
    generateRoomCode,
    isRoomCodeShape,
    normalizeRoomCode,
} from "../utils/roomCode.js";
import { asPublic, resolveJoinKey, toClientGame } from "../utils/gamePublic.js";

const sameId = (a, b) => Number(a) === Number(b);

const uniqueRoomCode = async (transaction) => {
    for (let i = 0; i < 24; i++) {
        const code = generateRoomCode();
        const exists = await games.findOne({
            where: { room_code: code },
            transaction,
        });
        if (!exists) return code;
    }
    throw new Error("No se pudo generar un código de mesa único");
};

const findGameByRef = async (ref) => {
    const value = String(ref || "").trim();
    if (!value) return null;

    if (/^\d+$/.test(value)) {
        const byId = await games.findByPk(Number(value));
        if (byId) return byId;
    }

    const code = normalizeRoomCode(value);
    if (isRoomCodeShape(code)) {
        const byCode = await games.findOne({ where: { room_code: code } });
        if (byCode) return byCode;
    }

    return games.findOne({
        where: db.where(db.fn("LOWER", db.col("game_name")), value.toLowerCase()),
    });
};

const HttpError = (message, status) => {
    const error = new Error(message);
    error.statusCode = status;
    return error;
};

const normalizeCustomPattern = (win_pattern) => {
    if (!Array.isArray(win_pattern) || win_pattern.length !== 5) {
        throw HttpError("El modo personalizado necesita un patrón 5x5", 400);
    }
    const pattern = win_pattern.map((row) =>
        Array.isArray(row) ? row.slice(0, 5).map(Boolean) : [false, false, false, false, false]
    );
    if (pattern.flat().length !== 25 || !pattern.flat().some(Boolean)) {
        throw HttpError("El patrón debe incluir al menos una casilla", 400);
    }
    return pattern;
};

const resolveModeAndPattern = (game_mode_id, win_pattern, fallbackMode, fallbackPattern) => {
    const modeId = game_mode_id !== undefined && game_mode_id !== null
        ? Number(game_mode_id)
        : Number(fallbackMode) || 1;

    if (!Number.isInteger(modeId) || modeId < 1 || modeId > 9) {
        throw HttpError("Modo de juego no válido", 400);
    }

    if (modeId === 9) {
        return {
            modeId,
            pattern: normalizeCustomPattern(win_pattern || fallbackPattern),
        };
    }

    return { modeId, pattern: null };
};

export const createGame = async (req, res) => {
    const { game_name, game_time, game_status, game_mode_id, is_public, join_key, win_pattern } = req.body;
    const creator_id = req.userId || req.body.creator_id;

    try {
        if (!game_name) {
            return res.status(400).json({ message: "Game name is required" });
        }

        if (!creator_id) {
            return res.status(400).json({ message: "Creator ID is required" });
        }

        const creator = await User.findByPk(creator_id);
        if (!creator) {
            return res.status(404).json({ message: "Creator not found" });
        }

        let resolved;
        try {
            resolved = resolveModeAndPattern(game_mode_id || 1, win_pattern, 1, null);
        } catch (patternError) {
            return res.status(patternError.statusCode || 400).json({ message: patternError.message });
        }

        const isPublicGame = asPublic(is_public);
        let joinKey = null;
        if (!isPublicGame) {
            try {
                joinKey = resolveJoinKey(join_key);
            } catch (keyError) {
                return res.status(keyError.statusCode || 400).json({ message: keyError.message });
            }
        }

        const result = await db.transaction(async (t) => {
            const newGame = await games.create({
                game_name,
                room_code: await uniqueRoomCode(t),
                game_time: game_time || 3,
                game_status: game_status || "active",
                game_mode_id: resolved.modeId,
                is_public: isPublicGame,
                join_key: joinKey,
                win_pattern: resolved.pattern,
                creator_id,
                user_count: 1,
            }, { transaction: t });

            await UserGames.create({
                user_id: creator_id,
                game_id: newGame.id,
            }, { transaction: t });

            return newGame;
        });

        const io = getIO();
        if (io) {
            io.emit("gameCreated", {
                gameId: result.id,
                game: toClientGame(result),
            });
        }

        res.status(201).json(toClientGame(result, { includeKey: true }));
    } catch (error) {
        console.error("Error creating game:", error.message);
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

// Margen para que una mesa recién creada aparezca en el listado antes de que
// su anfitrión abra el socket y registre presencia.
const FRESH_GAME_MS = 45000;

const withOnlinePlayers = (rows) =>
    rows
        .map((game) => {
            const json = toClientGame(game);
            json.online_count = onlineCount(game.id);
            return json;
        })
        .filter((game) => {
            if (game.online_count > 0) return true;
            const createdAt = new Date(game.created_at || 0).getTime();
            return Date.now() - createdAt < FRESH_GAME_MS;
        });

// closeAbandonedGames recorre toda la tabla: no conviene en cada listado.
const SWEEP_EVERY_MS = 30000;
let lastSweep = 0;

const sweepIfStale = async () => {
    if (Date.now() - lastSweep < SWEEP_EVERY_MS) return;
    lastSweep = Date.now();
    try {
        await closeAbandonedGames();
    } catch (error) {
        console.warn("Aviso limpieza de mesas:", error.message);
    }
};

export const getAllGames = async (req, res) => {
    try {
        await sweepIfStale();
        const allGames = await games.findAll({
            where: {
                game_status: { [Op.in]: ["active", "in_progress", "completed"] },
                user_count: { [Op.gt]: 0 },
            },
            order: [["created_at", "DESC"]],
        });
        res.status(200).json(withOnlinePlayers(allGames));
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const getGameById = async (req, res) => {
    const { id } = req.params;

    try {
        const game = await findGameByRef(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }
        res.status(200).json(
            toClientGame(game, { viewerId: req.userId || req.query.user_id })
        );
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const searchGames = async (req, res) => {
    const q = String(req.query.q || "").trim();

    try {
        if (!q) {
            return res.status(400).json({ message: "Escribe un nombre o código" });
        }

        const filters = [];
        const code = normalizeRoomCode(q);
        if (isRoomCodeShape(code)) {
            filters.push({ room_code: code });
        }

        const nameQuery = q.replace(/[%_]/g, "").slice(0, 80);
        if (nameQuery) {
            filters.push({
                game_name: { [Op.like]: `%${nameQuery}%` },
            });
        }

        if (!filters.length) {
            return res.status(200).json([]);
        }

        const found = await games.findAll({
            where: {
                [Op.and]: [
                    { [Op.or]: filters },
                    { game_status: { [Op.in]: ["active", "in_progress", "completed"] } },
                    { user_count: { [Op.gt]: 0 } },
                ],
            },
            order: [["created_at", "DESC"]],
            limit: 20,
        });

        res.status(200).json(withOnlinePlayers(found));
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const updateGame = async (req, res) => {
    const { id } = req.params;
    const { game_name, game_time, game_mode_id, is_public, join_key, win_pattern } = req.body;
    const creator_id = req.userId || req.body.creator_id;

    try {
        const game = await games.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        if (!sameId(game.creator_id, creator_id)) {
            return res.status(403).json({ message: "Solo el host puede configurar la mesa" });
        }

        if (game.game_status !== "active") {
            return res.status(400).json({
                message: "Solo se puede configurar la mesa antes de empezar la partida",
            });
        }

        if (game_name !== undefined) {
            const name = String(game_name).trim();
            if (!name) {
                return res.status(400).json({ message: "El nombre de la partida es obligatorio" });
            }
            game.game_name = name.slice(0, 80);
        }

        if (game_time !== undefined) {
            const time = Number(game_time);
            if (![3, 4, 5, 6].includes(time)) {
                return res.status(400).json({ message: "Tiempo no válido" });
            }
            game.game_time = time;
        }

        if (is_public !== undefined) {
            game.is_public = asPublic(is_public);
        }

        if (game.is_public) {
            game.join_key = null;
        } else if (join_key !== undefined || !game.join_key) {
            try {
                game.join_key = resolveJoinKey(join_key);
            } catch (keyError) {
                return res.status(keyError.statusCode || 400).json({
                    message: keyError.message,
                });
            }
        }

        if (game_mode_id !== undefined || win_pattern !== undefined) {
            try {
                const resolved = resolveModeAndPattern(
                    game_mode_id,
                    win_pattern,
                    game.game_mode_id,
                    game.win_pattern
                );
                game.game_mode_id = resolved.modeId;
                game.win_pattern = resolved.pattern;
            } catch (patternError) {
                return res.status(patternError.statusCode || 400).json({
                    message: patternError.message,
                });
            }
        }

        await game.save();

        const io = getIO();
        if (io) {
            io.emit("gameUpdated", { gameId: game.id, game: toClientGame(game) });
        }

        res.status(200).json(toClientGame(game, { includeKey: true }));
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const startGame = async (req, res) => {
    const { id } = req.params;
    const creator_id = req.userId || req.body.creator_id;

    try {
        const game = await games.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        if (!sameId(game.creator_id, creator_id)) {
            return res.status(403).json({ message: "Only the creator can start the game" });
        }

        if (game.game_status === "completed") {
            return res.status(400).json({ message: "Cannot start a completed game" });
        }

        if (game.game_status === "in_progress") {
            startBallCaller(game.id);
            scheduleTimeUp(game);
            return res.status(200).json({ message: "Game already in progress", game });
        }

        const promoted = await promoteSpectators(game.id);
        await UserGames.update(
            { eliminated_at: null },
            { where: { game_id: game.id } }
        );

        game.game_status = "in_progress";
        if (!game.started_at) {
            game.started_at = new Date();
        }
        await game.save();
        scheduleTimeUp(game);

        const gamePayload = toClientGame(game);
        const io = getIO();
        if (io) {
            io.emit("gameStarted", {
                gameId: game.id,
                game: gamePayload,
                promoted,
            });
        }

        startBallCaller(game.id);

        res.status(200).json({
            message: "Game started successfully",
            game: toClientGame(game, { includeKey: true }),
        });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const finalizeGame = async (req, res) => {
    const { id } = req.params;
    const creator_id = req.userId || req.body.creator_id;

    try {
        const game = await games.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        if (!sameId(game.creator_id, creator_id)) {
            return res.status(403).json({ message: "Only the creator can finalize the game" });
        }

        game.game_status = "completed";
        if (!game.ended_at) {
            game.ended_at = new Date();
        }
        await game.save();
        stopBallCaller(game.id);
        cancelTimeUp(game.id);

        res.status(200).json({ message: "Game has been finalized", game });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const activateGame = async (req, res) => {
    const { id } = req.params;
    const creator_id = req.userId || req.body.creator_id;

    try {
        const game = await games.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        if (!sameId(game.creator_id, creator_id)) {
            return res.status(403).json({ message: "Only the creator can activate the game" });
        }

        await db.transaction(async (t) => {
            await CalledNumbers.destroy({ where: { game_id: id }, transaction: t });
            await UserGames.update(
                { eliminated_at: null },
                { where: { game_id: id }, transaction: t }
            );

            game.game_status = "active";
            game.winner_id = null;
            game.winner_nickname = null;
            game.started_at = null;
            game.ended_at = null;
            await game.save({ transaction: t });
        });

        stopBallCaller(id);
        cancelTimeUp(id);
        await promoteSpectators(game.id);

        res.status(200).json({ message: "Game has been reactivated", game });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const restartGame = async (req, res) => {
    const { id } = req.params;
    const creator_id = req.userId || req.body.creator_id;
    const {
        game_mode_id,
        win_pattern,
        keep_called_numbers = false,
    } = req.body;

    try {
        const game = await games.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        if (!sameId(game.creator_id, creator_id)) {
            return res.status(403).json({ message: "Only the creator can restart the game" });
        }

        if (game.game_status !== "completed") {
            return res.status(400).json({ message: "Solo se puede pasar de ronda si la partida ya terminó" });
        }

        let resolved;
        try {
            resolved = resolveModeAndPattern(
                game_mode_id,
                win_pattern,
                game.game_mode_id,
                game.win_pattern
            );
        } catch (patternError) {
            return res.status(patternError.statusCode || 400).json({ message: patternError.message });
        }

        const keepBalls = keep_called_numbers === true || keep_called_numbers === "true";

        if (keepBalls) {
            const sameMode = Number(resolved.modeId) === Number(game.game_mode_id);
            const samePattern = JSON.stringify(resolved.pattern || null) === JSON.stringify(game.win_pattern || null);
            if (sameMode && (resolved.modeId !== 9 || samePattern)) {
                return res.status(400).json({
                    message: "Para continuar con las mismas bolas elige otra figura. Si quieres repetir la misma, reinicia de cero.",
                });
            }
        }

        await db.transaction(async (t) => {
            if (!keepBalls) {
                await CalledNumbers.destroy({ where: { game_id: id }, transaction: t });
                await BingoCards.update(
                    { marked_numbers: {} },
                    { where: { game_id: id }, transaction: t }
                );
            }

            await UserGames.update(
                { eliminated_at: null },
                { where: { game_id: id }, transaction: t }
            );

            game.game_mode_id = resolved.modeId;
            game.win_pattern = resolved.pattern;
            game.winner_id = null;
            game.winner_nickname = null;
            game.ended_at = null;
            game.game_status = "in_progress";
            // Ronda nueva, reloj nuevo: si no, el tiempo agotado la cerraría al instante.
            game.started_at = new Date();
            await game.save({ transaction: t });
        });

        await game.reload();

        // Ronda nueva: los que esperaban en cola ya juegan.
        const promoted = await promoteSpectators(game.id);

        const payload = {
            gameId: game.id,
            game: toClientGame(game),
            resetNumbers: !keepBalls,
            promoted,
        };

        const io = getIO();
        if (io) {
            io.emit("gameRestarted", payload);
        }

        if (!keepBalls) restartBallCaller(game.id);
        else startBallCaller(game.id);
        scheduleTimeUp(game);

        res.status(200).json({
            message: keepBalls ? "Siguiente figura" : "Nueva ronda",
            ...payload,
        });
    } catch (error) {
        console.error("Error restarting game:", error);
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const claimWin = async (req, res) => {
    const { id } = req.params;
    const user_id = req.userId || req.body.user_id;
    const { nickname } = req.body;

    try {
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const result = await db.transaction(async (t) => {
            const game = await games.findByPk(id, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (!game) {
                return { notFound: true };
            }

            if (game.game_status === "completed") {
                return {
                    alreadyFinished: true,
                    game,
                    winner: {
                        id: game.winner_id,
                        nickname: game.winner_nickname,
                    },
                };
            }

            if (game.game_status !== "in_progress") {
                return { invalidStatus: true, status: game.game_status };
            }

            const membership = await UserGames.findOne({
                where: { game_id: id, user_id },
                transaction: t,
            });
            if (!membership) {
                return { notMember: true };
            }
            if (membership.is_spectator) {
                return { spectatorWaiting: true };
            }
            if (membership.eliminated_at) {
                return { eliminated: true, alreadyOut: true };
            }

            const card = await BingoCards.findOne({
                where: { game_id: id, user_id },
                transaction: t,
            });
            const called = await CalledNumbers.findAll({
                where: { game_id: id },
                attributes: ["number_called"],
                transaction: t,
            });
            const calledSet = new Set(called.map((row) => Number(row.number_called)));
            const cells = patternCells(game.game_mode_id, game.win_pattern);

            if (!hasBingo(card?.numbers, calledSet, cells)) {
                const lastCall = isLastCall(game);
                if (lastCall) {
                    membership.eliminated_at = new Date();
                    await membership.save({ transaction: t });
                }
                return { falseBingo: true, eliminated: lastCall, game };
            }

            let winnerNickname = nickname;
            if (!winnerNickname) {
                const user = await User.findByPk(user_id, { transaction: t });
                winnerNickname = user?.nickname || `Jugador ${user_id}`;
            }

            game.game_status = "completed";
            game.winner_id = user_id;
            game.winner_nickname = winnerNickname;
            game.ended_at = new Date();
            await game.save({ transaction: t });

            return {
                alreadyFinished: false,
                game,
                winner: { id: user_id, nickname: winnerNickname },
            };
        });

        if (result.notFound) {
            return res.status(404).json({ message: "Game not found" });
        }
        if (result.notMember) {
            return res.status(403).json({ message: "User is not in this game" });
        }
        if (result.spectatorWaiting) {
            return res.status(403).json({
                message: "Estás en cola: podrás cantar bingo en la próxima ronda",
            });
        }
        if (result.alreadyOut) {
            return res.status(403).json({
                eliminated: true,
                message: "Cantaste un bingo falso: estás fuera de esta ronda",
            });
        }
        if (result.falseBingo) {
            if (result.eliminated) {
                const user = await User.findByPk(user_id);
                const io = getIO();
                if (io) {
                    io.emit("playerEliminated", {
                        gameId: Number(result.game.id),
                        userId: Number(user_id),
                        nickname: nickname || user?.nickname || "Un jugador",
                    });
                }
            }

            return res.status(400).json({
                eliminated: result.eliminated,
                message: result.eliminated
                    ? "Bingo falso en el último minuto: quedas fuera del sorteo"
                    : "Todavía no tienes la figura. En el último minuto, fallar te elimina",
            });
        }
        if (result.invalidStatus) {
            return res.status(400).json({ message: "La partida no está en juego" });
        }

        const payload = {
            gameId: result.game.id,
            winner: result.winner,
            game: result.game,
        };

        if (!result.alreadyFinished) {
            stopBallCaller(result.game.id);
            cancelTimeUp(result.game.id);
            const promoted = await promoteSpectators(result.game.id);
            payload.promoted = promoted;
            const io = getIO();
            if (io) {
                io.emit("gameWon", payload);
            }
        }

        res.status(200).json({
            message: result.alreadyFinished ? "Game already finished" : "Winner declared",
            ...payload,
            alreadyFinished: result.alreadyFinished,
        });
    } catch (error) {
        console.error("Error claiming win:", error);
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};
