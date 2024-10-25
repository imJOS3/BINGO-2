import { useEffect, useState } from 'preact/hooks';

import axios from 'axios';

const GamePlayers = ({ gameId }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/game/${gameId}/players`);
                console.log(response.data)
                setPlayers(response.data.user);
            } catch (error) {
                console.error("Error fetching players:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, [gameId]);

    return (
        <div className="mt-4">
            <h2 className="text-lg font-bold">Jugadores en la Partida</h2>
            {loading ? (
                <p>Cargando jugadores...</p>
            ) : (
                <ul>
                    {players.map(player => (
                        <li key={player.id} className="p-2">
                            {player.nickname}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GamePlayers;
