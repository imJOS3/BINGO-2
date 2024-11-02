import useGameStore from "../../../../../store/gameStore";

export default function TableGameData() {

    const {selectedGame}= useGameStore()

    return(
        <>
        <h2 className="text-3xl font-bold text-center">Detalles del juego</h2>
        <table className="table-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <tbody>
                    
                    <tr>
                        <td className="p-4 font-semibold">ID del Juego</td>
                        <td className="p-4">{selectedGame.id}</td>
                    </tr>
                    <tr className="bg-gray-100">
                        <td className="p-4 font-semibold">Nombre del Juego</td>
                        <td className="p-4">{selectedGame.game_name}</td>
                    </tr>
                    <tr>
                        <td className="p-4 font-semibold">Estado</td>
                        <td className="p-4">{selectedGame.game_status}</td>
                    </tr>
                    <tr className="bg-gray-100">
                        <td className="p-4 font-semibold">Creado el</td>
                        <td className="p-4">{new Date(selectedGame.created_at).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td className="p-4 font-semibold">Número de Usuarios</td>
                        <td className="p-4">{selectedGame.user_count}</td>
                    </tr>
                </tbody>
            </table>
        </>
        
    );

}