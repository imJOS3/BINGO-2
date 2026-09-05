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

  return (
    <div
      className={`relative mx-auto w-full ${
        compact
          ? "max-w-[16.5rem] sm:max-w-[18rem] md:h-full md:min-h-0 md:max-w-md"
          : "max-w-md"
      }`}
    >
      <div
        className={`rounded-2xl bg-[var(--bingo-felt-light)] p-1.5 shadow-[6px_6px_0_rgba(6,40,32,0.35)] sm:p-3 ${
          compact
            ? "aspect-[5/6] md:aspect-auto md:flex md:h-full md:min-h-0 md:flex-col"
            : "aspect-[5/6]"
        }`}
      >
        {loading && !selectedCard ? (
          <p className="flex h-full items-center justify-center text-center text-sm font-semibold text-white/80">
            Preparando cartón...
          </p>
        ) : selectedCard ? (
          <div
            className={`grid h-full min-h-0 grid-cols-5 grid-rows-6 gap-0.5 sm:gap-1.5 ${
              compact ? "md:flex-1" : ""
            }`}
          >
            {LETTERS.map((letter) => (
              <div
                key={letter}
                className={`flex min-h-0 items-center justify-center rounded-md font-bingo text-sm text-white sm:rounded-lg sm:text-xl ${HEADER[letter]}`}
              >
                {letter}
              </div>
            ))}
            {Array.from({ length: 5 }).flatMap((_, rowIndex) =>
              LETTERS.map((letter) => {
                const numbers = selectedCard.numbers[letter] || [];
                const isFree = letter === "N" && rowIndex === 2;
                return (
                  <div
                    key={`${letter}-${rowIndex}`}
                    className="flex min-h-0 items-center justify-center rounded-md bg-[#1a2744] text-sm font-bold text-white sm:rounded-lg sm:text-lg"
                  >
                    {isFree ? (
                      <span className="font-bingo text-[0.6rem] text-[var(--bingo-amber)] sm:text-xs">
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
          <p className="flex h-full items-center justify-center text-center text-sm text-white/80">
            No hay cartón todavía.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleUpdateCard}
        disabled={reshuffling || !selectedCard}
        className="absolute bottom-1.5 right-1.5 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bingo-red)] font-bingo text-lg text-white shadow-[3px_3px_0_#7a1c1c] transition hover:brightness-110 disabled:opacity-50 sm:bottom-2 sm:right-2 sm:h-11 sm:w-11 sm:text-xl"
        aria-label="Cambiar cartón"
        title="Nuevo cartón"
      >
        {reshuffling ? "…" : "+"}
      </button>
    </div>
  );
}
