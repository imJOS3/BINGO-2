import games from "../model/games.js";
import UserGames from "../model/UserGames.js";

// Función para crear un nuevo juego
export const createGame = async (req, res) => {
    const { game_name, game_status } = req.body;

    try {
        const newGame = await games.create({
            game_name,
            game_status,
            user_count: 0 // Establece el user_count en 0 por defecto
        });
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para obtener todos los juegos
export const getAllGames = async (req, res) => {
    try {
        const allGames = await games.findAll();
        res.status(200).json(allGames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para obtener un juego por ID
export const getGameById = async (req, res) => {
    const { id } = req.params;

    try {
        const game = await games.findByPk(id);
        if (game) {
            res.status(200).json(game);
        } else {
            res.status(404).json({ message: 'Game not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función para unirse a un juego y registrar al jugador
export const joinGame = async (req, res) => {
    const { game_id } = req.params; 
    const { user_id } = req.body;
    

    try {
        // Comprueba que game_id y user_id no son null
        if (!game_id || !user_id) {
            return res.status(400).json({ message: 'game_id y user_id son obligatorios' });
        }

        // Crea una nueva entrada en UserGames
        await UserGames.create({ user_id, game_id });
        res.status(200).json({ message: 'Unido a la partida con éxito' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
