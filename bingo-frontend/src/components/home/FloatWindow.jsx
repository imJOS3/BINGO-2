import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { route } from "preact-router";
import Login from "./options/Login";
import Register from "./options/Register";
import useAuthStore from "../../../store/authStore";

const panelMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28 },
};

export default function FloatWindow() {
  const [view, setView] = useState("menu");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginAsGuest } = useAuthStore();

  const enterAsGuest = async (path = "/games") => {
    const nickname = guestName.trim().slice(0, 20);
    if (nickname.length < 2) {
      setError("Escribe un nombre (mínimo 2 caracteres)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginAsGuest(nickname);
      route(path);
    } catch (err) {
      setError("No se pudo entrar como invitado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="relative z-20 w-full max-w-md justify-self-center lg:justify-self-start"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.1 }}
    >
      <div className="bingo-ticket relative overflow-hidden rounded-2xl p-6 shadow-[6px_6px_0_rgba(0,0,0,0.35)] sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          {["B", "I", "N", "G", "O"].map((letter, i) => (
            <motion.span
              key={letter}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--bingo-felt)] font-bingo text-sm text-[var(--bingo-amber)] sm:h-10 sm:w-10 sm:text-base"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {view === "menu" && (
            <motion.div key="menu" {...panelMotion} className="flex flex-col gap-4">
              <div>
                <h1 className="font-bingo text-4xl leading-none text-[var(--bingo-felt)] sm:text-5xl">
                  Bingo
                  <span className="block text-[var(--bingo-red)]">Online</span>
                </h1>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-bingo-ink/75">
                  Entra como invitado con tu nombre — no hace falta crear cuenta.
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--bingo-felt)]">
                  Tu nombre
                </span>
                <input
                  type="text"
                  placeholder="¿Cómo te llamamos?"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-xl border-2 border-bingo-felt/20 bg-white/70 px-4 py-3 text-base font-semibold text-[var(--bingo-ink)] outline-none transition placeholder:text-bingo-felt/40 focus:border-[var(--bingo-felt)]"
                />
              </label>

              {error && (
                <p className="rounded-lg bg-bingo-red/10 px-3 py-2 text-center text-sm font-medium text-[var(--bingo-red)]">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => enterAsGuest("/games")}
                  disabled={loading}
                  className="rounded-xl bg-[var(--bingo-red)] px-5 py-3.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Entrando..." : "Jugar como invitado"}
                </button>

                <div className="mt-1 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-bingo-felt/15" />
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-bingo-felt/50">
                      O con tu cuenta
                    </span>
                    <span className="h-px flex-1 bg-bingo-felt/15" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="rounded-xl bg-[var(--bingo-felt)] px-3 py-3 text-sm font-bold text-white shadow-[2px_2px_0_#062820] transition hover:brightness-110"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("register")}
                      className="rounded-xl border-2 border-[var(--bingo-amber)] bg-[var(--bingo-amber)]/15 px-3 py-3 text-sm font-bold text-[var(--bingo-felt)] transition hover:bg-[var(--bingo-amber)]/30"
                    >
                      Crear cuenta
                    </button>
                  </div>
                  <p className="mt-1 text-center text-xs text-bingo-ink/55">
                    Al entrar aceptas los{" "}
                    <button
                      type="button"
                      onClick={() => route("/terms")}
                      className="underline"
                    >
                      Términos
                    </button>{" "}
                    y la{" "}
                    <button
                      type="button"
                      onClick={() => route("/privacy")}
                      className="underline"
                    >
                      Privacidad
                    </button>
                    .
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === "login" && (
            <motion.div key="login" {...panelMotion}>
              <Login
                onBack={() => setView("menu")}
                onSwitchToRegister={() => setView("register")}
              />
            </motion.div>
          )}

          {view === "register" && (
            <motion.div key="register" {...panelMotion}>
              <Register
                onBack={() => setView("menu")}
                onSwitchToLogin={() => setView("login")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
