import { useState, useEffect } from "preact/hooks";
import { motion } from "framer-motion";
import FloatWindow from "../components/home/FloatWindow";
import TubeBingo from "../components/home/TubeBingo";
import BingoCard from "../components/home/BingoCard";
import { generateBingoCard, getBallVariants, generateBingoBall } from "../utils/bingoUtils";

export default function Home() {
  const [bingoCard, setBingoCard] = useState(generateBingoCard());
  const [currentBall, setCurrentBall] = useState(null);
  const [ballStage, setBallStage] = useState("entering");
  const [usedNumbers, setUsedNumbers] = useState(new Set());

  useEffect(() => {
    setCurrentBall(generateBingoBall(usedNumbers, setUsedNumbers));
    setBallStage("entering");
  }, []);

  useEffect(() => {
    if (!currentBall) return;

    if (ballStage === "entering") {
      const timer = setTimeout(() => setBallStage("stopped"), 2000);
      return () => clearTimeout(timer);
    }
    if (ballStage === "stopped") {
      const timer = setTimeout(() => setBallStage("exiting"), 8000);
      return () => clearTimeout(timer);
    }
    if (ballStage === "exiting") {
      const timer = setTimeout(() => {
        setCurrentBall(generateBingoBall(usedNumbers, setUsedNumbers));
        setBallStage("entering");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [ballStage, currentBall]);

  const ballVariants = getBallVariants();

  return (
    <div className="bingo-felt relative min-h-screen w-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-bingo-amber/20 blur-3xl" />
        <div className="absolute -right-20 bottom-32 h-72 w-72 rounded-full bg-bingo-red/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-4 overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-[0_8px_0_rgba(0,0,0,0.25)] backdrop-blur-sm sm:mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <TubeBingo
            currentBall={currentBall}
            ballStage={ballStage}
            ballVariants={ballVariants}
          />
        </motion.div>

        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <FloatWindow />

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
          >
            <BingoCard bingoCard={bingoCard} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
