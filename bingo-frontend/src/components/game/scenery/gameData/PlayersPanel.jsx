import { useEffect } from "preact/hooks";
import useUsersGame from "../../../../../store/usersGame";
import useGameStore from "../../../../../store/gameStore";
import useAuthStore from "../../../../../store/authStore";
import usePresenceStore from "../../../../../store/presenceStore";
import { UsersIcon } from "./icons";

const STATUS = {
  online: { dot: "bg-[#3ecf8e]", label: "En mesa" },
  away: { dot: "bg-[var(--bingo-amber)]", label: "Ausente" },
  disconnected: { dot: "bg-white/25", label: "Sin conexión" },
};

/** Lista de la gente sentada en la mesa, con su estado en vivo. */
export default function PlayersPanel({ gameId, onOpenAll }) {
  const { selectedGame } = useGameStore();
  const { userInfo } = useAuthStore();
  const { players, fetchPlayers } = useUsersGame();
  const byUser = usePresenceStore((s) => s.byUser);

  useEffect(() => {
    if (gameId) fetchPlayers(gameId);
  }, [gameId]);

  const rows = (players || [])
    .map((player) => {
      const playerId = player.user_id || player.User?.id;
      const isMe = userInfo?.id != null && String(playerId) === String(userInfo.id);
      return {
        key: `${playerId}`,
        nick: player.User?.nickname || player.nickname || "Jugador",
        isMe,
        isHost:
          selectedGame?.creator_id != null &&
          String(playerId) === String(selectedGame.creator_id),
        status:
          byUser[String(playerId)] ||
          player.presence ||
          (isMe ? "online" : "disconnected"),
      };
    })
    .filter((row) => row.isMe || row.status !== "disconnected");

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/15 bg-black/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/65">
          <UsersIcon size={15} className="text-white/50" />
          En mesa
        </p>
        <button
          type="button"
          onClick={onOpenAll}
          title="Ver todos los jugadores"
          className="rounded-lg border border-white/15 px-2 py-0.5 font-bingo text-sm text-[var(--bingo-amber)] transition hover:bg-white/10"
        >
          {rows.length}
        </button>
      </div>

      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
        {rows.length ? (
          rows.map((row) => {
            const status = STATUS[row.status] || STATUS.disconnected;
            return (
              <li
                key={row.key}
                className="flex items-center gap-2 rounded-xl bg-white/8 px-2.5 py-2"
                title={status.label}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bingo text-xs text-white ${
                    row.isMe ? "bg-[var(--bingo-red)]" : "bg-white/15"
                  }`}
                >
                  {row.nick.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm font-bold ${
                      row.status === "disconnected" ? "text-white/45" : "text-white"
                    }`}
                  >
                    {row.nick}
                    {row.isMe ? " (tú)" : ""}
                  </span>
                  <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-white/50">
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </span>
                {row.isHost && (
                  <span className="shrink-0 rounded-md bg-[var(--bingo-amber)]/20 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[var(--bingo-amber)]">
                    Host
                  </span>
                )}
              </li>
            );
          })
        ) : (
          <li className="px-1 py-1 text-xs text-white/45">Cargando jugadores…</li>
        )}
      </ul>
    </section>
  );
}
