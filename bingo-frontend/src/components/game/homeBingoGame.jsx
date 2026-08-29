import { useState } from "preact/hooks";
import { motion } from "framer-motion";
import { route } from "preact-router";
import BingoSidebar, { BingoMenuButton } from "../navBar/BingoSidebar";
import BingoBall from "./scenery/structureBall/BingoBall";
import useAuthStore from "../../../store/authStore";
import { generateRandomBingoBalls } from "../../utils/bingoUtils";

const FLOATING_LAYOUT = [
  { x: "6%", y: "18%", delay: 0, size: "sm" },
  { x: "86%", y: "16%", delay: 0.35, size: "sm" },
  { x: "80%", y: "62%", delay: 0.7, size: "sm" },
  { x: "10%", y: "66%", delay: 1.0, size: "sm" },
  { x: "48%", y: "10%", delay: 0.2, size: "sm" },
];

function FloatingBall({ letter, number, x, y, delay, size }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-0 hidden sm:block"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 0.55, scale: 1, y: [0, -18, 0] }}
      transition={{
        opacity: { duration: 0.7, delay },
        scale: { duration: 0.7, delay },
        y: { duration: 4.5 + delay, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      <BingoBall letter={letter} number={number} size={size} />
    </motion.div>
  );
}

export default function BingoGame() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [floatingBalls] = useState(() =>
    generateRandomBingoBalls(FLOATING_LAYOUT.length).map((ball, i) => ({
      ...ball,
      ...FLOATING_LAYOUT[i],
    }))
  );
  const [headerBalls] = useState(() =>
    generateRandomBingoBalls(5, { keepLetterOrder: true })
  );
  const [playIconBalls] = useState(() =>
    generateRandomBingoBalls(3, { keepLetterOrder: true })
  );
  const { logout, userInfo } = useAuthStore();

  const actions = [
    {
      id: "play",
      label: "Mesas",
      hint: "Ver partidas disponibles",
      tone: "danger",
      path: "/game",
      onClick: () => route("/game"),
    },
    {
      id: "create",
      label: "Crear mesa",
      hint: "Abre tu propia partida",
      path: "/game",
      onClick: () => route("/game?create=1"),
      tone: "accent",
    },
    {
      id: "home",
      label: "Inicio",
      hint: "Portada principal",
      onClick: () => route("/"),
    },
  ];

  const cards = [
    {
      id: "play",
      title: "Entrar a jugar",
      desc: "Explora mesas abiertas y únete en un toque.",
      cta: "Ver mesas",
      tone: "red",
      delay: 0.2,
      onClick: () => route("/game"),
      icon: (
        <div className="flex -space-x-2">
          {playIconBalls.map((ball) => (
            <BingoBall
              key={`${ball.letter}-${ball.number}`}
              letter={ball.letter}
              number={ball.number}
              size="sm"
            />
          ))}
        </div>
      ),
    },
    {
      id: "create",
      title: "Crear mesa",
      desc: "Elige el modo, el tiempo y espera a tus amigos.",
      cta: "Nueva partida",
      tone: "amber",
      delay: 0.32,
      onClick: () => route("/game?create=1"),
      icon: (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bingo-amber)] font-bingo text-2xl text-[var(--bingo-ink)] shadow-[3px_3px_0_#9a7510] sm:h-12 sm:w-12 sm:text-3xl">
          +
        </span>
      ),
    },
  ];

  return (
    <div className="bingo-felt relative flex h-full max-h-full w-full flex-col overflow-hidden text-white">
      {floatingBalls.map((ball) => (
        <FloatingBall key={`${ball.letter}-${ball.number}`} {...ball} />
      ))}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-bingo-amber/15 blur-3xl" />
        <div className="absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-bingo-red/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex shrink-0 items-center justify-between">
          <BingoMenuButton onClick={() => setSidebarOpen(true)} />
          <motion.div
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-sm"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ecf8e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3ecf8e]" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              En vivo
            </span>
          </motion.div>
        </div>

        <motion.header
          className="mt-3 shrink-0 text-center sm:mt-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="mb-2 flex justify-center gap-1 sm:mb-3 sm:gap-2">
            {headerBalls.map((ball, i) => (
              <motion.div
                key={`${ball.letter}-${ball.number}`}
                initial={{ y: 28, opacity: 0, rotate: -12 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  rotate: 0,
                  transition: {
                    delay: 0.08 * i,
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                  },
                }}
                whileHover={{ y: -6, rotate: i % 2 === 0 ? -6 : 6 }}
                transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
              >
                <BingoBall
                  letter={ball.letter}
                  number={ball.number}
                  size="md"
                  style={{
                    width: "clamp(2.4rem, 8.2vmin, 4.4rem)",
                    height: "clamp(2.4rem, 8.2vmin, 4.4rem)",
                  }}
                />
              </motion.div>
            ))}
          </div>

          <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--bingo-amber)] sm:text-sm">
            Sala privada
          </p>
          <h1 className="font-bingo text-[clamp(1.85rem,5.6vmin,3.4rem)] leading-none">
            Bingo{" "}
            <span className="text-[var(--bingo-amber)]">Online</span>
          </h1>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-white/75 sm:text-base">
            Hola{userInfo?.nickname ? `, ${userInfo.nickname}` : ""} — elige cómo
            quieres jugar esta noche.
          </p>
        </motion.header>

        <div className="mx-auto mt-3 grid min-h-0 w-full max-w-3xl flex-1 content-center gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              type="button"
              onClick={card.onClick}
              initial={{ opacity: 0, y: 32 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: card.delay, duration: 0.45 },
              }}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
              className="bingo-ticket group relative overflow-hidden rounded-2xl p-4 text-left shadow-[6px_6px_0_rgba(0,0,0,0.3)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--bingo-amber)] sm:p-5"
            >
              <div
                className={`absolute inset-y-0 left-0 w-2.5 ${
                  card.tone === "red"
                    ? "bg-[var(--bingo-red)]"
                    : "bg-[var(--bingo-amber)]"
                }`}
              />
              <div className="mb-2 pl-2 sm:mb-3">{card.icon}</div>
              <h2 className="pl-2 font-bingo text-xl leading-tight text-[var(--bingo-felt)] sm:text-2xl">
                {card.title}
              </h2>
              <p className="mt-1 pl-2 text-sm leading-snug text-bingo-ink/70">
                {card.desc}
              </p>
              <span
                className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 font-bingo text-sm text-white transition group-hover:brightness-110 sm:mt-4 sm:px-4 sm:py-2.5 ${
                  card.tone === "red"
                    ? "bg-[var(--bingo-red)] shadow-[3px_3px_0_#7a1c1c]"
                    : "bg-[var(--bingo-felt)] shadow-[3px_3px_0_#062820]"
                }`}
              >
                {card.cta}
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          ))}
        </div>

        <motion.div
          className="mt-3 flex shrink-0 flex-wrap items-center justify-center gap-2 pb-1 pt-2 sm:mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Abrir menú
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              route("/");
            }}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-bingo-red/50 hover:text-white"
          >
            Salir
          </button>
        </motion.div>
      </div>

      <BingoSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="/games"
        title="Lobby"
        subtitle="Bingo Online"
        actions={actions}
      />
    </div>
  );
}
