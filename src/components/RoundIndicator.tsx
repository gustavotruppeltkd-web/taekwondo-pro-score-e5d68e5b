import { cn } from "@/lib/utils";

interface RoundIndicatorProps {
  totalRounds: number;
  currentRound: number;
  roundResults: Array<'chung' | 'hong' | null>;
  isResting: boolean;
}

export const RoundIndicator = ({
  totalRounds,
  currentRound,
  roundResults,
  isResting,
}: RoundIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
      {Array.from({ length: totalRounds }, (_, i) => {
        const roundNumber = i + 1;
        const result = roundResults[i];
        const isCurrent = roundNumber === currentRound;
        
        return (
          <div
            key={i}
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center",
              "font-bold text-sm md:text-base transition-all duration-300",
              // Winner colors - fully filled circle
              result === 'chung' && "bg-chung text-white shadow-lg shadow-chung/50",
              result === 'hong' && "bg-hong text-white shadow-lg shadow-hong/50",
              // Current round
              !result && isCurrent && isResting && "bg-primary/50 text-primary-foreground animate-pulse-glow border-2 border-primary",
              !result && isCurrent && !isResting && "bg-primary text-primary-foreground border-2 border-primary",
              // Future rounds
              !result && !isCurrent && "bg-muted/50 text-muted-foreground border-2 border-muted-foreground/30"
            )}
          >
            R{roundNumber}
          </div>
        );
      })}
    </div>
  );
};
