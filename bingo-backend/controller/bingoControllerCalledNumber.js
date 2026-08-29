import games from "../model/games.js";
import CalledNumbers from "../model/calledNumber.js";
import { callNextNumber } from "../services/ballCaller.js";

export const BingoControllerCalledNumber = async (req, res) => {
    try {
        const gameId = req.params.game_id;
        const result = await callNextNumber(gameId);

        if (result.notFound) {
            return res.status(404).json({ message: "Game not found" });
        }
        if (result.finished) {
            return res.status(409).json({
                message: "Game already finished",
                winner: result.winner,
                game: result.game,
            });
        }
        if (result.invalidStatus) {
            return res.status(400).json({
                message: "No se puede cantar ahora",
            });
        }
        if (result.allCalled) {
            return res.status(400).json({ message: "All numbers have been called" });
        }

        res.status(200).json(result.row);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ message: "Number already called for this game" });
        }
        console.error("Error al llamar o guardar el siguiente número:", error);
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};

export const getCalledNumbersByGame = async (req, res) => {
    try {
        const gameId = req.params.game_id;

        const game = await games.findByPk(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        const numbers = await CalledNumbers.findAll({
            where: { game_id: gameId },
            order: [["called_at", "ASC"], ["id", "ASC"]],
        });

        res.status(200).json(numbers);
    } catch (error) {
        console.error("Error al obtener números llamados:", error);
        res.status(500).json({ message: "Algo salió mal. Inténtalo de nuevo." });
    }
};
