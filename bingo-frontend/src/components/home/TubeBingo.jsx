import { AnimatePresence, motion } from "framer-motion";
import BingoBall from "../game/scenery/structureBall/BingoBall";

export default function TuboBingo({
  currentBall,
  ballStage,
  ballVariants,
}) {
  return (
    <div className="relative h-[9vh] min-h-[4.5rem] w-full overflow-hidden sm:h-[11vh]">
      <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent" />
      <div className="absolute inset-y-2 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent sm:w-12" />
      <div className="absolute inset-y-2 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent sm:w-12" />

      <div className="relative z-10 flex h-full items-center justify-center">
        <AnimatePresence mode="wait">
          {currentBall && (
            <motion.div
              key={`${currentBall.letter}-${currentBall.num}`}
              variants={ballVariants}
              initial={{ left: "-10%", x: "-100%", rotate: 0 }}
              animate={ballStage}
              className="absolute"
            >
              <BingoBall
                letter={currentBall.letter}
                number={currentBall.num}
                size="md"
                className="scale-75 sm:scale-100"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
