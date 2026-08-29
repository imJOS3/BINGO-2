import { motion } from "framer-motion";
import BingoBall from "../structureBall/BingoBall";
import { backdropClose } from "../../../../utils/modal";

export default function LeaveConfirmModal({
  gameName,
  loading = false,
  error = null,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-bingo-felt-deep/80 p-4 backdrop-blur-sm"
      onClick={backdropClose(onCancel, loading)}
    >
      <motion.div
        className="bingo-ticket relative w-full max-w-sm overflow-hidden rounded-2xl p-6 text-center shadow-[8px_8px_0_rgba(0,0,0,0.35)]"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 24 }}
      >
        <div className="absolute inset-y-0 left-0 w-2 bg-[var(--bingo-red)]" />
        <div className="mb-3 flex justify-center">
          <BingoBall letter="O" number={75} size="sm" />
        </div>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-bingo-felt/55">
          Última llamada
        </p>
        <h2 className="mt-1 font-bingo text-2xl text-[var(--bingo-felt)]">
          ¿Salir de la partida?
        </h2>
        <p className="mt-2 text-sm text-bingo-ink/70">
          {gameName
            ? `Vas a dejar la mesa “${gameName}”. Tu cartón se queda, pero sales de la ronda.`
            : "¿Estás seguro de que quieres salir del juego?"}
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-bingo-red/10 px-3 py-2 text-sm font-medium text-[var(--bingo-red)]">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border-2 border-bingo-felt/25 px-4 py-2.5 font-semibold text-[var(--bingo-felt)] transition hover:bg-white/50 disabled:opacity-60"
          >
            Seguir jugando
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-[var(--bingo-red)] px-4 py-2.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Saliendo..." : "Sí, salir"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
