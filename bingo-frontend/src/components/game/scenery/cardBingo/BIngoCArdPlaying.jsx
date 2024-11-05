import { useState } from "preact/hooks";
import useBingoCardStore from "../../../../../store/bingoCardStore";

export default function BingoCardPlaying() {
  const { selectedCard, loading } = useBingoCardStore();
  const [selectedNumbers, setSelectedNumbers] = useState({}); // Estado para los números seleccionados

  const handleNumberClick = (letter, index) => {
    // Actualiza el estado para marcar el número como seleccionado
    setSelectedNumbers((prev) => ({
      ...prev,
      [`${letter}-${index}`]: true,
    }));
  };

  return (
    <div className="ml-[20%] flex flex-col items-center gap-4 p-3 overflow-hidden m">
      {loading ? (
        <div className="text-xl text-gray-600">Cargando carta...</div>
      ) : selectedCard ? (
        <div className="grid grid-cols-5 gap-8 p-6 bg-[#5D9D9F] rounded-lg shadow-md">
          {["B", "I", "N", "G", "O"].map((letter) => (
            <div key={letter} className="flex flex-col gap-4 items-center">
              <div className="flex items-center justify-center w-16 h-16 bg-[#2D3248] rounded-full relative">
                <div className="absolute w-14 h-14 bg-[#8CEE92] rounded-full"></div>
                <span className="text-3xl text-[#2D3248] font-bold z-10">{letter}</span>
              </div>
              {Array.from({ length: 5 }).map((_, rowIndex) => {
                const numbers = selectedCard.numbers[letter] || [];
                const isSelected = selectedNumbers[`${letter}-${rowIndex}`]; // Verifica si el número está seleccionado
                return (
                  <div
                    key={`${letter}-${rowIndex}`}
                    className="relative w-16 h-16 flex items-center justify-center bg-[#2D3248] border border-gray-300 text-[#8CEE92] rounded-md shadow-sm text-xl font-semibold cursor-pointer" // Agrega cursor de puntero
                    onClick={() => handleNumberClick(letter, rowIndex)} // Maneja el clic
                  >
                    {isSelected ? (
                      <div className="absolute w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-500"></div> {/* Círculo rojo */}
                      </div>
                    ) : (
                      numbers[rowIndex] || ""
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
