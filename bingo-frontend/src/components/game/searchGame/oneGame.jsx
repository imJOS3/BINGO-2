import { route } from "preact-router";
import useUsersGame from "../../../../store/usersGame";
import useAuthStore from "../../../../store/authStore";
import useGameStore from "../../../../store/gameStore";

export default function OneGame({ game, onClose }) {
  const { joinGame } = useUsersGame(); // Obtiene la función joinGame del store
  const { userInfo } = useAuthStore();
  const { setSelectedGame  } = useGameStore();

  // Función que maneja unirse al juego
  const handleGame = async () => {
    try {
      await joinGame(game.id, userInfo.id);
      setSelectedGame(game)
      route(`game/${game.id}`); // Redirige a la página del juego después de unirse
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3 relative">
        <h2 className="text-2xl font-bold mb-4 text-center">{game.game_name}</h2>

        <div className="space-y-2 text-center">
          <p className="text-gray-700">
            <span className="font-semibold">ID del Juego:</span> {game.id}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Estado:</span> {game.game_status}
          </p>
          <p className="text-gray-500">
            <span className="font-semibold">Creado el:</span>{" "}
            {new Date(game.created_at).toLocaleDateString()}
          </p>
          {game.ended_at && (
            <p className="text-gray-500">
              <span className="font-semibold">Finalizado el:</span>{" "}
              {new Date(game.ended_at).toLocaleDateString()}
            </p>
          )}
          <p className="text-gray-700">
            <span className="font-semibold">Número de Usuarios:</span>{" "}
            {game.user_count}
          </p>
        </div>

        <div className="flex justify-center flex-row-reverse gap-4 mt-6">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            onClick={handleGame}
          >
            Unirse al juego
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
            onClick={onClose} // Llama a la función para cerrar el modal
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
