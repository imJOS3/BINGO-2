export default function GameMode({ mode = "GsingleColumn", message ="Completa la colmna G" }) {
    // Patrones de modos de juego
    const patterns = {
      full: Array(25).fill(true), // Todo el cartón tapado
      rightDiagonal: Array(25).fill(false).map((_, index) => index % 6 === 0), // Diagonal derecha
      leftDiagonal: Array(25).fill(false).map((_, index) => index % 4 === 0 && index > 0 && index < 24), // Diagonal izquierda
      BsingleColumn: Array(25).fill(false).map((_, index) => index % 5 === 0), // Primera columna
      IsingleColumn: Array(25).fill(false).map((_, index) => index % 5 === 1), // Segunda columna (I)
      NsingleColumn: Array(25).fill(false).map((_, index) => index % 5 === 2), // Tercera columna (N)
      GsingleColumn: Array(25).fill(false).map((_, index) => index % 5 === 3), // Cuarta columna (G)
      OsingleColumn: Array(25).fill(false).map((_, index) => index % 5 === 4), // Quinta columna (O)
         
    };
  
    // Selecciona el patrón según el modo
    const selectedPattern = patterns[mode] || Array(25).fill(false);
  
    return (
       <div className="flex  flex-col justify-center items-center ">
        <button className="px-6 py-3 border border-gray-500 bg-gradient-to-r from-purple-500 to-indigo-600 w-full text-white font-semibold rounded-lg shadow-md">
         {message}
        </button>
      <div className="grid grid-cols-5 gap-2 p-3 bg-[#5D9D9F] rounded-md shadow-md  border border-gray-500">
        {selectedPattern.map((isCovered, index) => (
          <div
            key={index}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-[#2D3248] border border-gray-700 relative"
          >
            {/* Punto circular si la celda está tapada */}
            {isCovered && (
              <div className="w-5 h-5 bg-red-500 rounded-full shadow-inner"></div>
            )}
          </div>
        ))}
      </div>
      </div>
    );
  }
  