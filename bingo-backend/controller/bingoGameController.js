import games from "../model/games.js";

// Función para crear un nuevo juego
export const createGame = async (req, res) => {
    const { game_name } = req.body;

    try {
        const newGame = await games.create({
            game_name,
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
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




