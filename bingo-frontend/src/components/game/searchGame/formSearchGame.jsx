import { useEffect, useState } from "preact/hooks";
import useGameStore from "../../../../store/gameStore";
import OneGame from "./oneGame";

export default function FormSearchGame() {
    const { fetchGameById, selectedGame, loading, error } = useGameStore();
    const [gameId, setGameId] = useState("");
    const [showGame, setShowGame] = useState(false); // Estado para controlar la ventana emergente

    // Función para manejar la búsqueda del juego
    const handleSearch = async (e) => {
        e.preventDefault();
        await fetchGameById(gameId); // Espera a que termine la búsqueda
        setShowGame(true); // Muestra el juego en la ventana emergente
    };

    return (
        <div className="flex flex-col items-center">
            <form onSubmit={handleSearch} className="flex gap-[1px]">
                <input
                    type="text"
                    value={gameId}
                    onInput={(e) => setGameId(e.target.value)}
                    placeholder="Ingresa el ID del juego a buscar"
                    className="border border-gray-400 rounded-s-lg p-3 h-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white h-12 px-6 rounded-e-lg hover:bg-blue-600 shadow-md transition duration-300 ease-in-out"
                >
                    Buscar
                </button>
            </form>

            {loading && <p>Cargando juego...</p>}
            {error && <p>Error al cargar el juego: {error}</p>}

            {showGame && selectedGame && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <OneGame onClose={() => setShowGame(false)} />
                </div>
            )}
        </div>
    );
}
