import { useEffect } from "preact/hooks";
import useUsersGame from "../../../../../store/usersGameStore";
import useGameStore from "../../../../../store/gameStore";

const GamePlayers = ({ onClose }) => {
  const { selectedGame } = useGameStore();
  const { players, loading, fetchPlayers } = useUsersGame();

  useEffect(() => {
    fetchPlayers(selectedGame.id);
  }, [selectedGame.id]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Jugadores en la Partida</h2>
        {loading ? (
          <p>Cargando jugadores...</p>
        ) : (
          <ul>
            {players.map((player) => (
              <li key={player.id} className="p-2 border-b border-gray-200">
                {player.User.nickname}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default GamePlayers;
