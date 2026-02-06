import { cn } from "@/lib/utils";
import { Minus } from "lucide-react";
import { PointHistorySidebar, PointEntry } from "./PointHistorySidebar";

interface FighterPanelProps {
  side: 'chung' | 'hong';
  name: string;
  score: number;
  gamjeom: number;
  roundsWon: number;
  roundsToWin: number;
  isSubtractMode: boolean;
  pointHistory: PointEntry[];
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
  isSubtractMode,
  pointHistory,
  onAddPoints,
  onAddGamjeom,
  animateScore = false,
  disabled = false,
}: FighterPanelProps) => {
  const isChung = side === 'chung';

  return (
    <div
      className={cn(
        "h-full flex flex-col items-center justify-center p-2 md:p-4 lg:p-8 relative overflow-hidden",
        isChung ? "bg-chung-gradient" : "bg-hong-gradient",
        disabled && "opacity-80"
      )}
    >
      {/* Point History Sidebar */}
      <PointHistorySidebar side={side} history={pointHistory} />

      {/* Rounds Won Indicator */}
      <div className="absolute top-2 md:top-4 left-0 right-0 flex justify-center gap-1 md:gap-2">
        {Array.from({ length: roundsToWin }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 md:w-5 md:h-5 rounded-full border-2",
              i < roundsWon
                ? "bg-white border-white"
                : "bg-transparent border-white/50"
            )}
          />
        ))}
      </div>

      {/* Fighter Name - Hidden on small screens */}
      <div className="absolute top-8 md:top-14 left-0 right-0 text-center hidden md:block">
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
          <div className="bg-gamjeom text-black font-bold text-xs md:text-xl px-2 md:px-4 py-1 md:py-2 rounded-full flex items-center gap-1 md:gap-2 whitespace-nowrap">
            <Minus className="w-3 h-3 md:w-5 md:h-5" />
            <span className="hidden md:inline">MODO CORREÇÃO</span>
            <span className="md:hidden">CORREÇÃO</span>
          </div>
        </div>
      )}

      {/* Main Score */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div
          className={cn(
            "font-digital font-bold leading-none",
            "text-white",
            isChung ? "text-glow-chung" : "text-glow-hong",
            animateScore && "animate-score-pop"
          )}
          style={{ fontSize: 'clamp(4rem, 14vw, 18rem)' }}
        >
          {score.toString().padStart(2, '0')}
        </div>

        {/* Gamjeom Counter */}
        <div className="flex items-center justify-center mt-4 md:mt-12">
          <span 
            className={cn(
              "font-digital text-gamjeom font-bold",
              isSubtractMode && "ring-4 ring-gamjeom rounded-lg px-4 animate-pulse"
            )}
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}
          >
            {gamjeom}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="w-full px-1 md:px-4 pb-2 md:pb-8">
        <div className="flex justify-center gap-1 md:gap-4 flex-wrap">
          {[1, 2, 3].map((points) => (
            <button
              key={points}
              onClick={() => onAddPoints(points)}
              disabled={disabled}
              className={cn(
                "px-2 py-1.5 md:px-6 md:py-3 rounded-lg font-bold text-sm md:text-xl",
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
            onClick={onAddGamjeom}
            disabled={disabled}
            className={cn(
              "px-2 py-1.5 md:px-6 md:py-3 rounded-lg font-bold text-sm md:text-xl",
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
