import { cn } from "@/lib/utils";

interface FighterPanelProps {
  side: 'chung' | 'hong';
  name: string;
  score: number;
  gamjeom: number;
  roundsWon: number;
  roundsToWin: number;
  onAddPoints: (points: number) => void;
  onAddGamjeom: () => void;
  animateScore?: boolean;
  disabled?: boolean;
}

export const FighterPanel = ({
  side,
  name,
  score,
  gamjeom,
  roundsWon,
  roundsToWin,
  onAddPoints,
  onAddGamjeom,
  animateScore = false,
  disabled = false,
}: FighterPanelProps) => {
  const isChung = side === 'chung';

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden",
        isChung ? "bg-chung-gradient" : "bg-hong-gradient",
        disabled && "opacity-80"
      )}
    >
      {/* Rounds Won Indicator */}
      <div className="absolute top-2 md:top-4 left-0 right-0 flex justify-center gap-1.5 md:gap-2">
        {Array.from({ length: roundsToWin }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 md:w-5 md:h-5 rounded-full border-2",
              i < roundsWon
                ? "bg-white border-white"
                : "bg-transparent border-white/50"
            )}
          />
        ))}
      </div>

      {/* Fighter Name */}
      <div className="absolute top-10 md:top-14 left-0 right-0 text-center">
        <h2 className="text-lg md:text-2xl font-bold uppercase tracking-widest text-white/90 truncate px-4">
          {name}
        </h2>
        <p className="text-sm md:text-base text-white/60 font-medium">
          {isChung ? 'CHUNG' : 'HONG'}
        </p>
      </div>

      {/* Main Score */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div
          className={cn(
            "font-digital text-[8rem] md:text-[14rem] lg:text-[18rem] font-bold leading-none",
            "text-white",
            isChung ? "text-glow-chung" : "text-glow-hong",
            animateScore && "animate-score-pop"
          )}
        >
          {score.toString().padStart(2, '0')}
        </div>

        {/* Gamjeom Counter - Bigger and more spaced */}
        <div className="flex items-center gap-3 mt-6 md:mt-10">
          <span className="text-gamjeom font-bold text-3xl md:text-5xl">G:</span>
          <span className="font-digital text-gamjeom text-4xl md:text-6xl font-bold">
            {gamjeom}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 px-4">
        <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
          <button
            onClick={() => onAddPoints(1)}
            disabled={disabled}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "bg-white/20 hover:bg-white/30 text-white",
              "transition-all duration-200 active:scale-95",
              "border-2 border-white/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            +1
          </button>
          <button
            onClick={() => onAddPoints(2)}
            disabled={disabled}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "bg-white/20 hover:bg-white/30 text-white",
              "transition-all duration-200 active:scale-95",
              "border-2 border-white/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            +2
          </button>
          <button
            onClick={() => onAddPoints(3)}
            disabled={disabled}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "bg-white/20 hover:bg-white/30 text-white",
              "transition-all duration-200 active:scale-95",
              "border-2 border-white/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            +3
          </button>
          <button
            onClick={onAddGamjeom}
            disabled={disabled}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "bg-gamjeom/80 hover:bg-gamjeom text-black",
              "transition-all duration-200 active:scale-95",
              "border-2 border-gamjeom",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            G
          </button>
        </div>
      </div>
    </div>
  );
};
