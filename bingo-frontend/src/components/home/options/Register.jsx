import { useState } from "react";
import { route } from "preact-router";
import useAuthStore from "../../../../store/authStore";
import SocialAuthButtons from "./SocialAuthButtons";

const fieldClass =
  "w-full rounded-xl border-2 border-bingo-felt/20 bg-white/70 px-4 py-3 text-base font-semibold text-[var(--bingo-ink)] outline-none transition placeholder:text-bingo-felt/40 focus:border-[var(--bingo-felt)]";

export default function Register({ onBack, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const { register, loading, error } = useAuthStore();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await register(name.trim().slice(0, 20), email, password);
      route("/games");
    } catch (err) {
      setLocalError("No se pudo crear la cuenta");
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h2 className="font-bingo text-2xl text-[var(--bingo-felt)] sm:text-3xl">Crear cuenta</h2>
        <p className="mt-1 text-sm text-bingo-ink/70">Guarda tu progreso y entra más rápido.</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={20}
          className={fieldClass}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={fieldClass}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={fieldClass}
        />
        {(localError || error) && (
          <p className="rounded-lg bg-bingo-red/10 px-3 py-2 text-center text-sm font-medium text-[var(--bingo-red)]">
            {localError || error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--bingo-red)] px-5 py-3.5 font-bingo text-sm text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <SocialAuthButtons onError={setLocalError} />

      <p className="text-center text-xs leading-relaxed text-bingo-ink/65">
        Al continuar aceptas los{" "}
        <button type="button" onClick={() => route("/terms")} className="underline">
          Términos
        </button>{" "}
        y la{" "}
        <button type="button" onClick={() => route("/privacy")} className="underline">
          Privacidad
        </button>
        .
      </p>

      <p className="text-center text-sm text-bingo-ink/75">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-[var(--bingo-felt)] underline decoration-[var(--bingo-amber)] underline-offset-4"
        >
          Inicia sesión
        </button>
      </p>

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
