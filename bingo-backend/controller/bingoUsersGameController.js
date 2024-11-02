import UserGames from "../model/UserGames.js";
import User from "../model/Users.js";


// Función para unirse a un juego y registrar al jugador
export const joinGame = async (req, res) => {
    const { game_id } = req.params; 
    const { user_id } = req.body;

    try {
        if (!game_id || !user_id) {
            return res.status(400).json({ message: 'game_id y user_id son obligatorios' });
        }

        await UserGames.create({ user_id, game_id });
        res.status(200).json({ message: 'Unido a la partida con éxito' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para salir de un juego y eliminar al jugador
export const leaveGame = async (req, res) => {
    const { game_id } = req.params;
    const { user_id } = req.body;

    try {
        if (!game_id || !user_id) {
            return res.status(400).json({ message: 'game_id y user_id son obligatorios' });
        }

        // Elimina el registro de UserGames donde game_id y user_id coinciden
        const deleted = await UserGames.destroy({
            where: { game_id, user_id }
        });

        if (deleted) {
            res.status(200).json({ message: 'Has salido de la partida exitosamente' });
        } else {
            res.status(404).json({ message: 'El jugador no está en la partida o ya salió' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Muestra los jugadores dentro de una partida 
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
