import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Settings, Gamepad2 } from "lucide-react";

interface TimerPanelProps {
  timeRemaining: number;
  currentRound: number;
  totalRounds: number;
  isRunning: boolean;
  isResting: boolean;
  matchEnded: boolean;
  matchWinner: 'chung' | 'hong' | null;
  gamepadConnected: boolean;
  onToggleTimer: () => void;
  onResetRound: () => void;
  onOpenSettings: () => void;
  onOpenGamepad: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const TimerPanel = ({
  timeRemaining,
  currentRound,
  totalRounds,
  isRunning,
  isResting,
  matchEnded,
  matchWinner,
  gamepadConnected,
  onToggleTimer,
  onResetRound,
  onOpenSettings,
  onOpenGamepad,
}: TimerPanelProps) => {
  const isWarning = timeRemaining <= 30 && timeRemaining > 10;
  const isDanger = timeRemaining <= 10;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center mt-8 md:mt-12">
      {/* Match Ended Overlay */}
      {matchEnded && (
        <div className="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2">
          <div className={cn(
            "text-2xl md:text-4xl font-bold uppercase px-6 py-3 rounded-lg whitespace-nowrap",
            matchWinner === 'chung' ? "bg-chung text-white" : 
            matchWinner === 'hong' ? "bg-hong text-white" : 
            "bg-muted text-foreground"
          )}>
            {matchWinner ? `VENCEDOR: ${matchWinner === 'chung' ? 'CHUNG' : 'HONG'}` : 'EMPATE'}
          </div>
        </div>
      )}

      {/* Timer Container */}
      <div className={cn(
        "bg-background/95 rounded-2xl p-3 md:p-6 scoreboard-shadow",
        "border-4 border-muted flex flex-col items-center",
        matchEnded && "opacity-50"
      )}>
        {/* Round Indicator */}
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          {Array.from({ length: totalRounds }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-5 h-5 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm",
                i + 1 === currentRound
                  ? isResting 
                    ? "bg-primary text-primary-foreground animate-pulse-glow" 
                    : "bg-primary text-primary-foreground"
                  : i + 1 < currentRound
                  ? "bg-muted-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              R{i + 1}
            </div>
          ))}
        </div>

        {/* Rest Indicator */}
        {isResting && (
          <div className="text-primary font-bold text-base md:text-xl uppercase tracking-wider mb-1 animate-pulse">
            DESCANSO
          </div>
        )}

        {/* Main Timer */}
        <div
          className={cn(
            "font-digital text-4xl md:text-6xl lg:text-7xl font-bold leading-none",
            isDanger ? "text-timer-danger text-glow-danger" :
            isWarning ? "text-timer-warning text-glow-warning" :
            "text-timer text-glow-timer"
          )}
        >
          {formatTime(timeRemaining)}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4">
          <button
            onClick={onToggleTimer}
            disabled={matchEnded}
            className={cn(
              "p-2 md:p-3 rounded-full",
              "bg-primary hover:bg-primary/80 text-primary-foreground",
              "transition-all duration-200 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isRunning ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          
          <button
            onClick={onResetRound}
            className={cn(
              "p-2 md:p-3 rounded-full",
              "bg-muted hover:bg-muted-foreground/20 text-foreground",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            className={cn(
              "p-2 md:p-3 rounded-full",
              "bg-muted hover:bg-muted-foreground/20 text-foreground",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={onOpenGamepad}
            className={cn(
              "p-2 md:p-3 rounded-full relative",
              "bg-muted hover:bg-muted-foreground/20 text-foreground",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <Gamepad2 className="w-4 h-4 md:w-5 md:h-5" />
            {gamepadConnected && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-timer rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
