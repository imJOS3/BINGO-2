import { useState } from 'preact/hooks';
import useGameStore from "../../../../../store/gameStore";
import BingoCard from "../../scenery/cardBingo/BingoCard";
import TableGameData from "./tableGameData";
import useUsersGame from '../../../../../store/usersGame';
import useAuthStore from "../../../../../store/authStore";
import GamePlayers from './gamePlayer';
import { route } from "preact-router";

export default function GameData() {
    const { selectedGame, clearSelectedGame } = useGameStore();
    const { userInfo } = useAuthStore();
    const { leaveGame, fetchPlayers } = useUsersGame();
    const [showPlayers, setShowPlayers] = useState(false);

    if (!selectedGame) return <p>Juego no existe o hubo un error</p>;

    const handleLeaveGame = async () => {
        try {
            await leaveGame(selectedGame.id, userInfo.id);
            clearSelectedGame();
            route("/game");
        } catch (error) {
            console.error("Error al salir del juego:", error);
        }
    };

    const handleShowPlayers = async () => {
        await fetchPlayers(selectedGame.id);
        setShowPlayers(true);
    };

    const handleClosePlayers = () => {
        setShowPlayers(false);
    };

    return (
        <div className="flex items-start justify-between gap-32 p-6 w-[100vw] h-[90vh]">
            <div className="flex justify-end flex-col gap-2">
                <TableGameData />
                <button
                    className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600"
                    onClick={() => console.log("Ver Ganadores")}
                >
                    Ver Ganadores
                </button>

                <button
                    className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
                    onClick={handleShowPlayers}
                >
                    Ver Usuarios Conectados
                </button>

                <button
                    className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600"
                    onClick={handleLeaveGame}
                >
                    Salir
                </button>
            {/* Modal para mostrar jugadores */}
            </div>

            <BingoCard />

            {showPlayers && (
                <GamePlayers onClose={handleClosePlayers} />
            )}
            
            <button
                    className="bg-green-500 my-5  h-[89%] text-white py-2 px-6 rounded-lg hover:bg-green-600"
                    onClick={()=> route(`playing/${selectedGame.id}`)}
                >
                    Empezar
                </button>
    
            
        </div>
    );
}
