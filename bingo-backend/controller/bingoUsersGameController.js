import UserGames from "../model/UserGames.js";
import User from "../model/Users.js";

export const getPlayersByGameId = async (req, res) => {
    const { id } = req.params; // ID del juego

    try {
        const players = await UserGames.findAll({
            where: { game_id: id },
            include: {
                model: User,
               
                attributes: ['nickname'] // Cambia estos atributos según lo que necesites
            }
        });

        if (players.length > 0) {
            res.status(200).json({ players });
        } else {
            res.status(404).json({ message: 'No hay jugadores en esta partida' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
