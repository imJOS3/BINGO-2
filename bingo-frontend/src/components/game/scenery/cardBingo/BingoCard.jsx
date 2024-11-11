import { useEffect, useState } from "preact/hooks";
import useBingoCardStore from "../../../../../store/bingoCardStore";
import useAuthStore from "../../../../../store/authStore";
import useGameStore from "../../../../../store/gameStore";

export default function BingoCard() {
  const { userInfo } = useAuthStore();
  const { selectedGame, fetchGameById } = useGameStore();
  const {
    generateAndSaveCard,
    selectedCard,
    fetchCardsByUserAndGame,
    updateCardByUserAndGame,
  } = useBingoCardStore();

  const [isCardLoaded, setIsCardLoaded] = useState(false);

  // Carga los datos del store al montar el componente
  useEffect(() => {
    if (userInfo && !selectedGame) {
      // Se obtiene el juego seleccionado solo si no está cargado
      fetchGameById(userInfo.selectedGameId); 
    }
  }, [userInfo, selectedGame, fetchGameById]);

  // Al cargar el componente, verifica si hay una carta existente o crea una nueva
  useEffect(() => {
    const loadCard = async () => {
      if (userInfo && selectedGame && !isCardLoaded) {
        await fetchCardsByUserAndGame(userInfo.id, selectedGame.id);
        const updatedSelectedCard = useBingoCardStore.getState().selectedCard;
        if (!updatedSelectedCard) {
          await generateAndSaveCard(userInfo.id, selectedGame.id);
        }
        setIsCardLoaded(true);
      }
    };
    loadCard();
  }, [userInfo, selectedGame, isCardLoaded]);

  // Manejador para actualizar la carta de bingo
  const handleUpdateCard = async () => {

    console.log(selectedCard)

    if (userInfo && selectedGame && selectedCard) {

      await updateCardByUserAndGame(
        userInfo.id,
        selectedGame.id,
        
      );
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4 p-4">
      {selectedCard && (
        <div className="grid grid-cols-5 gap-8 p-6 bg-gray-100 rounded-lg shadow-md">
          {["B", "I", "N", "G", "O"].map((letter) => (
            <div key={letter} className="flex flex-col gap-4 items-center">
              <div className="text-center font-bold text-2xl text-blue-500">
                {letter}
              </div>
              {Array.from({ length: 5 }).map((_, rowIndex) => {
                const numbers = selectedCard.numbers[letter] || [];
                return (
                  <div
                    key={`${letter}-${rowIndex}`}
                    className="w-16 h-16 flex items-center justify-center bg-white border border-gray-300 text-gray-800 rounded-md shadow-sm text-xl font-semibold"
                  >
                    {letter === "N" && rowIndex === 2 ? (
                      <span></span>
                    ) : (
                      numbers[rowIndex] || ""
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpdateCard}
        className="absolute -bottom-2 right-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        +
      </button>
    </div>
  );
}
