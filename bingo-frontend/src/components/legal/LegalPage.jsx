import { route } from "preact-router";

export default function LegalPage({ kicker, title, updated, children }) {
  return (
    <div className="bingo-felt relative min-h-full w-full overflow-x-hidden text-[var(--bingo-ink)]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-bingo-amber/20 blur-3xl" />
        <div className="absolute -right-20 bottom-24 h-72 w-72 rounded-full bg-bingo-red/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <button
          type="button"
          onClick={() => route("/")}
          className="mb-4 text-sm font-semibold text-white/75 transition hover:text-white"
        >
          ← Volver al inicio
        </button>

        <article className="bingo-ticket overflow-hidden rounded-2xl p-5 shadow-[8px_8px_0_rgba(0,0,0,0.35)] sm:p-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-bingo-felt/55">
            {kicker}
          </p>
          <h1 className="mt-1 font-bingo text-3xl text-[var(--bingo-felt)] sm:text-4xl">
            {title}
          </h1>
          {updated && (
            <p className="mt-2 text-xs text-bingo-ink/55">Última actualización: {updated}</p>
          )}
          <div className="mt-6 space-y-6 text-sm leading-relaxed text-[var(--bingo-ink)] sm:text-base">
            {children}
          </div>
        </article>

        <p className="mt-6 text-center text-xs text-white/60">
          <button
            type="button"
            onClick={() => route("/terms")}
            className="underline underline-offset-2 hover:text-white"
          >
            Términos
          </button>
          {" · "}
          <button
            type="button"
            onClick={() => route("/privacy")}
            className="underline underline-offset-2 hover:text-white"
          >
            Privacidad
          </button>
          {" · "}
          Bingonline
        </p>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-2 font-bingo text-lg text-[var(--bingo-felt)]">{title}</h2>
      <div className="space-y-2 text-bingo-ink/85">{children}</div>
    </section>
  );
}
