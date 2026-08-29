export default function ChatFab({
  onClick,
  label = "Abrir chat",
  unread = 0,
  hidden = false,
}) {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={unread > 0 ? `${label} (${unread} sin leer)` : label}
      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[var(--bingo-amber)] text-[var(--bingo-ink)] shadow-[3px_3px_0_rgba(6,40,32,0.45)] transition hover:brightness-110"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 18.5 4.8 21V18.5H7.2A7.2 7.2 0 1 1 16.8 8.4 7.2 7.2 0 0 1 8 18.5Z" />
        <path d="M8.2 9.6h7.2M8.2 13h4.8" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--bingo-red)] px-1 text-[0.65rem] font-bold text-white ring-2 ring-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}
