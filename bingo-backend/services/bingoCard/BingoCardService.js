import BingoCards from "../../model/bingoCards.js";

export class BingoCardService {
    // Guardar carta de bingo
    async saveCard(userId, gameId, cardData) {
        try {
            const newCard = await BingoCards.create({
                user_id: userId,
                game_id: gameId,  // Agregar el game_id en la tabla de cartas
                card_data: cardData,  // Convertir los números en JSON
            });
            return newCard;  // Retornar la nueva carta guardada
        } catch (error) {
            throw new Error('Error saving Bingo card: ' + error.message);
        }
    }

    // Obtener cartas por user_id y game_id
    async getCardsByUserAndGame(userId, gameId) {
        try {
            const cards = await BingoCards.findAll({
                where: { 
                    user_id: userId,
                    game_id: gameId,  // Filtrar también por game_id
                }
            });
            return cards;
        } catch (error) {
            throw new Error('Error retrieving Bingo cards: ' + error.message);
        }
    }

    // Obtener una carta por su ID
    async getCardById(cardId) {
        try {
            const card = await BingoCards.findByPk(cardId);
            if (!card) {
                throw new Error('Card not found');
            }
            return card;
        } catch (error) {
            throw new Error('Error retrieving the Bingo card: ' + error.message);
        }
    }
}
