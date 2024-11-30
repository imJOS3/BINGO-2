import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router"; // Importar route para manejar la navegación
import useGameStore from "../../../../store/gameStore";
import useAuthStore from "../../../../store/authStore"; 
import useUsersGame from "../../../../store/usersGame"; 

export default function CreateGameModal({ onClose }) {
    const [gameName, setGameName] = useState("");
    const [gameMode, setGameMode] = useState("Full Card");
    const [gameTime, setGameTime] = useState(3);
    const [creatorId, setCreatorId] = useState(null);

    const { createGame, fetchGames } = useGameStore();
    const { userInfo } = useAuthStore();
    const { joinGame } = useUsersGame();

    useEffect(() => {
        if (userInfo) {
            setCreatorId(userInfo.id);
        }
    }, [userInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!creatorId) {
            console.error("No creator ID found");
            return;
        }
    
        const gameModeMapping = {
            "Full Card": 1,
            "Right Diagonal": 2,
            "Left Diagonal": 3,
            "Column B": 4,
            "Column I": 5,
            "Column N": 6,
            "Column G": 7,
            "Column O": 8,
            "Custom": 9,
        };
    
        const newGame = {
            game_name: gameName,
            game_mode_id: gameModeMapping[gameMode],
            game_time: gameTime,
            game_status: "active",
            creator_id: creatorId,
        };
    
        try {
            // Crear el juego y obtener el juego creado
            const createdGame = await createGame(newGame);
            setSelectedGame(createdGame)
            if (createdGame && createdGame.id) {
                console.log("Created game:", createdGame);
    
                // Unir al creador al juego
                await joinGame(createdGame.id, creatorId);
    
                // Actualizar la lista de juegos
                await fetchGames();

                // Navegar a la ruta del juego creado
                route(`/game/${createdGame.id}`);
            } else {
                console.error("Game creation failed, no game returned.");
            }
        } catch (error) {
            console.error("Error creating game:", error);
        }
    };

    const gameModes = [
        "Full Card",
        "Right Diagonal",
        "Left Diagonal",
        "Column B",
        "Column I",
        "Column N",
        "Column G",
        "Column O",
        "Custom",
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Create New Game</h2>
                <form onSubmit={handleSubmit}>
                    {/* Nombre del juego */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="gameName">
                            Game Name
                        </label>
                        <input
                            id="gameName"
                            type="text"
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    {/* Modo de juego */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="gameMode">
                            Game Mode
                        </label>
                        <select
                            id="gameMode"
                            value={gameMode}
                            onChange={(e) => setGameMode(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            {gameModes.map((mode) => (
                                <option key={mode} value={mode}>
                                    {mode}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tiempo de la partida */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="gameTime">
                            Game Time (minutes)
                        </label>
                        <select
                            id="gameTime"
                            value={gameTime}
                            onChange={(e) => setGameTime(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded"
                        >
                            {[3, 4, 5, 6, "Custom"].map((time) => (
                                <option key={time} value={time}>
                                    {time === "Custom" ? "Custom" : `${time} minutes`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
