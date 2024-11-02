import { useEffect } from "preact/hooks";
import useGameStore from "../../../../store/gameStore";
import FormSearchGame from "../searchGame/formSearchGame";
import OneGame from "../searchGame/oneGame";

export default function TableGames() {
    const { games, fetchGames, setSelectedGame, loading, error } = useGameStore();

    useEffect(() => {
        fetchGames();
    }, []);

    return (
        <div className="w-[85vw] p-4 relative">
            <div className="flex mb-6 items-center p-5">
                <h1 className="text-3xl font-bold grow">Juegos</h1>
                <FormSearchGame />
            </div>
            
            {loading && <p>Cargando juegos...</p>}
            {error && <p>Error al cargar los juegos: {error}</p>}

            <div className="grid grid-cols-2 gap-9">
                {games.map((game) => (
                    <div key={game.id} className="flex flex-col bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
                        <h2 className="text-xl font-semibold">{game.game_name}</h2>
                        <p className="text-gray-700">Estado: {game.game_status}</p>
                        <p className="text-gray-500">Creado el: {new Date(game.created_at).toLocaleDateString()}</p>
                        <button
                            className="mt-4 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
                            onClick={() => setSelectedGame(game)} // Llama a setSelectedGame con el juego seleccionado
                        >
                            Ver Partida
                        </button>
                    </div>
                ))}
            </div>
            <OneGame />
        </div>
    );
}
