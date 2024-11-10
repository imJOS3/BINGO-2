import { NumberGenerator } from '../utils/BingoCalledNumber/numberGenerator.js';
import CalledNumbers from "../model/calledNumber.js"; 

const numberGenerator = NumberGenerator();

export const BingoControllerCalledNumber = async (req, res) => {
    try {
        const gameId = req.params.game_id;

        // Verifica si todos los números han sido llamados
        if (numberGenerator.isGameOver()) {
            // Si el juego está terminado (todos los números llamados), reinicia los números
            numberGenerator.resetNumbers();
            // Elimina todos los registros de números llamados para este juego
            await CalledNumbers.destroy({ where: { game_id: gameId } });
        }

        // Genera el siguiente número
        const nextNumber = numberGenerator.getNextNumber();

        // Guardar el número llamado en la base de datos
        const newCalledNumber = await CalledNumbers.create({
            game_id: gameId,
            number_called: nextNumber
        });

        // Responder con el número guardado
        res.status(200).json(newCalledNumber);
    } catch (error) {
        console.error('Error al llamar o guardar el siguiente número:', error);
        res.status(500).json({ message: 'No se pudo llamar el siguiente número' });
    }
};
