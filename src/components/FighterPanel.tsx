import { cn } from "@/lib/utils";
import { Minus, CopyPlus } from "lucide-react";
import { PointHistorySidebar, PointEntry } from "./PointHistorySidebar";

interface FighterPanelProps {
  side: 'chung' | 'hong';
  name: string;
  score: number;
  opponentScore: number;
  gamjeom: number;
  roundsWon: number;
  roundsToWin: number;
  isSubtractMode: boolean;
  pointHistory: PointEntry[];
  isWinningByTiebreaker?: boolean;
  onAddPoints: (points: number) => void;
  onAddGamjeom: () => void;
  onDoubleLastPoint: () => void;
<<<<<<< HEAD
  canDouble?: boolean;
=======
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
  animateScore?: boolean;
  disabled?: boolean;
}

export const FighterPanel = ({
  side,
  name,
  score,
  opponentScore,
  gamjeom,
  roundsWon,
  roundsToWin,
  isSubtractMode,
  pointHistory,
  onAddPoints,
  onAddGamjeom,
  isWinningByTiebreaker = false,
  onDoubleLastPoint,
<<<<<<< HEAD
  canDouble = false,
=======
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
  animateScore = false,
  disabled = false,
}: FighterPanelProps) => {
  const isChung = side === 'chung';
  const isWinning = score > opponentScore || (score === opponentScore && isWinningByTiebreaker);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden",
        isChung ? "bg-chung-gradient" : "bg-hong-gradient",
        disabled && "opacity-80"
      )}
    >
      {/* Point History Sidebar */}
      <PointHistorySidebar side={side} history={pointHistory} />

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

      {/* Fighter Name - Extra Large */}
      <div className="absolute top-10 md:top-14 left-0 right-0 text-center">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-widest text-white/95 truncate px-4 drop-shadow-lg">
          {name}
        </h2>
        <p className="text-base md:text-lg text-white/60 font-medium mt-1">
          {isChung ? 'CHUNG' : 'HONG'}
        </p>
      </div>

      {/* Subtract Mode Indicator */}
      {isSubtractMode && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-pulse z-20">
          <div className="bg-gamjeom text-black font-bold text-lg md:text-xl px-4 py-2 rounded-full flex items-center gap-2">
            <Minus className="w-5 h-5" />
            MODO CORREÇÃO
          </div>
        </div>
      )}

      {/* Main Score */}
      <div className={cn(
        "flex flex-col items-center justify-center flex-1",
        isChung ? "-translate-x-4 md:-translate-x-8 lg:-translate-x-12" : "translate-x-4 md:translate-x-8 lg:translate-x-12"
      )}>
        <div
          className={cn(
            "font-digital text-[8rem] md:text-[14rem] lg:text-[18rem] font-bold leading-none",
            isWinning ? "text-glow-winning" : (isChung ? "text-glow-chung" : "text-glow-hong"),
            isWinning ? "text-winning" : "text-white",
            animateScore && "animate-score-pop"
          )}
        >
          {score.toString().padStart(2, '0')}
        </div>

        {/* Gamjeom Counter - Extra large, no label */}
        <div className="flex items-center justify-center mt-8 md:mt-12">
<<<<<<< HEAD
          <span
=======
          <span 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
            className={cn(
              "font-digital text-gamjeom text-6xl md:text-7xl lg:text-8xl font-bold",
              isSubtractMode && "ring-4 ring-gamjeom rounded-lg px-4 animate-pulse"
            )}
          >
            {gamjeom}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 px-4">
        <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
          {[1, 2, 3].map((points) => (
            <button
              key={points}
              onClick={() => onAddPoints(points)}
              disabled={disabled}
              className={cn(
                "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
                "transition-all duration-200 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isSubtractMode
                  ? "bg-gamjeom/80 hover:bg-gamjeom text-black border-2 border-gamjeom"
                  : "bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
              )}
            >
              {isSubtractMode ? `-${points}` : `+${points}`}
            </button>
          ))}
          <button
            onClick={onDoubleLastPoint}
<<<<<<< HEAD
            disabled={disabled || isSubtractMode || !canDouble}
=======
            disabled={disabled || isSubtractMode}
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "transition-all duration-200 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
            )}
          >
            <CopyPlus className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={onAddGamjeom}
            disabled={disabled}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "transition-all duration-200 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isSubtractMode
                ? "bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
                : "bg-gamjeom/80 hover:bg-gamjeom text-black border-2 border-gamjeom"
            )}
          >
            {isSubtractMode ? '-F' : '+F'}
          </button>
        </div>
      </div>
    </div>
  );
};
