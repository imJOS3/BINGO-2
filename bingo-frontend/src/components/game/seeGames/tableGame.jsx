import { useState, useEffect } from "preact/hooks";
import { motion } from "framer-motion";
import { connectSocket } from "../../../utils/socket";
import useGameStore from "../../../../store/gameStore";
import OneGame from "../searchGame/oneGame";
import BingoBall from "../scenery/structureBall/BingoBall";
import { generateRandomBingoBalls } from "../../../utils/bingoUtils";

const STATUS = {
  active: {
    label: "Abierta",
    className: "bg-[#1f8a5a] text-white",
    stripe: "#1f8a5a",
  },
  in_progress: {
    label: "En juego",
    className: "bg-[var(--bingo-amber)] text-[var(--bingo-ink)]",
    stripe: "#f0b429",
  },
  completed: {
    label: "Entre rondas",
    className: "bg-[#1d6fb8] text-white",
    stripe: "#1d6fb8",
  },
};

export default function TableGames() {
  const { games, fetchGames, loading, error, dropGame } = useGameStore();
  const [selectedGame, setSelectedGame] = useState(null);
  const [emptyBalls] = useState(() =>
    generateRandomBingoBalls(5, { keepLetterOrder: true })
  );

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL;
    if (!socketUrl) return;
    const socket = connectSocket();
    const refresh = () => fetchGames({ silent: true });

    socket.on("gameClosed", (payload) => {
      if (payload?.gameId) dropGame(payload.gameId);
    });
    socket.on("playerLeft", (payload) => {
      if (payload?.closed && payload.gameId) dropGame(payload.gameId);
      else refresh();
    });
    socket.on("gameCreated", refresh);
    socket.on("playerJoined", refresh);
    socket.on("gameStarted", refresh);

    // La presencia vive en memoria del servidor, así que el conteo de
    // conectados solo se refleja volviendo a pedir el listado.
    const interval = setInterval(refresh, 10000);

    return () => {
      clearInterval(interval);
      socket.off("gameClosed");
      socket.off("playerLeft");
      socket.off("gameCreated");
      socket.off("playerJoined");
      socket.off("gameStarted");
      socket.close();
    };
  }, []);

  // El servidor ya descarta las mesas desiertas usando la presencia real.
  const liveGames = (games || []).filter(
    (game) => game.game_status === "active" || game.game_status === "in_progress"
  );

  return (
    <section className="pb-16">
      <motion.div
        className="mb-5 flex items-end justify-between gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div>
          <h2 className="font-bingo text-2xl text-white sm:text-3xl">Mesas</h2>
          <p className="text-sm text-white/65">Toca una partida para unirte</p>
        </div>
        <button
          type="button"
          onClick={() => fetchGames()}
          className="rounded-lg border border-white/20 bg-black/25 px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:bg-black/40 hover:text-white"
        >
          Actualizar
        </button>
      </motion.div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <motion.div
            className="h-10 w-10 rounded-full border-4 border-white/20 border-t-[var(--bingo-amber)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sm text-white/70">Cargando mesas...</p>
        </div>
      )}
      {error && (
        <p className="py-12 text-center text-[var(--bingo-amber)]">
          Error al cargar las partidas
        </p>
      )}

      {!loading && !error && liveGames.length === 0 && (
        <motion.div
          className="bingo-ticket relative overflow-hidden rounded-2xl px-6 py-14 text-center shadow-[6px_6px_0_rgba(0,0,0,0.25)]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-4 flex justify-center gap-1">
            {emptyBalls.map((ball, i) => (
              <motion.div
                key={`${ball.letter}-${ball.number}`}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.12,
                }}
              >
                <BingoBall letter={ball.letter} number={ball.number} size="sm" />
              </motion.div>
            ))}
          </div>
          <p className="font-bingo text-2xl text-[var(--bingo-felt)]">Sin mesas aún</p>
          <p className="mx-auto mt-2 max-w-sm text-bingo-ink/70">
            Sé el primero: crea una partida y espera a que lleguen los jugadores.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {liveGames.map((game, index) => {
          const status = STATUS[game.game_status] || STATUS.active;
          return (
            <motion.button
              key={game.id}
              type="button"
              onClick={() => setSelectedGame(game)}
              initial={{ opacity: 0, y: 28 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.08 * index, duration: 0.4 },
              }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
              className="bingo-ticket group relative overflow-hidden rounded-2xl p-5 text-left shadow-[6px_6px_0_rgba(0,0,0,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--bingo-amber)]"
            >
              <div
                className="absolute inset-y-0 left-0 w-2"
                style={{ background: status.stripe }}
              />
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-bingo-felt/5 transition duration-150 group-hover:scale-125" />

              <div className="mb-4 flex items-start justify-between gap-3 pl-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-bingo-felt/60">
                    {game.room_code ? `Código ${game.room_code}` : "Mesa"}
                  </p>
                  <h3 className="font-bingo text-2xl leading-tight text-[var(--bingo-felt)]">
                    {game.game_name || "Sin nombre"}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <span className="rounded-md bg-bingo-felt/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--bingo-felt)]">
                    {game.is_public === false ? "Privada" : "Pública"}
                  </span>
                </div>
              </div>

              <div className="mb-5 flex gap-1.5 pl-2">
                {generateRandomBingoBalls(5, {
                  seed: game.id ?? game.room_code ?? index,
                  keepLetterOrder: true,
                }).map((ball) => (
                  <BingoBall
                    key={`${ball.letter}-${ball.number}`}
                    letter={ball.letter}
                    number={ball.number}
                    size="sm"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pl-2 text-sm text-bingo-ink/70">
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-6 items-center rounded-md bg-bingo-felt/10 px-2 text-xs font-bold text-[var(--bingo-felt)]">
                    {game.online_count ?? game.user_count ?? 0} jugadores
                  </span>
                  <span>
                    {game.created_at
                      ? new Date(game.created_at).toLocaleDateString("es-ES")
                      : "—"}
                  </span>
                </span>
                <span className="font-bingo text-sm text-[var(--bingo-red)]">
                  Entrar →
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedGame && (
        <OneGame game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </section>
  );
}
