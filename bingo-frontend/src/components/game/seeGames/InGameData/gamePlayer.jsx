import { useEffect } from "preact/hooks";
import useUsersGame from "../../../../../store/usersGame";
import useGameStore from "../../../../../store/gameStore";
import useAuthStore from "../../../../../store/authStore";
import usePresenceStore from "../../../../../store/presenceStore";
import { backdropClose } from "../../../../utils/modal";
import { DockHeader } from "../../scenery/gameData/SideDrawer";

const STATUS_META = {
  online: { label: "En mesa", dot: "bg-[#22c55e]" },
  away: { label: "Ausente", dot: "bg-[#f0b429]" },
  disconnected: { label: "Sin conexión", dot: "bg-[#e23d3d]" },
};

export default function GamePlayers({ onClose, docked = false }) {
  const { selectedGame } = useGameStore();
  const { userInfo } = useAuthStore();
  const { players, loading, fetchPlayers } = useUsersGame();
  const byUser = usePresenceStore((s) => s.byUser);

  useEffect(() => {
    if (selectedGame?.id) fetchPlayers(selectedGame.id);
  }, [selectedGame?.id, selectedGame?.user_count]);

  const rows = (players || [])
    .map((player) => {
      const nick = player.User?.nickname || player.nickname || "Jugador";
      const playerId = player.user_id || player.User?.id;
      const isMe =
        userInfo?.id != null && String(playerId) === String(userInfo.id);
      const isHost =
        selectedGame?.creator_id != null &&
        String(playerId) === String(selectedGame.creator_id);
      const status = isMe
        ? byUser[String(playerId)] || player.presence || "online"
        : byUser[String(playerId)] || player.presence || "disconnected";
      const inQueue = Boolean(player.is_spectator);
      return { player, nick, playerId, isMe, isHost, status, inQueue };
    })
    .filter((row) => row.isMe || row.status !== "disconnected")
    .sort((a, b) => Number(a.inQueue) - Number(b.inQueue));

  const queued = rows.filter((row) => row.inQueue).length;

  const list = (
    <>
      {queued > 0 && (
        <p className="mt-1 text-sm text-bingo-ink/60">
          {queued === 1
            ? "1 persona en cola para la próxima ronda"
            : `${queued} personas en cola para la próxima ronda`}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-bingo-ink/65">Cargando...</p>
      ) : (
        <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
          {rows.map((row) => {
            const statusMeta = STATUS_META[row.status] || STATUS_META.disconnected;
            return (
              <li
                key={row.player.id || row.nick}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                  row.status === "disconnected" ? "bg-white/40 opacity-70" : "bg-white/60"
                }`}
              >
                <div className="min-w-0">
                  <span className="font-semibold text-[var(--bingo-ink)]">
                    {row.nick}
                    {row.isMe ? " (tú)" : ""}
                  </span>
                  <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-bingo-felt/70">
                    <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                    {row.inQueue && " · en cola"}
                  </p>
                </div>
                {row.inQueue && (
                  <span className="mr-1.5 rounded bg-bingo-felt/15 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase text-[var(--bingo-felt)]">
                    Cola
                  </span>
                )}
                {row.isHost && (
                  <span className="rounded bg-[var(--bingo-amber)] px-1.5 py-0.5 text-[0.55rem] font-bold uppercase text-[var(--bingo-ink)]">
                    Host
                  </span>
                )}
              </li>
            );
          })}
          {!rows.length && (
            <li className="text-sm text-bingo-ink/60">Aún no hay jugadores.</li>
          )}
        </ul>
      )}
    </>
  );

  if (docked) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#ece5dd] shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
        <DockHeader
          title="Jugadores"
          subtitle={
            rows.length
              ? `${rows.length - queued} en mesa${queued ? ` · ${queued} en cola` : ""}`
              : "Mesa"
          }
          onClose={onClose}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">{list}</div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-bingo-felt-deep/75 p-4 backdrop-blur-sm"
      onClick={backdropClose(onClose)}
    >
      <div className="bingo-ticket w-full max-w-sm overflow-hidden rounded-2xl p-5 shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-bingo-felt/55">
          Mesa
        </p>
        <h2 className="font-bingo text-2xl text-[var(--bingo-felt)]">
          Jugadores
          {rows.length ? ` (${rows.length - queued})` : ""}
        </h2>
        {list}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border-2 border-bingo-felt/25 px-4 py-2.5 font-semibold text-[var(--bingo-felt)] transition hover:bg-white/50"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
