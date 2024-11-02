import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateGame = ({ userId, setGames }) => {
    const [gameName, setGameName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createGame = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:3000/api/game', { 
                game_name: gameName, 
                game_status: 'active' 
            });
            // Actualiza la lista de juegos
            setGames(prevGames => [...prevGames, response.data]);
            setGameName('');
        } catch (err) {
            setError('Error al crear la partida');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-4">
            <h2 className="text-xl font-bold">Crear Partida</h2>
            <input 
                type="text" 
                value={gameName} 
                onChange={(e) => setGameName(e.target.value)} 
                placeholder="Nombre de la partida" 
                className="border p-2 rounded"
            />
            <button 
                onClick={createGame} 
                disabled={loading} 
                className="bg-blue-500 text-white p-2 rounded ml-2"
            >
                {loading ? 'Creando...' : 'Crear Partida'}
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
};

export default CreateGame;
