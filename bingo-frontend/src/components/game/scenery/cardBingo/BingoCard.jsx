import { useEffect } from 'preact/hooks';
import useBingoCardStore from '../../../../../store/bingoCard';
import useAuthStore from '../../../../../store/authStore';
import useGameStore from '../../../../../store/gameStore';

export default function BingoCard() {
    const { selectedGame, setSelectedGame } = useGameStore();
    const { userInfo, setUserInfo } = useAuthStore();
    const { generateAndSaveCard, selectedCard, fetchCardsByUserAndGame } = useBingoCardStore();

    // Recupera los datos de localStorage al cargar el componente
    useEffect(() => {
        const savedGame = localStorage.getItem('selectedGame');
        const savedUser = localStorage.getItem('userInfo');

        if (savedGame) {
            setSelectedGame(JSON.parse(savedGame));
        }
        if (savedUser) {
            setUserInfo(JSON.parse(savedUser));
        }
    }, []);

    // Guarda los datos en localStorage cuando cambian
    useEffect(() => {
        if (selectedGame) {
            localStorage.setItem('selectedGame', JSON.stringify(selectedGame));
        }
        if (userInfo) {
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
    }, [selectedGame, userInfo]);

    const handleGenerateCard = async () => {
        if (userInfo && selectedGame) {
            console.log("Datos de la solicitud:", {
                userId: userInfo.id,
                gameId: selectedGame.id,
            });
            try {
                await generateAndSaveCard(userInfo.id, selectedGame.id);
                await fetchCardsByUserAndGame(userInfo.id, selectedGame.id);
            } catch (error) {
                console.error("Error al generar la tarjeta:", error);
            }
        }
    };
    useEffect(() => {
        if (userInfo && selectedGame) {
            generateAndSaveCard(userInfo.id, selectedGame.id);
            fetchCardsByUserAndGame(userInfo.id, selectedGame.id);
        }
    }, [userInfo, selectedGame]);

    return (
        <div className="relative flex flex-col items-center gap-4 p-4">
            {selectedCard && (
                <div className="grid grid-cols-5 gap-8 p-6 bg-gray-100 rounded-lg shadow-md">
                    {['B', 'I', 'N', 'G', 'O'].map((letter, colIndex) => (
                        <div key={letter} className="flex flex-col gap-4 items-center">
                            <div className="text-center font-bold text-2xl text-blue-500">{letter}</div>
                            {Array.from({ length: 5 }).map((_, rowIndex) => {
                                const numbers = selectedCard.numbers[letter] || [];
                                return (
                                    <div
                                        key={`${letter}-${rowIndex}`}
                                        className="w-16 h-16 flex items-center justify-center bg-white border border-gray-300 text-gray-800 rounded-md shadow-sm text-xl font-semibold"
                                    >
                                        {letter === 'N' && rowIndex === 2 ? (
                                            <span></span>
                                        ) : (
                                            numbers[rowIndex] || ''
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {/* Botón sobrepuesto */}
            <button
                onClick={handleGenerateCard}
                className="absolute -bottom-2 right-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                +
            </button>
        </div>
    );
}
