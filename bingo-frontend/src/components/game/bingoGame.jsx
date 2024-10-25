import { useEffect, useState } from 'preact/hooks';
import axios from 'axios';
import CreateGame from './createGame';
import JoinGame from './joinGame';

const BingoGame = ({ userId }) => {
    const [games, setGames] = useState([]);

    // Función para obtener los juegos disponibles
    const fetchGames = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/game'); 
            setGames(response.data); // Guarda los juegos en el estado
        } catch (error) {
            console.error('Error al obtener los juegos:', error);
        }
    };

    // Efecto para cargar los juegos al montar el componente
    useEffect(() => {
        fetchGames();
    }, []); // El array vacío asegura que esto solo se ejecute al montar el componente

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Bingo Online</h1>
            <CreateGame userId={userId} setGames={setGames} />
            <JoinGame games={games} userId={userId} />
        </div>
    );
};

export default BingoGame;
