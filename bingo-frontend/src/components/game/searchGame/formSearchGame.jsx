import { useState } from "preact/hooks";
import { motion, AnimatePresence } from "framer-motion";
import useGameStore from "../../../../store/gameStore";
import OneGame from "./oneGame";

export default function FormSearchGame() {
  const { searchGames, loading, error } = useGameStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;

    setSearched(true);
    setSelectedGame(null);
    const found = await searchGames(value);
    setResults(found);

    if (found.length === 1) {
      setSelectedGame(found[0]);
    }
  };

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.45 }}
    >
      <form
        onSubmit={handleSearch}
        className="bingo-ticket flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-stretch sm:gap-0 sm:p-2 sm:pl-5"
      >
        <div className="flex flex-1 flex-col justify-center">
          <label className="font-bingo text-[0.65rem] tracking-wide text-[var(--bingo-felt)]">
            Nombre o código
          </label>
          <input
            type="text"
            value={query}
            onInput={(e) => setQuery(e.target.value)}
            placeholder="Ej: K7M2PQ o Noche bingo"
            className="w-full bg-transparent text-lg font-semibold uppercase tracking-wide text-[var(--bingo-ink)] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-bingo-felt/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--bingo-felt)] px-8 py-3 font-bingo text-sm text-white transition hover:bg-[var(--bingo-felt-deep)] disabled:cursor-wait disabled:opacity-70 sm:rounded-lg"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {loading && (
        <p className="mt-3 text-center text-sm text-white/70">Buscando partida...</p>
      )}
      {error && searched && (
        <p className="mt-3 text-center text-sm text-[var(--bingo-amber)]">
          No se encontró esa partida
        </p>
      )}
      {searched && !loading && !error && results.length === 0 && (
        <p className="mt-3 text-center text-sm text-[var(--bingo-amber)]">
          No hay mesas con ese nombre o código
        </p>
      )}

      {results.length > 1 && (
        <div className="mt-4 grid gap-2">
          {results.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => setSelectedGame(game)}
              className="bingo-ticket flex items-center justify-between rounded-xl px-4 py-3 text-left"
            >
              <span>
                <span className="block font-bingo text-lg text-[var(--bingo-felt)]">
                  {game.game_name}
                </span>
                <span className="text-xs font-bold tracking-[0.18em] text-bingo-felt/60">
                  {game.room_code || "Mesa"}
                </span>
              </span>
              <span className="font-bingo text-sm text-[var(--bingo-red)]">Ver →</span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedGame && (
          <OneGame game={selectedGame} onClose={() => setSelectedGame(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
