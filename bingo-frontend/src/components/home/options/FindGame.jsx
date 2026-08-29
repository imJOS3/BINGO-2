import { useState } from "react";
import { route } from "preact-router";
import useGameStore from "../../../../store/gameStore";
import useAuthStore from "../../../../store/authStore";
import useUsersGame from "../../../../store/usersGame";

const fieldClass =
  "w-full rounded-xl border-2 border-bingo-felt/20 bg-white/70 px-4 py-3 text-base font-semibold uppercase tracking-widest text-[var(--bingo-ink)] outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-bingo-felt/40 focus:border-[var(--bingo-felt)]";

export default function FindGame({ onBack }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { searchGames, setSelectedGame } = useGameStore();
  const { userInfo } = useAuthStore();
  const { joinGame } = useUsersGame();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) {
      setError("Escribe un nombre, código o ID");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const found = await searchGames(value);
      if (!found.length) {
        setError("No se encontró esa mesa");
        return;
      }

      const game = found[0];
      setSelectedGame(game);
      if (userInfo?.id) {
        await joinGame(game.id, userInfo.id);
      }
      if (game.game_status === "in_progress") {
        route(`/playing/${game.id}`);
      } else {
        route(`/game/${game.id}`);
      }
    } catch (err) {
      setError("No se pudo buscar la mesa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h2 className="font-bingo text-2xl text-[var(--bingo-felt)] sm:text-3xl">Buscar mesa</h2>
        <p className="mt-1 text-sm text-bingo-ink/70">
          Usa el nombre, el código de 6 caracteres o el ID.
        </p>
      </div>

      <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Código, nombre o ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          disabled={loading}
          className={fieldClass}
        />
        {error && (
          <p className="text-center text-sm font-medium text-[var(--bingo-red)]">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--bingo-red)] px-5 py-3.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Uniendo a la mesa..." : "Unirse"}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="text-center text-sm font-semibold text-bingo-felt/70 hover:text-[var(--bingo-felt)]"
      >
        ← Volver
      </button>
    </div>
  );
}
