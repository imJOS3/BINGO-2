import { useEffect, useState } from "preact/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { route } from "preact-router";
import useAuthStore from "../../../store/authStore";
import BingoBall from "../game/scenery/structureBall/BingoBall";
import { generateRandomBingoBalls } from "../../utils/bingoUtils";

/**
 * Sidebar deslizante con estética de sala de bingo.
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} activePath - ruta actual para resaltar
 * @param {Array<{ id: string, label: string, hint?: string, onClick: () => void, tone?: 'default'|'danger'|'accent' }>} actions
 */
export default function BingoSidebar({
  isOpen,
  onClose,
  activePath = "",
  actions = [],
  title = "Menú",
  subtitle = "Sala de bingo",
}) {
  const { userInfo, logout } = useAuthStore();
  const isGuest = Boolean(userInfo?.isGuest);
  const [menuBalls] = useState(() =>
    generateRandomBingoBalls(5, { keepLetterOrder: true })
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    route("/");
  };

  const toneClass = (tone) => {
    if (tone === "danger") {
      return "bg-[var(--bingo-red)] text-white hover:brightness-110 shadow-[3px_3px_0_#7a1c1c]";
    }
    if (tone === "accent") {
      return "bg-[var(--bingo-amber)] text-[var(--bingo-ink)] hover:brightness-105 shadow-[3px_3px_0_#9a7510]";
    }
    return "bg-white/15 text-white hover:bg-white/25 border border-white/10";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-bingo-felt-deep/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed left-0 top-0 z-[70] flex h-full w-[min(20rem,88vw)] flex-col overflow-hidden border-r-4 border-[var(--bingo-amber)]"
            style={{
              background:
                "linear-gradient(180deg, #145a4a 0%, #0b3d32 45%, #062820 100%)",
            }}
            initial={{ x: "-105%" }}
            animate={{ x: 0 }}
            exit={{ x: "-105%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Franja ticket */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-[repeating-linear-gradient(180deg,#f0b429_0_10px,transparent_10px_18px)] opacity-80" />

            <div className="relative flex items-start justify-between gap-3 px-5 pb-4 pt-6">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--bingo-amber)]">
                  {subtitle}
                </p>
                <h2 className="font-bingo text-2xl leading-none text-white">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/20 px-2.5 py-1 text-sm font-bold text-white/80 transition hover:bg-white/10"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            {/* Bolas BINGO */}
            <div className="mb-5 flex justify-center gap-1 px-5">
              {menuBalls.map((ball, i) => (
                <motion.div
                  key={`${ball.letter}-${ball.number}`}
                  initial={{ scale: 0, y: 8 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.15, type: "spring", stiffness: 260 }}
                >
                  <BingoBall letter={ball.letter} number={ball.number} size="sm" />
                </motion.div>
              ))}
            </div>

            {/* Jugador */}
            <div className="mx-4 mb-5 rounded-xl border border-dashed border-white/25 bg-black/20 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-widest text-white/50">
                {isGuest ? "Invitado" : "Jugador"}
              </p>
              <p className="font-bingo text-lg text-[var(--bingo-amber)]">
                {userInfo?.nickname || "Invitado"}
              </p>
            </div>

            {/* Acciones */}
            <nav className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-4">
              {actions.map((action) => {
                const isActive =
                  action.path &&
                  (activePath === action.path ||
                    activePath.startsWith(`${action.path}/`));
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      action.onClick?.();
                      if (!action.keepOpen) onClose();
                    }}
                    className={`rounded-xl px-4 py-3 text-left transition ${toneClass(
                      action.tone
                    )} ${isActive ? "ring-2 ring-[var(--bingo-amber)]" : ""}`}
                  >
                    <span className="block font-bingo text-sm leading-none">
                      {action.label}
                    </span>
                    {action.hint && (
                      <span className="mt-1 block text-xs opacity-75">
                        {action.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-white/10 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                {isGuest ? "Salir" : "Cerrar sesión"}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** Botón hamburguesa / menú con look de ticket bingo */
export function BingoMenuButton({ onClick, className = "" }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "tween", duration: 0.12, ease: "easeOut" }}
      className={`inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-white/35 bg-black/25 px-3 py-2 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-black/40 ${className}`}
      aria-label="Abrir menú"
    >
      <span className="flex flex-col gap-1">
        <span className="block h-0.5 w-5 rounded bg-[var(--bingo-amber)]" />
        <span className="block h-0.5 w-5 rounded bg-white" />
        <span className="block h-0.5 w-5 rounded bg-[var(--bingo-red)]" />
      </span>
      <span className="font-bingo text-xs tracking-wide">Menú</span>
    </motion.button>
  );
}
