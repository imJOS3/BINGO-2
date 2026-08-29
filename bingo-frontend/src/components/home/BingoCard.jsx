const letters = ["B", "I", "N", "G", "O"];
const headerColors = [
  "bg-[#1e5aab]",
  "bg-[var(--bingo-red)]",
  "bg-[#2f2f2f]",
  "bg-[#1f8a4c]",
  "bg-[var(--bingo-amber)]",
];

export default function BingoCard({ bingoCard }) {
  return (
    <div className="w-full max-w-[22rem] sm:max-w-md">
      <div className="relative rotate-1 rounded-2xl border-[3px] border-white/90 bg-[#f7fbf8] p-3 shadow-[8px_8px_0_rgba(0,0,0,0.28)] sm:rotate-2 sm:p-4">
        <div className="mb-3 flex items-end justify-between px-1">
          <p className="font-bingo text-xs tracking-widest text-bingo-felt/55">CARTÓN</p>
          <p className="font-bingo text-lg leading-none text-[var(--bingo-red)]">BINGO</p>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {bingoCard.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1.5 sm:gap-2">
              <div
                className={`flex h-8 items-center justify-center rounded-md font-bingo text-sm text-white sm:h-9 sm:text-base ${headerColors[colIndex]} ${
                  colIndex === 4 ? "text-[var(--bingo-ink)]" : ""
                }`}
              >
                {letters[colIndex]}
              </div>
              {column.map((num, rowIndex) => {
                const isFree = colIndex === 2 && rowIndex === 2;
                return (
                  <div
                    key={rowIndex}
                    className={`flex aspect-square items-center justify-center rounded-md border-2 border-bingo-felt/15 text-sm font-bold sm:text-lg ${
                      isFree
                        ? "bg-bingo-amber/90 font-bingo text-[0.65rem] text-[var(--bingo-ink)] sm:text-xs"
                        : "bg-white text-[var(--bingo-ink)]"
                    }`}
                  >
                    {isFree ? "FREE" : num}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute -bottom-3 -right-3 h-10 w-10 rounded-full border-4 border-white bg-[var(--bingo-red)] opacity-90 sm:h-12 sm:w-12" />
      </div>
    </div>
  );
}
