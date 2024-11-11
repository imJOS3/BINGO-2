import { useState } from 'preact/hooks';
import { route } from 'preact-router'; // Asegúrate de importar 'route' de preact-router
import useUsersGame from '../../../../../store/usersGame';
import useAuthStore from '../../../../../store/authStore';
import useGameStore from '../../../../../store/gameStore';

export default function LeaveGame() {
  const { leaveGame, loading } = useUsersGame();
  const [error, setError] = useState(null);
  const { userInfo } = useAuthStore();
  const { selectedGame } = useGameStore();

  console.log(selectedGame)

  const handleLeaveGame = async () => {
    // Muestra el mensaje de confirmación antes de ejecutar la función
    const confirmLeave = window.confirm("¿Está seguro de que desea salir del juego?");
    if (confirmLeave) {
      try {
        setError(null); // Reinicia el error al intentar salir
        await leaveGame(selectedGame.id, userInfo.id);
        alert('Has salido de la partida');
        route('/game'); // Redirige al usuario a la ruta /game
      } catch (err) {
        setError('Error al salir de la partida');
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleLeaveGame}
        disabled={loading}
        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Saliendo...' : 'Salir de la Partida'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
