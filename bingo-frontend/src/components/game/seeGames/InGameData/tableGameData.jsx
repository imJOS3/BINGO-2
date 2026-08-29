import useGameStore from "../../../../../store/gameStore";
import usePresenceStore from "../../../../../store/presenceStore";
import GameMode from "../../scenery/gameData/gameMode";

const STATUS_LABEL = {
  active: "En espera",
  in_progress: "En juego",
  completed: "Finalizada",
};

export default function TableGameData() {
  const { selectedGame } = useGameStore();
  const onlineCount = usePresenceStore((s) => s.onlineCount);

  if (!selectedGame) {
    return (
      <p className="rounded-xl bg-white/10 px-3 py-2 text-center text-sm text-white/70">
        Cargando detalles de la mesa...
      </p>
    );
  }

  const isPublic = selectedGame.is_public !== false;

  const copyCode = async () => {
    if (!selectedGame.room_code) return;
    try {
      await navigator.clipboard.writeText(selectedGame.room_code);
    } catch {
      /* ignore */
    }
  };

  const chips = [
    {
      label: "Código",
      value: selectedGame.room_code || "—",
      copyable: Boolean(selectedGame.room_code),
    },
    {
      label: "Estado",
      value: STATUS_LABEL[selectedGame.game_status] || selectedGame.game_status,
    },
    {
      label: "Visibilidad",
      value: isPublic ? "Pública" : "Privada",
    },
    {
      label: "Jugadores",
      value: Math.max(onlineCount, 1),
    },
  ];

  return (
    <div className="rounded-2xl border border-bingo-felt/20 bg-[var(--bingo-paper)] p-3 shadow-[4px_4px_0_rgba(6,40,32,0.3)]">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--bingo-felt-light)]">
            Mesa
          </p>
          <h2 className="truncate font-bingo text-xl leading-none text-[var(--bingo-felt)] sm:text-2xl">
            {selectedGame.game_name || "Partida"}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip) =>
              chip.copyable ? (
                <button
                  key={chip.label}
                  type="button"
                  onClick={copyCode}
                  title="Copiar código"
                  className="rounded-md bg-bingo-felt/10 px-2 py-1 text-left"
                >
                  <span className="block text-[0.55rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                    {chip.label}
                  </span>
                  <span className="font-bingo text-xs tracking-[0.12em] text-[var(--bingo-felt)]">
                    {chip.value}
                  </span>
                </button>
              ) : (
                <div
                  key={chip.label}
                  className="rounded-md bg-bingo-felt/8 px-2 py-1"
                >
                  <span className="block text-[0.55rem] font-bold uppercase tracking-wide text-bingo-felt/55">
                    {chip.label}
                  </span>
                  <span className="text-xs font-semibold text-[var(--bingo-ink)]">
                    {chip.value}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
        <div className="shrink-0">
          <GameMode
            gameModeId={selectedGame.game_mode_id}
            pattern={selectedGame.win_pattern}
            size="sm"
            showLabel={false}
            tone="light"
            className="w-auto gap-1"
          />
        </div>
      </div>
    </div>
  );
}
