import { useState, useEffect, useRef } from "preact/hooks";
import useBingoCardStore from "../../../../../store/bingoCardStore";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import useAuthStore from "../../../../../store/authStore";
import useGameStore from "../../../../../store/gameStore";
import useUsersGame from "../../../../../store/usersGame";
import { getRemainingSeconds } from "../chronometer/chronometer";

const LETTERS = ["B", "I", "N", "G", "O"];
const LAST_CALL_SECONDS = 60;
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
  const eliminatedGameId = useUsersGame((s) => s.eliminatedGameId);
  const setEliminatedSeat = useUsersGame((s) => s.setEliminatedSeat);
  const { calledNumbers } = useCalledNumbersStore();
  const [selectedNumbers, setSelectedNumbers] = useState({});
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  const [freeSelected, setFreeSelected] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(selectedGame));
  const claimingRef = useRef(false);
  const marksLoadedRef = useRef(false);

  const isEliminated =
    eliminatedGameId != null && String(eliminatedGameId) === String(gameId);
  const isLastCall =
    selectedGame?.game_status === "in_progress" &&
    remaining > 0 &&
    remaining <= LAST_CALL_SECONDS;

  useEffect(() => {
    setSelectedNumbers({});
    setFreeSelected(false);
    setAnimatedNumbers({});
    setClaimError("");
  }, [gameId, selectedGame?.started_at]);

  useEffect(() => {
    if (winner || selectedGame?.game_status === "completed") return;
    const tick = () => setRemaining(getRemainingSeconds(selectedGame));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [
    winner,
    selectedGame?.id,
    selectedGame?.game_time,
    selectedGame?.started_at,
    selectedGame?.game_status,
  ]);

  useEffect(() => {
    const loadCard = async () => {
      if (!userInfo?.id || !gameId) return;
      if (selectedGame?.game_status === "completed" && marksLoadedRef.current) return;

      marksLoadedRef.current = false;
      claimingRef.current = false;
      setAnimatedNumbers({});
      setClaimError("");

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
    if (!userInfo?.id || !gameId || !marksLoadedRef.current || isEliminated) return;
    saveMarkedNumbers(userInfo.id, gameId, marks);
  };

  const handleClaimBingo = async () => {
    if (
      claimingRef.current ||
      winner ||
      isEliminated ||
      selectedGame?.game_status === "completed"
    ) {
      return;
    }
    if (!userInfo?.id || !gameId) return;

    claimingRef.current = true;
    setClaimError("");

    const result = await claimWin(gameId, userInfo.id, userInfo.nickname);
    if (!result.ok) {
      claimingRef.current = false;
      setClaimError(result.message || "No se pudo cantar bingo");
      if (result.eliminated) setEliminatedSeat(gameId);
      return;
    }

    setFreeSelected(true);
    const marks = { ...selectedNumbers, __free: true };
    setSelectedNumbers(marks);
    persistMarks(marks);
  };

  const handleNumberClick = (letter, index) => {
    if (winner || isEliminated || selectedGame?.game_status === "completed") return;

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

  if (isEliminated) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--bingo-red)]/40 bg-black/40 p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bingo-red)]">
          Bingo o nada
        </p>
        <h3 className="font-bingo text-2xl text-white">Fuera de la ronda</h3>
        <p className="max-w-xs text-sm text-white/70">
          Cantaste un bingo falso en el último minuto. Puedes seguir mirando la mesa,
          pero no entras en la ruleta de consolación.
        </p>
      </div>
    );
  }

  return (
    <div className="bingo-card-stage">
      <div className="bingo-card-fill flex flex-col gap-2">
        {isLastCall && (
          <div className="shrink-0 rounded-xl border border-[var(--bingo-red)]/50 bg-[var(--bingo-red)]/15 px-3 py-2 text-center">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--bingo-red)]">
              Bingo o nada — último minuto
            </p>
            <p className="text-xs text-white/75">
              Si cantas bingo sin tener la figura, quedas fuera del sorteo.
            </p>
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-5 gap-1.5 rounded-2xl bg-[var(--bingo-felt-light)] p-2 shadow-[6px_6px_0_rgba(6,40,32,0.35)] sm:gap-2 sm:p-3">
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
                    <div
                      key="free-space"
                      className={`relative flex min-h-0 items-center justify-center rounded-lg text-[0.7rem] font-bingo shadow-inner sm:text-sm ${
                        freeSelected
                          ? "bg-[var(--bingo-red)] text-white"
                          : "bg-[#1a2744] text-[var(--bingo-amber)]"
                      }`}
                    >
                      {freeSelected && (
                        <span className="absolute h-[55%] w-[55%] rounded-full bg-[var(--bingo-red)] ring-2 ring-white/40" />
                      )}
                      <span className="relative z-10">FREE</span>
                    </div>
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
                    onClick={() => isCalled && handleNumberClick(letter, rowIndex)}
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

        <div className="shrink-0 space-y-1.5">
          <button
            type="button"
            onClick={handleClaimBingo}
            disabled={
              claimingRef.current ||
              winner ||
              selectedGame?.game_status === "completed"
            }
            className={`w-full rounded-xl px-4 py-3 font-bingo text-lg shadow-[0_4px_0_rgba(0,0,0,0.35)] transition hover:brightness-110 disabled:opacity-50 ${
              isLastCall
                ? "animate-pulse bg-[var(--bingo-red)] text-white shadow-[0_4px_0_#7a1c1c]"
                : "bg-[var(--bingo-amber)] text-[var(--bingo-ink)] shadow-[0_4px_0_rgba(0,0,0,0.25)]"
            }`}
          >
            ¡BINGO!
          </button>
          {claimError && (
            <p className="text-center text-xs font-semibold text-[var(--bingo-red)]">
              {claimError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
