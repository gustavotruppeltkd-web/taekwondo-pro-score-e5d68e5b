import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Settings, Gamepad2 } from "lucide-react";

interface TimerPanelProps {
  timeRemaining: number;
  currentRound: number;
  totalRounds: number;
  isRunning: boolean;
  isResting: boolean;
  matchEnded: boolean;
  winner: 'chung' | 'hong' | null;
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
  winner,
  gamepadConnected,
  onToggleTimer,
  onResetRound,
  onOpenSettings,
  onOpenGamepad,
}: TimerPanelProps) => {
  const isWarning = timeRemaining <= 30 && timeRemaining > 10;
  const isDanger = timeRemaining <= 10;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
      {/* Match Ended Overlay */}
      {matchEnded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "text-3xl md:text-5xl font-bold uppercase px-6 py-3 rounded-lg",
            winner === 'chung' ? "bg-chung text-white" : 
            winner === 'hong' ? "bg-hong text-white" : 
            "bg-muted text-foreground"
          )}>
            {winner ? `${winner === 'chung' ? 'CHUNG' : 'HONG'} WINS!` : 'DRAW'}
          </div>
        </div>
      )}

      {/* Timer Container */}
      <div className={cn(
        "bg-background/95 rounded-2xl p-4 md:p-8 scoreboard-shadow",
        "border-4 border-muted flex flex-col items-center",
        matchEnded && "opacity-30"
      )}>
        {/* Round Indicator */}
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          {Array.from({ length: totalRounds }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg",
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
          <div className="text-primary font-bold text-lg md:text-2xl uppercase tracking-wider mb-2 animate-pulse">
            REST
          </div>
        )}

        {/* Main Timer */}
        <div
          className={cn(
            "font-digital text-5xl md:text-8xl lg:text-9xl font-bold leading-none",
            isDanger ? "text-timer-danger text-glow-danger" :
            isWarning ? "text-timer-warning text-glow-warning" :
            "text-timer text-glow-timer"
          )}
        >
          {formatTime(timeRemaining)}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6">
          <button
            onClick={onToggleTimer}
            disabled={matchEnded}
            className={cn(
              "p-3 md:p-4 rounded-full",
              "bg-primary hover:bg-primary/80 text-primary-foreground",
              "transition-all duration-200 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isRunning ? <Pause className="w-5 h-5 md:w-7 md:h-7" /> : <Play className="w-5 h-5 md:w-7 md:h-7" />}
          </button>
          
          <button
            onClick={onResetRound}
            className={cn(
              "p-3 md:p-4 rounded-full",
              "bg-muted hover:bg-muted-foreground/20 text-foreground",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <RotateCcw className="w-5 h-5 md:w-7 md:h-7" />
          </button>

          <button
            onClick={onOpenSettings}
            className={cn(
              "p-3 md:p-4 rounded-full",
              "bg-muted hover:bg-muted-foreground/20 text-foreground",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <Settings className="w-5 h-5 md:w-7 md:h-7" />
          </button>

          <button
            onClick={onOpenGamepad}
            className={cn(
              "p-3 md:p-4 rounded-full relative",
              "bg-muted hover:bg-muted-foreground/20 text-foreground",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <Gamepad2 className="w-5 h-5 md:w-7 md:h-7" />
            {gamepadConnected && (
              <span className="absolute top-1 right-1 w-2 h-2 md:w-3 md:h-3 bg-timer rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
