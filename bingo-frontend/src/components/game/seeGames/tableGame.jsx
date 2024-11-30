import { useState, useEffect } from "preact/hooks";
import useGameStore from "../../../../store/gameStore";
import OneGame from "../searchGame/oneGame";

export default function TableGames() {
  const { games, fetchGames, loading, error } = useGameStore();
  const [selectedGame, setSelectedGame] = useState(null); // Estado para almacenar el juego seleccionado

  useEffect(() => {
    fetchGames();
  }, []);

  const showOneGame = (game) => {
    setSelectedGame(game); // Establece el juego seleccionado
  };

  const closeOneGame = () => {
    setSelectedGame(null); // Limpia el juego seleccionado
  };

  return (
    <div className="w-[85vw] p-4 relative">
      {loading && <p>Cargando juegos...</p>}
      {error && <p>Error al cargar los juegos: {error}</p>}

      <div className="grid grid-cols-2 gap-9">
        {games.map((game) => (
          <div
            key={game.id}
            className="flex flex-col bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105"
          >
            <h2 className="text-xl font-semibold">{game.game_name}</h2>
            <p className="text-gray-700">Estado: {game.game_status}</p>
            <p className="text-gray-500">
              Creado el: {new Date(game.created_at).toLocaleDateString()}
            </p>
            <button
              className="mt-4 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
              onClick={() => showOneGame(game)} // Muestra el juego seleccionado
            >
              Ver Partida
            </button>
          </div>
        ))}
      </div>

      {/* Mostrar OneGame si hay un juego seleccionado */}
      {selectedGame && (
        <OneGame
          game={selectedGame} // Pasar el juego seleccionado como prop
          onClose={closeOneGame} // Pasar función para cerrar
        />
      )}
    </div>
  );
}
