import { AnimatePresence, motion } from "framer-motion";

const PANEL_W = 272;

/**
 * Columna lateral que se desliza al abrir (chat, jugadores, estadísticas).
 * En escritorio empuja el cartón; en móvil se superpone a la derecha.
 */
export default function SideDrawer({ open, onClose, children }) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <>
          <motion.button
            key="drawer-backdrop"
            type="button"
            className="fixed inset-0 z-[999] bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Cerrar panel"
            onClick={onClose}
          />
          <motion.aside
            key="drawer-panel"
            initial={{ width: 0, opacity: 0, x: 28 }}
            animate={{ width: PANEL_W, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 28 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed inset-y-2 right-14 z-[1000] min-h-0 overflow-hidden lg:static lg:z-10 lg:h-auto lg:self-stretch"
          >
            <div className="h-full" style={{ width: PANEL_W }}>
              {children}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function DockHeader({ title, subtitle, onClose }) {
  return (
    <header className="flex shrink-0 items-center justify-between bg-[var(--bingo-felt)] px-4 py-3 text-white">
      <div className="min-w-0">
        <p className="font-bingo text-sm leading-none">{title}</p>
        {subtitle ? (
          <p className="mt-1 truncate text-[0.65rem] font-semibold uppercase tracking-widest text-white/85">
            {subtitle}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-white/20 px-2.5 py-1 text-sm text-white/80 transition hover:bg-white/10"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </header>
  );
}
