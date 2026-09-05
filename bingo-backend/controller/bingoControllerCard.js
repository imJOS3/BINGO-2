import BingoCards from '../model/bingoCards.js';
import UserGames from '../model/UserGames.js';
import User from '../model/Users.js';
import games from '../model/games.js';
import db from '../database/db.js';
import { generateBingoCard } from '../utils/bingoCard/CardGenerator.js';

export const createBingoCard = async (req, res) => {
    const game_id = req.body.game_id;
    const user_id = req.userId || req.body.user_id;

    try {
        if (!user_id || !game_id) {
            return res.status(400).json({ message: 'User ID and Game ID are required' });
        }

        const game = await games.findByPk(game_id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Entre rondas (`completed`) la mesa sigue abierta: quien entra recibe cartón.

        const membership = await UserGames.findOne({ where: { user_id, game_id } });
        if (!membership) {
            return res.status(403).json({ message: 'You must join the game before creating a card' });
        }

        if (membership.is_spectator) {
            return res.status(403).json({
                message: 'Estás en cola: recibes cartón al terminar esta ronda',
            });
        }

        const existing = await BingoCards.findOne({ where: { user_id, game_id } });
        if (existing) {
            // Idempotente: no crea cartones duplicados
            if (!membership.bingo_card_id) {
                await membership.update({ bingo_card_id: existing.id });
            }
            return res.status(200).json(existing);
        }

        const numbers = generateBingoCard();
        const newCard = await db.transaction(async (t) => {
            const card = await BingoCards.create({
                user_id,
                game_id,
                numbers,
                marked_numbers: {},
            }, { transaction: t });

            await membership.update({ bingo_card_id: card.id }, { transaction: t });
            return card;
        });

        res.status(201).json(newCard);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Card already exists for this user and game' });
        }
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const getBingoCardsByUserAndGame = async (req, res) => {
    const { user_id, game_id } = req.params;

    try {
        const cards = await BingoCards.findAll({ where: { user_id, game_id } });
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

/**
 * Cartones de todos los que están jugando, con nombre y fichas marcadas.
 * Solo lo puede pedir quien está en cola: quien juega no debe ver los ajenos.
 */
export const getGameCards = async (req, res) => {
    const { game_id } = req.params;
    const viewer_id = req.userId || req.query.user_id;

    try {
        const game = await games.findByPk(game_id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (!viewer_id) {
            return res.status(400).json({ message: 'Falta saber quién mira la mesa' });
        }

        const viewer = await UserGames.findOne({ where: { user_id: viewer_id, game_id } });
        if (!viewer) {
            return res.status(403).json({ message: 'No estás en esta mesa' });
        }
        if (!viewer.is_spectator) {
            return res.status(403).json({
                message: 'Los cartones de los demás solo se ven desde la cola',
            });
        }

        const seats = await UserGames.findAll({
            where: { game_id, is_spectator: false },
            include: { model: User, attributes: ['id', 'nickname'] },
        });

        const cards = await BingoCards.findAll({ where: { game_id } });
        const cardByUser = new Map(cards.map((card) => [String(card.user_id), card]));

        const players = seats
            .map((seat) => {
                const card = cardByUser.get(String(seat.user_id));
                const marked = card?.marked_numbers;
                return {
                    userId: Number(seat.user_id),
                    nickname: seat.User?.nickname || 'Jugador',
                    isHost: Number(seat.user_id) === Number(game.creator_id),
                    numbers: card?.numbers || null,
                    marked: marked && typeof marked === 'object' ? marked : {},
                };
            })
            .sort((a, b) => a.nickname.localeCompare(b.nickname));

        res.status(200).json({ players });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const getBingoCardById = async (req, res) => {
    const { id } = req.params;

    try {
        const card = await BingoCards.findByPk(id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

const canRegenerateCard = async (card) => {
    const game = await games.findByPk(card.game_id);
    if (!game) return { ok: false, status: 404, message: 'Game not found' };
    if (game.game_status === 'in_progress') {
        return {
            ok: false,
            status: 400,
            message: 'Cannot regenerate card after the game has started or finished',
        };
    }
    return { ok: true, game };
};

export const updateBingoCardById = async (req, res) => {
    const { id } = req.params;

    try {
        const card = await BingoCards.findByPk(id);
        if (!card) {
            return res.status(404).json({ message: 'Bingo card not found' });
        }

        const check = await canRegenerateCard(card);
        if (!check.ok) {
            return res.status(check.status).json({ message: check.message });
        }

        card.numbers = generateBingoCard();
        card.marked_numbers = {};
        card.updated_at = new Date();
        await card.save();

        res.status(200).json({ message: 'Bingo card updated successfully', card });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const updateBingoCardByUserAndGame = async (req, res) => {
    const { user_id, game_id } = req.params;

    try {
        const card = await BingoCards.findOne({ where: { user_id, game_id } });
        if (!card) {
            return res.status(404).json({ message: 'Bingo card not found for this user and game' });
        }

        const check = await canRegenerateCard(card);
        if (!check.ok) {
            return res.status(check.status).json({ message: check.message });
        }

        card.numbers = generateBingoCard();
        card.marked_numbers = {};
        card.updated_at = new Date();
        await card.save();

        res.status(200).json({ message: 'Bingo card updated successfully', card });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const deleteBingoCardById = async (req, res) => {
    const { id } = req.params;

    try {
        const card = await BingoCards.findByPk(id);
        if (!card) {
            return res.status(404).json({ message: 'Bingo card not found' });
        }

        const game = await games.findByPk(card.game_id);
        if (game && game.game_status !== 'active') {
            return res.status(400).json({ message: 'Cannot delete card after the game has started' });
        }

        await db.transaction(async (t) => {
            await UserGames.update(
                { bingo_card_id: null },
                { where: { bingo_card_id: card.id }, transaction: t }
            );
            await card.destroy({ transaction: t });
        });

        res.status(200).json({ message: 'Bingo card deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const deleteBingoCardByUserAndGame = async (req, res) => {
    const { user_id, game_id } = req.params;

    try {
        const card = await BingoCards.findOne({ where: { user_id, game_id } });
        if (!card) {
            return res.status(404).json({ message: 'Bingo card not found for this user and game' });
        }

        const game = await games.findByPk(game_id);
        if (game && game.game_status !== 'active') {
            return res.status(400).json({ message: 'Cannot delete card after the game has started' });
        }

        await db.transaction(async (t) => {
            await UserGames.update(
                { bingo_card_id: null },
                { where: { user_id, game_id }, transaction: t }
            );
            await card.destroy({ transaction: t });
        });

        res.status(200).json({ message: 'Bingo card deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const updateMarkedNumbers = async (req, res) => {
    const { user_id, game_id } = req.params;
    const { marked_numbers } = req.body;

    try {
        const card = await BingoCards.findOne({ where: { user_id, game_id } });
        if (!card) {
            return res.status(404).json({ message: 'Bingo card not found for this user and game' });
        }

        const game = await games.findByPk(game_id);
        if (game?.game_status === 'completed') {
            return res.status(400).json({ message: 'Cannot update marks on a completed game' });
        }

        card.marked_numbers = marked_numbers || {};
        card.changed("marked_numbers", true);
        card.updated_at = new Date();
        await card.save();

        res.status(200).json({ message: 'Marked numbers updated', card });
    } catch (error) {
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};
