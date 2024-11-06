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

  // Colores para cada letra
  const letterStyles = {
    B: "bg-red-600",
    I: "bg-green-600",
    N: "bg-blue-600",
    G: "bg-yellow-600",
    O: "bg-purple-600",
  };

  return (
    <div className="flex flex-col  items-center gap-4 overflow-hidden border border-gray-950 rounded-lg">
      {loading ? (
        <div className="text-xl text-gray-600">Cargando carta...</div>
      ) : selectedCard ? (
        <div className="grid grid-cols-5 gap-y-6 gap-x-10 px-6 py-4 bg-[#5D9D9F] rounded-lg shadow-md">
          {/* Fila de letras BINGO con fondo gris */}
          <div className="col-span-5 flex justify-between py-2 px-1 rounded-md border-gray-950 border bg-gray-100">
            {["B", "I", "N", "G", "O"].map((letter) => (
              <div
                key={letter}
                className={`text-center font-bold text-3xl text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg ${letterStyles[letter]} relative overflow-hidden`}
              >
                {/* Círculo blanco interno */}
                <div className="absolute inset-0  rounded-full"></div>
                {/* Efecto de luz en la esquina */}
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full opacity-10"></div>
                {letter}
              </div>
            ))}
          </div>

          {["B", "I", "N", "G", "O"].map((letter) => (
            <div key={letter} className="flex flex-col gap-4 items-center">
              {Array.from({ length: 5 }).map((_, rowIndex) => {
                const numbers = selectedCard.numbers[letter] || [];
                const isSelected = selectedNumbers[`${letter}-${rowIndex}`]; // Verifica si el número está seleccionado
                return (
                  <div
                    key={`${letter}-${rowIndex}`}
                    className={`relative w-20 h-16 flex items-center justify-center bg-[#2D3248] border border-gray-900 text-white rounded-md shadow-sm text-xl font-semibold cursor-pointer transition-transform duration-200 ease-in-out ${isSelected ? 'scale-105' : ''}`} // Agrega cursor de puntero y animación de escala
                    onClick={() => handleNumberClick(letter, rowIndex)} // Maneja el clic
                  >
                    {isSelected ? (
                      <div className="absolute w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out">
                        <div className="w-12 h-12 rounded-full bg-red-500 animate-"></div> {/* Círculo rojo con animación */}
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
