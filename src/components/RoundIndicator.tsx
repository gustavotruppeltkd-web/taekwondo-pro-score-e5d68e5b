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
              "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center",
              "font-bold text-sm md:text-base border-2 transition-all duration-300",
              // Winner colors
              result === 'chung' && "bg-chung border-chung-dark text-white",
              result === 'hong' && "bg-hong border-hong-dark text-white",
              // Current round
              !result && isCurrent && isResting && "bg-primary/50 border-primary text-primary-foreground animate-pulse-glow",
              !result && isCurrent && !isResting && "bg-primary border-primary text-primary-foreground",
              // Future rounds
              !result && !isCurrent && "bg-muted border-muted-foreground/30 text-muted-foreground"
            )}
          >
            {roundNumber}
          </div>
        );
      })}
    </div>
  );
};
