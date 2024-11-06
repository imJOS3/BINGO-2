import { useEffect, useState } from 'preact/hooks';
import axios from 'axios';
import imgInicio from "../assets/imgs/imgInicio.png";
import { ProtectedRoute } from '../../utils/ProtectedRoute';
import TableGames from './game/seeGames/tableGame';
import { route } from 'preact-router';

export default function BingoGame () {
    const [games, setGames] = useState([]);

    const botones = [
        {
            name: "Salir",
            color: "bg-red-500",
            hoverColor: "hover:bg-red-600",
            offset: "-translate-y-1/2" 
        },
        {
            name: "Jugar",
            color: "bg-green-500",
            hoverColor: "hover:bg-green-600",
            offset: "", // Sin ajuste de posición
            onClick: () => route("/game")
        },
        {
            name: "Confi",
            color: "bg-blue-500",
            hoverColor: "hover:bg-blue-600",
            offset: "-translate-y-1/2" // Eleva este botón
        }
    ];

    // Función para obtener los juegos disponibles
    const fetchGames = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/game'); 
            setGames(response.data);
        } catch (error) {
            console.error('Error al obtener los juegos:', error);
        }
    };

    // Efecto para cargar los juegos al montar el componente
    useEffect(() => {
        fetchGames();
    }, []);

    return (
        <div className="flex flex-col items-center  justify-center h-svh w-screen bg-[#a9d9e6]">
            <div className='h-full w-full flex justify-center'>
                <img src={imgInicio} alt="Banner" className="h-[83%] w-[60%]" />
            </div>
            <div className="flex justify-between w-full px-12 absolute bottom-12">
                {botones.map((boton, index) => (
                    <button
                        key={index}
                        className={`${boton.color} ${boton.hoverColor} ${boton.offset} text-white py-4 px-8 rounded-lg text-lg transform transition-transform duration-300 ease-in-out hover:scale-125`}
                        onClick={boton.onClick} // Añade el evento onClick
                    >
                        {boton.name}
                    </button>
                ))}
            </div>
        </div>
    );
};


