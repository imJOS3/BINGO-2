import Balls from "../../src/components/game/scenery/ball/balls";
import BingoCardPlaying from "../../src/components/game/scenery/cardBingo/BIngoCArdPlaying";

export default function Playing() {
  return (

    <div className="flex w-screen flex-col items-center justify-center  "> 
      
      {/* Contenedor de la carta de bingo, centrado */}
      <div className="flex justify-center items-center w-full mb-10">
        <div className="w-1/2 flex justify-center">
          <BingoCardPlaying />
        </div>
      </div>
      
      {/* Contenedor de Balls, centrado */}
      <div className="absolute w-screen flex justify-start items-end "> {/* Cambiado a absolute */}
        
      </div>

    </div>
  );
}
