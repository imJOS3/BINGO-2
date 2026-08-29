import { useEffect, useState } from "preact/hooks";
import useBingoCardStore from "../../../../../store/bingoCardStore";
import useAuthStore from "../../../../../store/authStore";
import useGameStore from "../../../../../store/gameStore";

const LETTERS = ["B", "I", "N", "G", "O"];
const HEADER = {
  B: "bg-[var(--bingo-red)]",
  I: "bg-[#1f8a5a]",
  N: "bg-[#1d6fb8]",
  G: "bg-[var(--bingo-amber)] text-[var(--bingo-ink)]",
  O: "bg-[#d97706]",
};

export default function BingoCard({ compact = false }) {
  const { userInfo } = useAuthStore();
  const { selectedGame } = useGameStore();
  const {
    generateAndSaveCard,
    selectedCard,
    fetchCardsByUserAndGame,
    updateCardByUserAndGame,
    loading,
  } = useBingoCardStore();

  const [isCardLoaded, setIsCardLoaded] = useState(false);
  const [reshuffling, setReshuffling] = useState(false);

  useEffect(() => {
    const loadCard = async () => {
      if (userInfo && selectedGame && !isCardLoaded) {
        const existing = await fetchCardsByUserAndGame(
          userInfo.id,
          selectedGame.id
        );
        if (!existing) {
          await generateAndSaveCard(userInfo.id, selectedGame.id);
        }
        setIsCardLoaded(true);
      }
    };
    loadCard();
  }, [userInfo, selectedGame, isCardLoaded]);

  const handleUpdateCard = async () => {
    if (!userInfo || !selectedGame || !selectedCard) return;
    setReshuffling(true);
    try {
      await updateCardByUserAndGame(userInfo.id, selectedGame.id);
    } finally {
      setReshuffling(false);
    }
  };

  const gap = compact ? "gap-1" : "gap-1.5 sm:gap-2";
  const cellBase = compact
    ? "flex min-h-0 items-center justify-center rounded-md text-sm font-bold"
    : "flex aspect-square items-center justify-center rounded-lg text-sm font-bold sm:text-lg";

  return (
    <div
      className={`relative mx-auto w-full max-w-md ${
        compact ? "flex h-full min-h-0 flex-col" : ""
      }`}
    >
      <div
        className={`rounded-2xl bg-[var(--bingo-felt-light)] shadow-[6px_6px_0_rgba(6,40,32,0.35)] ${
          compact ? "flex min-h-0 flex-1 flex-col p-2" : "p-3 sm:p-4"
        }`}
      >
        <div className={`grid grid-cols-5 ${gap} ${compact ? "h-[16%] shrink-0" : "mb-2"}`}>
          {LETTERS.map((letter) => (
            <div
              key={letter}
              className={`${cellBase} font-bingo text-white ${HEADER[letter]}`}
            >
              {letter}
            </div>
          ))}
        </div>

        {loading && !selectedCard ? (
          <p className="flex flex-1 items-center justify-center py-6 text-center text-sm font-semibold text-white/80">
            Preparando cartón...
          </p>
        ) : selectedCard ? (
          <div
            className={`grid grid-cols-5 grid-rows-5 ${gap} ${
              compact ? "min-h-0 flex-1" : ""
            }`}
          >
            {Array.from({ length: 5 }).flatMap((_, rowIndex) =>
              LETTERS.map((letter) => {
                const numbers = selectedCard.numbers[letter] || [];
                const isFree = letter === "N" && rowIndex === 2;
                return (
                  <div
                    key={`${letter}-${rowIndex}`}
                    className={`${cellBase} bg-[#1a2744] text-white`}
                  >
                    {isFree ? (
                      <span className="font-bingo text-[0.55rem] text-[var(--bingo-amber)] sm:text-xs">
                        FREE
                      </span>
                    ) : (
                      numbers[rowIndex] || ""
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <p className="flex flex-1 items-center justify-center py-6 text-center text-sm text-white/80">
            No hay cartón todavía.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleUpdateCard}
        disabled={reshuffling || !selectedCard}
        className={`absolute flex items-center justify-center rounded-xl bg-[var(--bingo-red)] font-bingo text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:opacity-50 ${
          compact
            ? "-bottom-2 -right-1 h-10 w-10 text-xl"
            : "-bottom-3 -right-2 h-12 w-12 text-2xl"
        }`}
        aria-label="Cambiar cartón"
        title="Nuevo cartón"
      >
        {reshuffling ? "…" : "+"}
      </button>
    </div>
  );
}
