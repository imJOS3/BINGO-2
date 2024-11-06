import BingoCardPlaying from "../../components/game/scenery/cardBingo/BIngoCArdPlaying";
import Chronometer from "../../components/game/scenery/chronometer/chronometer";
import ContexChronometer from "../../components/game/scenery/chronometer/contexChronometer";
export default function Playing() {
  return (
    <div className="flex w-full h-full flex-col items-center justify-center">
      <div className="flex w-full gap-4 items-center justify-center  bg-purple-200  p-4 rounded-lg shadow-lg">
        <ContexChronometer contextText={"Proximo juego"} />
        <Chronometer />
      </div>
      <BingoCardPlaying />
    </div>
  );
}
