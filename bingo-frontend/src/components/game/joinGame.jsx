
import axios from 'axios';
import GamePlayers from './gamePlayer';
import { useState } from 'preact/hooks';

const JoinGame = ({ games, userId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [joinedGameId, setJoinedGameId] = useState(null);

    const joinGame = async (gameId) => {
        setLoading(true);
        setError(null);
        try {
            await axios.post(`http://localhost:3000/api/game/${gameId}/join`, { userId });
            setJoinedGameId(gameId);  // Almacena el ID de la partida a la que se unió

        } catch (err) {
            setError('Error al unirse a la partida');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold">Unirse a una Partida</h2>
            {games.length === 0 ? (
                <p>No hay partidas disponibles.</p>
            ) : (
                <ul>
                    {games.map(game => (
                        <li key={game.id} className="border-b p-2 flex justify-between">
                            <span>{game.game_name}</span>
                            <button 
                                onClick={() => joinGame(game.id)} 
                                disabled={loading} 
                                className="bg-green-500 text-white p-1 rounded"
                            >
                                {loading ? 'Uniéndose...' : 'Unirse'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {error && <p className="text-red-500">{error}</p>}
            
            {/* Mostrar GamePlayers si el usuario se unió a una partida */}
            {joinedGameId && <GamePlayers gameId={joinedGameId} />}
        </div>
    );
};

export default JoinGame;
