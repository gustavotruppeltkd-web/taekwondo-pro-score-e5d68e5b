import { useState } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw, Settings, Gamepad2, Minus, ChevronUp, ChevronDown, Undo2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundIndicator } from "./RoundIndicator";

interface TimerPanelProps {
  timeRemaining: number;
  currentRound: number;
  totalRounds: number;
  isRunning: boolean;
  isResting: boolean;
  matchEnded: boolean;
  matchWinner: 'chung' | 'hong' | null;
  gamepadConnected: boolean;
  isSubtractMode: boolean;
  roundResults: Array<'chung' | 'hong' | null>;
  winnerName?: string;
  canRevertRound?: boolean;
  onToggleTimer: () => void;
  onResetRound: () => void;
  onOpenSettings: () => void;
  onOpenGamepad: () => void;
  onToggleSubtractMode: () => void;
  onAdjustTime: (seconds: number) => void;
  onRevertToPreviousRound?: () => void;
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
  isSubtractMode,
  roundResults,
  winnerName,
  canRevertRound = false,
  onToggleTimer,
  onResetRound,
  onOpenSettings,
  onOpenGamepad,
  onToggleSubtractMode,
  onAdjustTime,
  onRevertToPreviousRound,
}: TimerPanelProps) => {
  const [isCompact, setIsCompact] = useState(true);

  const isWarning = timeRemaining <= 30 && timeRemaining > 10;
  const isDanger = timeRemaining <= 10;

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center justify-center",
        "bg-background relative overflow-hidden",
        isSubtractMode && "ring-4 ring-inset ring-gamjeom animate-pulse"
      )}
    >
      {/* Match Ended Overlay */}
      {matchEnded && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "absolute top-4 left-1/2 -translate-x-1/2 z-20",
            "font-bold uppercase px-4 py-2 rounded-xl whitespace-nowrap",
            "border-2 scoreboard-shadow",
            "text-sm md:text-lg",
            matchWinner === 'chung' ? "bg-chung border-chung-dark text-chung-foreground" :
            matchWinner === 'hong' ? "bg-hong border-hong-dark text-hong-foreground" :
            "bg-muted border-muted-foreground text-foreground"
          )}
        >
          {matchWinner ? (
            <div className="flex flex-col items-center">
              <span className="text-xs opacity-80">VENCEDOR</span>
              <span>{winnerName || (matchWinner === 'chung' ? 'CHUNG' : 'HONG')}</span>
            </div>
          ) : 'EMPATE'}
        </motion.div>
      )}

      {/* Round Indicator */}
      <div className="mt-auto pt-4">
        <RoundIndicator
          totalRounds={totalRounds}
          currentRound={currentRound}
          roundResults={roundResults}
          isResting={isResting}
        />
      </div>

      {/* Rest Indicator */}
      {isResting && (
        <div className="text-primary font-bold uppercase tracking-wider animate-pulse text-sm md:text-base">
          DESCANSO
        </div>
      )}

      {/* Timer Display - DOMINANT & CLICKABLE */}
      <button
        onClick={onToggleTimer}
        disabled={matchEnded}
        className={cn(
          "flex-1 flex items-center justify-center w-full",
          "cursor-pointer select-none",
          "transition-all duration-300 active:scale-95",
          "disabled:cursor-not-allowed",
          "hover:bg-muted/10",
          "min-h-0 px-2"
        )}
      >
        <div
          className={cn(
            "font-digital font-bold leading-none tracking-tight",
            "transition-all duration-500",
            isDanger ? "text-timer-danger text-glow-danger" :
            isWarning ? "text-timer-warning text-glow-warning" :
            "text-timer text-glow-timer",
            matchEnded && "opacity-50",
            !isRunning && !matchEnded && "opacity-60 animate-pulse"
          )}
          style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}
        >
          {formatTime(timeRemaining)}
        </div>
      </button>

      {/* Bottom Controls - Compact row */}
      <div className="flex items-center justify-center gap-1 mb-auto pb-2">
        {/* Compact Toggle */}
        <button
          onClick={() => setIsCompact(!isCompact)}
          className={cn(
            "p-1 rounded-full",
            "bg-muted/30 hover:bg-muted/60 text-foreground/40 hover:text-foreground/80",
            "transition-all duration-200"
          )}
        >
          {isCompact ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        {/* Collapsible Controls */}
        <AnimatePresence>
          {!isCompact && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 overflow-hidden"
            >
              {/* Time Adjustment */}
              <button
                onClick={() => onAdjustTime(-1)}
                className="px-2 py-1 text-xs rounded bg-muted/50 hover:bg-muted text-foreground/70 transition-all duration-200 active:scale-95"
              >
                -1s
              </button>
              <button
                onClick={() => onAdjustTime(1)}
                className="px-2 py-1 text-xs rounded bg-muted/50 hover:bg-muted text-foreground/70 transition-all duration-200 active:scale-95"
              >
                +1s
              </button>

              <div className="w-px h-5 bg-border/30 mx-1" />

              {/* Control Buttons */}
              <button
                onClick={onResetRound}
                className="p-1.5 rounded-full bg-muted/50 hover:bg-muted text-foreground/60 hover:text-foreground transition-all duration-200 active:scale-95"
                title="Reiniciar Round"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {canRevertRound && onRevertToPreviousRound && (
                <button
                  onClick={onRevertToPreviousRound}
                  className="p-1.5 rounded-full bg-destructive/60 hover:bg-destructive text-destructive-foreground transition-all duration-200 active:scale-95"
                  title="Retornar ao Round Anterior"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onToggleSubtractMode}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-200 active:scale-95",
                  isSubtractMode
                    ? "bg-gamjeom text-black ring-1 ring-gamjeom"
                    : "bg-muted/50 hover:bg-muted text-foreground/60 hover:text-foreground"
                )}
                title="Modo Correção (Subtrair)"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border/30 mx-1" />

              {/* Settings & Gamepad */}
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-full bg-muted/50 hover:bg-muted text-foreground/60 hover:text-foreground transition-all duration-200 active:scale-95"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenGamepad}
                className="p-1.5 rounded-full relative bg-muted/50 hover:bg-muted text-foreground/60 hover:text-foreground transition-all duration-200 active:scale-95"
                title="Controle"
              >
                <Gamepad2 className="w-4 h-4" />
                {gamepadConnected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-timer rounded-full" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
