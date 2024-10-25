import React, { useState } from 'react';
import axios from 'axios';

const BingoCard = ({ userId, gameId }) => {

    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para generar la carta de bingo
    const generateBingoCard = async () => {
        setLoading(true);
        setError(null);
        try {
            // Realiza la petición POST para generar la carta de bingo
            const postResponse = await axios.post('http://localhost:3000/api/generate-card', { user_id: 1, game_id: 1 });
            
            // Realiza la petición GET para obtener la carta generada
            const getResponse = await axios.get(`http://localhost:3000/api/card/${postResponse.data.id}`);
            
            // Establece los datos de la carta en el estado
            console.log("GET Response Data:", getResponse.data); // Verifica la estructura de datos
            setCard(getResponse.data);
            setLoading(false);
        } catch (err) {
            setError('Error al generar la carta');
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Bingo Game</h1>
            
            {/* Botón para generar la carta */}
            <button 
                onClick={generateBingoCard} 
                className="bg-blue-500 text-white p-2 rounded"
            >
                Generar Carta de Bingo
            </button>

            {/* Mostrar el estado de carga */}
            {loading && <p>Generando carta...</p>}

            {/* Mostrar un error si ocurre */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Mostrar la carta de bingo si está disponible */}
            {card && card.card_data && (
            <div className="grid grid-cols-5 gap-4 mt-4">
                {['B', 'I', 'N', 'G', 'O'].map((letter, colIndex) => (
                    <div key={letter} className="flex flex-col gap-2    ">
                        {card.card_data[letter].map((number, index) => (
                            <div key={index} className="bg-gray-200 p-4 rounded-lg text-center">
                                {number}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            )}
        </div>
    );
};

export default BingoCard;
