import BingoCards from '../model/bingoCards.js';
import { generateBingoCard } from '../utils/bingoCard/CardGenerator.js';

/// Función para crear y guardar una nueva carta de bingo
export const createBingoCard = async (req, res) => {
    const { user_id, game_id } = req.body;

    try {
        if (!user_id || !game_id) {
            return res.status(400).json({ message: 'User ID and Game ID is required' });
        }

        const numbers = generateBingoCard();  // Genera automáticamente la carta
        const newCard = await BingoCards.create({ user_id, game_id , numbers });
        res.status(201).json(newCard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para obtener cartas de bingo por user_id y game_id
export const getBingoCardsByUserAndGame = async (req, res) => {
    const { user_id, game_id } = req.params;

    try {
        const cards = await BingoCards.findAll({ where: { user_id, game_id } });
        if (cards.length === 0) {
            return res.status(404).json({ message: 'No cards found for this user and game' });
        }
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para obtener una carta de bingo por ID
export const getBingoCardById = async (req, res) => {
    const { id } = req.params;

    try {
        const card = await BingoCards.findByPk(id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
