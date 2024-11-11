import { useState, useEffect } from "preact/hooks";
import useBingoCardStore from "../../../../../store/bingoCardStore";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore"
import useAuthStore from "../../../../../store/authStore";
import useGameStore from "../../../../../store/gameStore";



export default function BingoCardPlaying() {
  const { selectedCard, loading } = useBingoCardStore();
  const {userInfo} =useAuthStore();
  const {selectedGame} = useGameStore();
  const { calledNumbers } = useCalledNumbersStore();
  const [selectedNumbers, setSelectedNumbers] = useState({});
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  const [freeSelected, setFreeSelected] = useState(false);

  
    // Al cargar el componente, verifica si hay una carta existente o crea una nueva
    useEffect(() => {
      const loadCard = async () => {
        if (!selectedGame) {
          await fetchCardsByUserAndGame(userInfo.id, selectedGame.id);
   
        }
      };
      loadCard();
    }, [userInfo, selectedGame]);

  const handleNumberClick = (letter, index) => {
    const number = selectedCard.numbers[letter][index];
    const key = `${letter}-${number}`;

    // Marca el número como seleccionado
    setSelectedNumbers((prev) => ({
      ...prev,
      [key]: true,
    }));

    // Desactiva la animación de ping para el número clicado
    setAnimatedNumbers((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  // Maneja el clic en la casilla "FREE"
  const handleFreeClick = () => {
    if (!freeSelected) {
      setFreeSelected(true);
      alert("¡Has ganado! 🎉");
    }
  };

  // Colores para cada letra
  const letterStyles = {
    B: "bg-red-600",
    I: "bg-green-600",
    N: "bg-blue-600",
    G: "bg-yellow-600",
    O: "bg-purple-600",
  };

  // Verifica si el número ha sido llamado
  const isNumberCalled = (letter, number) => {
    return calledNumbers.some(
      (called) => called.letter === letter && called.number === number
    );
  };

  // Activa la animación si el número ha sido llamado y no está seleccionado
  useEffect(() => {
    if (selectedCard) {
      const newAnimatedNumbers = { ...animatedNumbers };
      ["B", "I", "N", "G", "O"].forEach((letter) => {
        selectedCard.numbers[letter].forEach((number) => {
          const key = `${letter}-${number}`;
          if (isNumberCalled(letter, number) && !selectedNumbers[key]) {
            newAnimatedNumbers[key] = true;
          }
        });
      });
      setAnimatedNumbers(newAnimatedNumbers);
    }
  }, [calledNumbers, selectedCard, selectedNumbers]);

  // Verifica si todas las casillas están seleccionadas para activar la casilla "FREE"
  const allNumbersSelected = ["B", "I", "N", "G", "O"].flatMap((letter, colIdx) =>
    selectedCard?.numbers[letter].map((number, rowIdx) => {
      const key = `${letter}-${number}`;
      // Excluye la casilla "FREE" (columna "N" y fila índice 2)
      return colIdx === 2 && rowIdx === 2 ? true : selectedNumbers[key];
    })
  );

  const isBingoComplete = allNumbersSelected.every((isSelected) => isSelected);

  return (
    <div className="flex flex-col items-center gap-4 overflow-hidden border border-gray-950 rounded-lg">
      {loading ? (
        <div className="text-xl text-gray-600">Cargando carta...</div>
      ) : selectedCard ? (
        <div className="grid grid-cols-5 gap-y-6 gap-x-10 px-6 py-4 bg-[#5D9D9F] rounded-lg shadow-md">
          {/* Fila de letras BINGO */}
          <div className="col-span-5 flex justify-between py-2 px-1 rounded-md border-gray-950 border bg-gray-100">
            {["B", "I", "N", "G", "O"].map((letter) => (
              <div
                key={letter}
                className={`text-center font-bold text-3xl text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg ${letterStyles[letter]} relative overflow-hidden`}
              >
                {letter}
              </div>
            ))}
          </div>

          {/* Números de la carta */}
          {["B", "I", "N", "G", "O"].map((letter, colIdx) => (
            <div key={letter} className="flex flex-col gap-4 items-center">
              {Array.from({ length: 5 }).map((_, rowIndex) => {
                const numbers = selectedCard.numbers[letter] || [];
                const number = numbers[rowIndex];
                const key = `${letter}-${number}`;
                const isSelected = selectedNumbers[key];
                const isAnimating = animatedNumbers[key] && !isSelected;
                const isCalled = isNumberCalled(letter, number);

                // Casilla "FREE"
                if (letter === "N" && rowIndex === 2) {
                  return (
                    <div
                      key="free-space"
                      className={`relative w-20 h-16 flex items-center justify-center rounded-md shadow-sm text-xl font-semibold cursor-pointer ${
                        freeSelected
                          ? "bg-red-500 text-white"
                          : "bg-[#2D3248] text-gray-400"
                      }`}
                      onClick={isBingoComplete ? handleFreeClick : null}
                    >
                      {freeSelected && (
                        <div className="absolute w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out">
                          <div className="w-12 h-12 rounded-full bg-red-500"></div>
                        </div>
                      )}
                      FREE
                    </div>
                  );
                }

                return (
                  <div
                    key={`${letter}-${rowIndex}`}
                    className={`relative w-20 h-16 flex items-center justify-center ${
                      isCalled ? "cursor-pointer" : "cursor-not-allowed"
                    } bg-[#2D3248] border border-gray-900 text-white rounded-md shadow-sm text-xl font-semibold transition-transform duration-200 ease-in-out 
                      ${isCalled ? "hover:scale-105" : ""}`}
                    onClick={() => isCalled && handleNumberClick(letter, rowIndex)}
                  >
                    {isSelected ? (
                      <div className="absolute w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out">
                        <div className="w-12 h-12 rounded-full bg-red-500"></div>
                      </div>
                    ) : (
                      <span className={`${isAnimating ? "animate-pulse   scale-110 animate-infinite" : ""}`} >{number || ""} </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xl text-gray-600">No hay cartas disponibles.</div>
      )}
    </div>
  );
}
