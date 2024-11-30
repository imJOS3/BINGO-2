import games from "../model/games.js";

export const createGame = async (req, res) => {
    const { game_name, game_time, game_status, game_mode_id, creator_id } = req.body;

    try {
        // Validar que el nombre del juego esté presente
        if (!game_name) {
            return res.status(400).json({ message: "Game name is required" });
        }

        // Validar que el creator_id esté presente
        if (!creator_id) {
            return res.status(400).json({ message: "Creator ID is required" });
        }

        // Crear un nuevo juego
        const newGame = await games.create({
            game_name,
            game_time: game_time || 3,  // Tiempo de juego, con valor predeterminado de 3
            game_status: game_status || "active",  // Estado del juego, por defecto "active"
            game_mode_id,  // El modo de juego, si está presente
            creator_id,    // El ID del creador del juego
            user_count: 0  // Establece el user_count en 0 por defecto
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

// Función para actualizar un atributo del juego
export const updateGame = async (req, res) => {
    const { id } = req.params;
    const { game_name, game_status, game_time, game_mode_id } = req.body;

    try {
        const game = await games.findByPk(id);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        // Actualizar solo los campos que han sido enviados
        game.game_name = game_name || game.game_name;
        game.game_status = game_status || game.game_status;
        game.game_time = game_time || game.game_time; // Si no se envía un nuevo tiempo, se deja el existente
        game.game_mode_id = game_mode_id || game.game_mode_id;

        await game.save(); // Guardar los cambios en la base de datos
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
