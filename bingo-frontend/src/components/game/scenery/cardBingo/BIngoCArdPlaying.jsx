import { useState, useEffect, useRef } from "preact/hooks";
import useBingoCardStore from "../../../../../store/bingoCardStore";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import useAuthStore from "../../../../../store/authStore";
import useGameStore from "../../../../../store/gameStore";
import { checkBingoWin } from "../../../../utils/bingoWin";

const LETTERS = ["B", "I", "N", "G", "O"];
const HEADER = {
  B: "bg-[var(--bingo-red)]",
  I: "bg-[#1f8a5a]",
  N: "bg-[#1d6fb8]",
  G: "bg-[var(--bingo-amber)] text-[var(--bingo-ink)]",
  O: "bg-[#d97706]",
};

export default function BingoCardPlaying({ gameId }) {
  const {
    selectedCard,
    loading,
    fetchCardsByUserAndGame,
    generateAndSaveCard,
    saveMarkedNumbers,
  } = useBingoCardStore();
  const { userInfo } = useAuthStore();
  const { selectedGame, fetchGameById, claimWin, winner } = useGameStore();
  const { calledNumbers } = useCalledNumbersStore();
  const [selectedNumbers, setSelectedNumbers] = useState({});
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  const [freeSelected, setFreeSelected] = useState(false);
  const claimingRef = useRef(false);
  const marksLoadedRef = useRef(false);

  useEffect(() => {
    setSelectedNumbers({});
    setFreeSelected(false);
    setAnimatedNumbers({});
  }, [gameId, selectedGame?.started_at]);

  useEffect(() => {
    const loadCard = async () => {
      if (!userInfo?.id || !gameId) return;
      if (selectedGame?.game_status === "completed" && marksLoadedRef.current) return;

      marksLoadedRef.current = false;
      claimingRef.current = false;
      setAnimatedNumbers({});

      if (!selectedGame || String(selectedGame.id) !== String(gameId)) {
        await fetchGameById(gameId);
      }

      let card = await fetchCardsByUserAndGame(userInfo.id, gameId);
      if (!card) {
        card = await generateAndSaveCard(userInfo.id, gameId);
      }

      const marks =
        card?.marked_numbers && typeof card.marked_numbers === "object"
          ? card.marked_numbers
          : {};
      setSelectedNumbers(marks);
      setFreeSelected(!!marks.__free);
      claimingRef.current = false;
      marksLoadedRef.current = true;
    };
    loadCard();
  }, [
    userInfo?.id,
    gameId,
    selectedGame?.game_status,
    selectedGame?.game_mode_id,
    selectedGame?.started_at,
  ]);

  const persistMarks = (marks) => {
    if (!userInfo?.id || !gameId || !marksLoadedRef.current) return;
    saveMarkedNumbers(userInfo.id, gameId, marks);
  };

  const declareWinner = async () => {
    if (claimingRef.current || winner || selectedGame?.game_status === "completed")
      return;
    if (!userInfo?.id || !gameId) return;

    claimingRef.current = true;
    try {
      await claimWin(gameId, userInfo.id, userInfo.nickname);
      setFreeSelected(true);
      const marks = { ...selectedNumbers, __free: true };
      setSelectedNumbers(marks);
      persistMarks(marks);
    } catch (error) {
      console.error("Error al declarar ganador:", error);
      claimingRef.current = false;
    }
  };

  const handleNumberClick = (letter, index) => {
    if (winner || selectedGame?.game_status === "completed") return;

    const number = selectedCard.numbers[letter][index];
    const key = `${letter}-${number}`;

    setSelectedNumbers((prev) => {
      const next = { ...prev, [key]: true };
      persistMarks(next);
      return next;
    });

    setAnimatedNumbers((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const handleFreeClick = () => {
    if (!freeSelected) {
      setFreeSelected(true);
      declareWinner();
    }
  };

  const isNumberCalled = (letter, number) =>
    calledNumbers.some(
      (called) => called.letter === letter && called.number === number
    );

  useEffect(() => {
    if (!selectedCard) return;
    const nextAnim = { ...animatedNumbers };
    LETTERS.forEach((letter) => {
      selectedCard.numbers[letter].forEach((number) => {
        const key = `${letter}-${number}`;
        if (isNumberCalled(letter, number) && !selectedNumbers[key]) {
          nextAnim[key] = true;
        }
      });
    });
    setAnimatedNumbers(nextAnim);
  }, [calledNumbers, selectedCard, selectedNumbers]);

  const isBingoComplete = checkBingoWin(
    selectedCard,
    selectedNumbers,
    selectedGame?.game_mode_id,
    selectedGame?.win_pattern
  );

  useEffect(() => {
    if (isBingoComplete && marksLoadedRef.current) {
      declareWinner();
    }
  }, [isBingoComplete, selectedNumbers]);

  if (loading && !selectedCard) {
    return (
      <p className="rounded-xl bg-white/10 px-4 py-6 text-center text-sm text-white/75">
        Cargando cartón...
      </p>
    );
  }

  if (!selectedCard) {
    return (
      <p className="rounded-xl bg-white/10 px-4 py-6 text-center text-sm text-white/75">
        No hay cartón disponible.
      </p>
    );
  }

  return (
    <div className="bingo-card-stage">
      <div className="bingo-card-fill">
        <div className="grid h-full w-full grid-cols-5 gap-1.5 rounded-2xl bg-[var(--bingo-felt-light)] p-2 shadow-[6px_6px_0_rgba(6,40,32,0.35)] sm:gap-2 sm:p-3">
          {LETTERS.map((letter) => (
            <div key={letter} className="grid min-h-0 grid-rows-6 gap-1.5 sm:gap-2">
              <div
                className={`flex min-h-0 items-center justify-center rounded-lg font-bingo text-lg text-white sm:text-2xl ${HEADER[letter]}`}
              >
                {letter}
              </div>
              {Array.from({ length: 5 }).map((_, rowIndex) => {
                const numbers = selectedCard.numbers[letter] || [];
                const number = numbers[rowIndex];
                const key = `${letter}-${number}`;
                const isSelected = selectedNumbers[key];
                const isAnimating = animatedNumbers[key] && !isSelected;
                const isCalled = isNumberCalled(letter, number);

                if (letter === "N" && rowIndex === 2) {
                  return (
                    <button
                      type="button"
                      key="free-space"
                      className={`relative flex min-h-0 items-center justify-center rounded-lg text-[0.7rem] font-bingo shadow-inner sm:text-sm ${
                        freeSelected || isBingoComplete
                          ? "bg-[var(--bingo-red)] text-white"
                          : "bg-[#1a2744] text-[var(--bingo-amber)]"
                      }`}
                      onClick={isBingoComplete ? handleFreeClick : undefined}
                    >
                      {(freeSelected || isBingoComplete) && (
                        <span className="absolute h-[55%] w-[55%] rounded-full bg-[var(--bingo-red)] ring-2 ring-white/40" />
                      )}
                      <span className="relative z-10">FREE</span>
                    </button>
                  );
                }

                return (
                  <button
                    type="button"
                    key={`${letter}-${rowIndex}`}
                    disabled={!isCalled || isSelected}
                    className={`relative flex min-h-0 items-center justify-center rounded-lg bg-[#1a2744] text-lg font-bold text-white shadow-inner transition sm:text-2xl ${
                      isCalled && !isSelected
                        ? "cursor-pointer hover:brightness-125"
                        : "cursor-default"
                    }`}
                    onClick={() =>
                      isCalled && handleNumberClick(letter, rowIndex)
                    }
                  >
                    {isSelected ? (
                      <span className="absolute h-[58%] w-[58%] rounded-full bg-[var(--bingo-red)] shadow" />
                    ) : (
                      <span
                        className={
                          isAnimating
                            ? "animate-pulse scale-110 text-[var(--bingo-amber)]"
                            : ""
                        }
                      >
                        {number || ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
