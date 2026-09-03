import { useState } from "preact/hooks";
import { route } from "preact-router";
import { motion } from "framer-motion";
import useAuthStore from "../../../../store/authStore";
import useGameStore from "../../../../store/gameStore";
import useUsersGame from "../../../../store/usersGame";

export default function JoinKeyGate({ game, onJoined }) {
  const [joinKey, setJoinKey] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useAuthStore();
  const { setSelectedGame } = useGameStore();
  const { joinGame } = useUsersGame();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!joinKey.trim()) {
      setError("Escribe la clave de esta mesa");
      return;
    }
    if (!userInfo?.id || !game?.id) {
      setError("No se pudo unir a la mesa");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const joined = await joinGame(game.id, userInfo.id, joinKey.trim());
      const table = joined?.game || game;
      setSelectedGame(table);
      onJoined?.(joined);
    } catch (err) {
      setError(err.message || "La clave no coincide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-bingo-felt-deep/80 p-4 backdrop-blur-sm">
      <motion.div
        className="bingo-ticket relative w-full max-w-sm overflow-hidden rounded-2xl p-6 text-center shadow-[8px_8px_0_rgba(0,0,0,0.35)]"
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-bingo-felt/55">
          Mesa privada
        </p>
        <h2 className="mt-1 font-bingo text-2xl text-[var(--bingo-felt)]">
          {game?.game_name || "Esta mesa"}
        </h2>
        <p className="mt-2 text-sm text-bingo-ink/70">
          El host puso una clave. Escríbela para entrar.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-left">
          <input
            type="text"
            value={joinKey}
            onInput={(e) => setJoinKey(e.target.value)}
            placeholder="Clave de entrada"
            className="w-full rounded-xl border-2 border-bingo-felt/15 bg-white/70 px-3 py-2.5 outline-none focus:border-[var(--bingo-felt)]"
            autoFocus
          />
          {error && (
            <p className="rounded-lg bg-bingo-red/10 px-3 py-2 text-center text-sm font-medium text-[var(--bingo-red)]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--bingo-red)] px-4 py-2.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Comprobando..." : "Entrar"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => route("/game")}
          className="mt-3 text-sm font-semibold text-bingo-felt/70 hover:text-[var(--bingo-felt)]"
        >
          Volver a mesas
        </button>
      </motion.div>
    </div>
  );
}
