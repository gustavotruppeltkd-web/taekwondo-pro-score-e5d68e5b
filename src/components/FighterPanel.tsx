import { cn } from "@/lib/utils";

interface FighterPanelProps {
  side: 'chung' | 'hong';
  name: string;
  score: number;
  gamjeom: number;
  onAddPoints: (points: number) => void;
  onAddGamjeom: () => void;
  animateScore?: boolean;
}

export const FighterPanel = ({
  side,
  name,
  score,
  gamjeom,
  onAddPoints,
  onAddGamjeom,
  animateScore = false,
}: FighterPanelProps) => {
  const isChung = side === 'chung';

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden",
        isChung ? "bg-chung-gradient" : "bg-hong-gradient"
      )}
    >
      {/* Fighter Name */}
      <div className="absolute top-4 md:top-8 left-0 right-0 text-center">
        <h2 className="text-xl md:text-3xl font-bold uppercase tracking-widest text-white/90">
          {name}
        </h2>
        <p className="text-sm md:text-lg text-white/60 font-medium">
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

        {/* Gamjeom Counter */}
        <div className="flex items-center gap-2 mt-2 md:mt-4">
          <span className="text-gamjeom font-bold text-lg md:text-2xl">G:</span>
          <span className="font-digital text-gamjeom text-2xl md:text-4xl font-bold">
            {gamjeom}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 px-4">
        <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
          <button
            onClick={() => onAddPoints(1)}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "bg-white/20 hover:bg-white/30 text-white",
              "transition-all duration-200 active:scale-95",
              "border-2 border-white/30"
            )}
          >
            +1
          </button>
          <button
            onClick={() => onAddPoints(2)}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "bg-white/20 hover:bg-white/30 text-white",
              "transition-all duration-200 active:scale-95",
              "border-2 border-white/30"
            )}
          >
            +2
          </button>
          <button
            onClick={() => onAddPoints(3)}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "bg-white/20 hover:bg-white/30 text-white",
              "transition-all duration-200 active:scale-95",
              "border-2 border-white/30"
            )}
          >
            +3
          </button>
          <button
            onClick={onAddGamjeom}
            className={cn(
              "px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-lg md:text-xl",
              "bg-gamjeom/80 hover:bg-gamjeom text-black",
              "transition-all duration-200 active:scale-95",
              "border-2 border-gamjeom"
            )}
          >
            G
          </button>
        </div>
      </div>
    </div>
  );
};
