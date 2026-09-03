import { useState, useEffect } from "preact/hooks";
import { motion } from "framer-motion";
import { route } from "preact-router";
import FormSearchGame from "../../components/game/searchGame/formSearchGame";
import TableGames from "../../components/game/seeGames/tableGame";
import CreateGameModal from "../../components/game/create/CreateGameModal";
import BingoSidebar, { BingoMenuButton } from "../../components/navBar/BingoSidebar";
import BingoBall from "../../components/game/scenery/structureBall/BingoBall";
import useAuthStore from "../../../store/authStore";
import useGameStore from "../../../store/gameStore";
import { generateRandomBingoBalls } from "../../utils/bingoUtils";

const FLOATING_LAYOUT = [
  { x: "5%", y: "16%", delay: 0, size: "sm" },
  { x: "90%", y: "18%", delay: 0.4, size: "sm" },
  { x: "82%", y: "62%", delay: 0.8, size: "md" },
  { x: "8%", y: "70%", delay: 1.1, size: "sm" },
  { x: "52%", y: "90%", delay: 0.2, size: "sm" },
];

function FloatingBall({ letter, number, x, y, delay, size }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-0 hidden md:block"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 0.45, y: [0, -14, 0] }}
      transition={{
        opacity: { duration: 0.8, delay },
        y: { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      <BingoBall letter={letter} number={number} size={size} />
    </motion.div>
  );
}

export default function Games() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [floatingBalls] = useState(() =>
    generateRandomBingoBalls(FLOATING_LAYOUT.length).map((ball, i) => ({
      ...ball,
      ...FLOATING_LAYOUT[i],
    }))
  );
  const [headerBalls] = useState(() =>
    generateRandomBingoBalls(5, { keepLetterOrder: true })
  );
  const [searchBall] = useState(() => generateRandomBingoBalls(1)[0]);
  const { userInfo } = useAuthStore();
  const { games, fetchGames } = useGameStore();

  useEffect(() => {
    fetchGames();
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") {
      setIsModalOpen(true);
      window.history.replaceState({}, "", "/game");
    }

    const interval = setInterval(() => fetchGames({ silent: true }), 10000);
    return () => clearInterval(interval);
  }, []);

  const openCount =
    games?.filter(
      (g) => g.game_status === "active" || g.game_status === "in_progress"
    )?.length || 0;

  const sidebarActions = [
    {
      id: "lobby",
      label: "Lobby",
      hint: "Pantalla principal del juego",
      path: "/games",
      onClick: () => route("/games"),
    },
    {
      id: "mesas",
      label: "Mesas",
      hint: "Partidas disponibles",
      path: "/game",
      onClick: () => route("/game"),
      tone: "accent",
    },
    {
      id: "create",
      label: "Nueva partida",
      hint: "Abre tu propia mesa",
      tone: "danger",
      keepOpen: false,
      onClick: () => setIsModalOpen(true),
    },
    {
      id: "home",
      label: "Inicio",
      hint: "Volver a la portada",
      onClick: () => route("/"),
    },
  ];

  return (
    <div className="bingo-felt fixed inset-0 z-10 overflow-y-auto text-[var(--bingo-ink)]">
      {floatingBalls.map((ball) => (
        <FloatingBall key={`${ball.letter}-${ball.number}`} {...ball} />
      ))}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-bingo-amber/12 blur-3xl" />
        <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-bingo-red/14 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-8 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <BingoMenuButton onClick={() => setSidebarOpen(true)} />
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-sm sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ecf8e] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3ecf8e]" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                En vivo
              </span>
            </div>
            {userInfo?.nickname && (
              <span className="rounded-full border border-dashed border-white/25 bg-black/20 px-3 py-1.5 text-xs font-semibold text-[var(--bingo-amber)]">
                {userInfo.nickname}
              </span>
            )}
          </motion.div>
        </div>

        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex justify-center gap-1 sm:hidden">
            {headerBalls.map((ball, i) => (
              <motion.div
                key={`${ball.letter}-${ball.number}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05 * i, type: "spring", stiffness: 280 }}
              >
                <BingoBall letter={ball.letter} number={ball.number} size="sm" />
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--bingo-amber)]">
                Sala en vivo
              </p>
              <h1 className="font-bingo text-4xl leading-none text-white sm:text-6xl">
                Bingo
                <span className="block text-[var(--bingo-amber)]">Online</span>
              </h1>
              <p className="mt-3 max-w-md text-base text-white/75">
                Elige una mesa abierta, busca por nombre o código, o abre tu propia partida.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.div
                className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-[0.65rem] uppercase tracking-widest text-white/50">
                  Mesas abiertas
                </p>
                <p className="font-bingo text-3xl text-[var(--bingo-amber)]">{openCount}</p>
              </motion.div>
              <motion.div
                className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
              >
                <p className="text-[0.65rem] uppercase tracking-widest text-white/50">
                  Total
                </p>
                <p className="font-bingo text-3xl text-white">{games?.length || 0}</p>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Acciones principales */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <motion.button
            type="button"
            onClick={() => setIsModalOpen(true)}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: 0.2, duration: 0.45 },
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
            className="bingo-ticket group relative overflow-hidden rounded-2xl p-5 text-left shadow-[6px_6px_0_rgba(0,0,0,0.28)]"
          >
            <div className="absolute inset-y-0 left-0 w-2.5 bg-[var(--bingo-red)]" />
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-bingo-red/10 transition duration-150 group-hover:scale-125" />
            <div className="relative pl-2">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bingo-red)] font-bingo text-2xl text-white shadow-[3px_3px_0_#7a1c1c]">
                +
              </div>
              <h2 className="font-bingo text-2xl text-[var(--bingo-felt)]">Crear mesa</h2>
              <p className="mt-1 text-sm text-bingo-ink/65">
                Configura modo, tiempo y invita a jugar.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-bingo text-sm text-[var(--bingo-red)]">
                Empezar
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setShowSearch((v) => !v)}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: 0.3, duration: 0.45 },
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
            className="bingo-ticket group relative overflow-hidden rounded-2xl p-5 text-left shadow-[6px_6px_0_rgba(0,0,0,0.28)]"
          >
            <div className="absolute inset-y-0 left-0 w-2.5 bg-[var(--bingo-amber)]" />
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-bingo-amber/15 transition duration-150 group-hover:scale-125" />
            <div className="relative pl-2">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bingo-felt)] shadow-[3px_3px_0_#062820]">
                <BingoBall letter={searchBall.letter} number={searchBall.number} size="sm" />
              </div>
              <h2 className="font-bingo text-2xl text-[var(--bingo-felt)]">Buscar mesa</h2>
              <p className="mt-1 text-sm text-bingo-ink/65">
                Entra con el nombre o el código de 6 caracteres.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-bingo text-sm text-[var(--bingo-felt)]">
                {showSearch ? "Ocultar búsqueda" : "Abrir búsqueda"}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: 0.2 }}
                >
                  →
                </motion.span>
              </span>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: showSearch ? "auto" : 0,
            opacity: showSearch ? 1 : 0,
            marginBottom: showSearch ? 8 : 0,
          }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden"
        >
          <FormSearchGame />
        </motion.div>

        <TableGames />
      </div>

      <BingoSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="/game"
        title="Menú"
        subtitle="Bingo Online"
        actions={sidebarActions}
      />

      {isModalOpen && <CreateGameModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
