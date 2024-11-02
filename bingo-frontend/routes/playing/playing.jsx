import Balls from "../../src/components/game/scenery/ball/balls";
import BingoCardPlaying from "../../src/components/game/scenery/cardBingo/BIngoCArdPlaying";

export default function Playing() {
  return (
    <div className="flex flex-col items-center justify-center  bg-gradient-to-b from-gray-800 to-gray-900 text-white relative"> {/* Asegurando que el contenedor sea relativo */}
      
      {/* Contenedor de la carta de bingo, centrado */}
      <div className="flex justify-center items-center w-full mb-10">
        <div className="w-1/2 flex justify-center">
          <BingoCardPlaying />
        </div>
      </div>
      
      {/* Contenedor de Balls, centrado */}
      <div className="absolute w-screen h-screen flex justify-start items-end overflow-hidden"> {/* Cambiado a absolute */}
        <Balls />
      </div>

    </div>
  );
}
