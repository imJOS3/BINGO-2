import { CardGenerator } from "../services/bingoCard/CardGenerator.js";
import { BingoCardService } from '../services/bingoCard/BingoCardService.js';

export class BingoControllerCard {
    constructor() {
        this.cardGenerator = new CardGenerator();
        this.bingoCardService = new BingoCardService();
    }

    // Generar y guardar una nueva carta
    async generateAndSaveCard(req, res) {
        try {
            const { user_id, game_id } = req.body;
            if (!user_id || !game_id) {
                return res.status(400).json({ message: 'User ID and Game ID are required' });
            }

            const card = this.cardGenerator.generate();
            const newCard = await this.bingoCardService.saveCard(user_id, game_id, card);
            res.status(201).json(newCard);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Obtener cartas por user_id y game_id
    async getCardsByUserAndGame(req, res) {
        const { user_id, game_id } = req.params;  // Obtener los parámetros de la URL

        try {
            const cards = await this.bingoCardService.getCardsByUserAndGame(user_id, game_id);
            if (cards.length === 0) {
                return res.status(404).json({ message: 'No cards found for this user and game' });
            }
            res.status(200).json(cards);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Obtener carta por ID
    async getCardById(req, res) {
        const { id } = req.params;  // Obtener el ID de la carta desde los parámetros

        try {
            const card = await this.bingoCardService.getCardById(id);
            res.status(200).json(card);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
