import { motion } from "framer-motion";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import { LETTER_COLORS, getBingoLetter } from "../../../../utils/bingoStats";
import SpectatorBoards from "./SpectatorBoards";

export default function SpectatorQueue({ gameId, roundOver = false }) {
  const { calledNumbers } = useCalledNumbersStore();
  const last = [...calledNumbers].reverse().slice(0, 5);

  return (
    <div className="flex h-full max-h-full w-full flex-col gap-2 overflow-hidden">
      <motion.div
        className="shrink-0 rounded-2xl border-2 border-dashed border-white/25 bg-black/30 p-3 text-center backdrop-blur-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-[var(--bingo-amber)] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-[var(--bingo-ink)]">
            En cola
          </span>
          <p className="font-bingo text-base text-white">
            {roundOver ? "¡Ya casi juegas!" : "Estás viendo la partida"}
          </p>
          <span className="font-bingo text-sm text-[var(--bingo-amber)]">
            {calledNumbers.length}/75
          </span>
        </div>

        <p className="mt-1 text-xs text-white/65">
          {roundOver
            ? "Esta ronda terminó. En cuanto el anfitrión abra la siguiente, recibes tu cartón."
            : "Mira las bolas y los cartones de la mesa; jugarás en la próxima ronda."}
        </p>

        {last.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {last.map((called) => (
              <span
                key={called.number}
                className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold text-white"
                style={{
                  background:
                    LETTER_COLORS[called.letter || getBingoLetter(called.number)],
                }}
              >
                {called.number}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      <SpectatorBoards gameId={gameId} />
    </div>
  );
}
