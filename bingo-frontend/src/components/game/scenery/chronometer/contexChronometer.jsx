export default function ContextChronometer({ contextText = "Termina en" }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-white/10 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[var(--bingo-amber)] sm:text-xs">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--bingo-amber)]" />
      {contextText}
    </span>
  );
}
