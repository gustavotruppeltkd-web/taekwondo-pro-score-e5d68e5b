import { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Settings, Gamepad2, Move, Minus, Plus, ChevronUp, ChevronDown, Undo2 } from "lucide-react";
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
  const [isCompact, setIsCompact] = useState(false);
  const [scale, setScale] = useState(100);
  
  const isWarning = timeRemaining <= 30 && timeRemaining > 10;
  const isDanger = timeRemaining <= 10;

  const scaleValue = scale / 100;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
      <motion.div 
        drag
        dragMomentum={false}
        dragConstraints={{ left: -400, right: 400, top: -300, bottom: 300 }}
        className="pointer-events-auto flex flex-col items-center cursor-grab active:cursor-grabbing mt-16 md:mt-20"
        whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
        whileHover={{ scale: 1.01 }}
        style={{ transform: `scale(${scaleValue})` }}
      >
        {/* Drag Handle Indicator */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-40 flex items-center gap-1">
          <Move className="w-4 h-4 text-foreground" />
          <span className="text-xs text-foreground">Arraste</span>
        </div>

        {/* Match Ended Overlay */}
        {matchEnded && (
          <div className="absolute -top-20 md:-top-24 left-1/2 -translate-x-1/2">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "text-xl md:text-3xl font-bold uppercase px-6 py-4 rounded-xl whitespace-nowrap",
                "border-4 scoreboard-shadow",
                matchWinner === 'chung' ? "bg-chung border-chung-dark text-white" : 
                matchWinner === 'hong' ? "bg-hong border-hong-dark text-white" : 
                "bg-muted border-muted-foreground text-foreground"
              )}
            >
              {matchWinner ? (
                <div className="flex flex-col items-center">
                  <span className="text-sm md:text-lg opacity-80">VENCEDOR DA LUTA</span>
                  <span>{winnerName || (matchWinner === 'chung' ? 'CHUNG' : 'HONG')}</span>
                </div>
              ) : 'EMPATE'}
            </motion.div>
          </div>
        )}

        {/* Timer Container */}
        <div className={cn(
          "bg-background/95 rounded-2xl p-3 md:p-5 scoreboard-shadow",
          "border-4",
          isSubtractMode ? "border-gamjeom animate-pulse" : "border-muted",
          "flex flex-col items-center",
          "select-none",
          matchEnded && "opacity-50"
        )}>
          {/* Round Indicator - Always visible */}
          <RoundIndicator
            totalRounds={totalRounds}
            currentRound={currentRound}
            roundResults={roundResults}
            isResting={isResting}
          />

          {/* Rest Indicator */}
          {isResting && (
            <div className="text-primary font-bold text-base md:text-xl uppercase tracking-wider mb-1 animate-pulse">
              DESCANSO
            </div>
          )}

          {/* Main Timer with Play/Pause next to it */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "font-digital text-3xl md:text-5xl lg:text-6xl font-bold leading-none",
                isDanger ? "text-timer-danger text-glow-danger" :
                isWarning ? "text-timer-warning text-glow-warning" :
                "text-timer text-glow-timer"
              )}
            >
              {formatTime(timeRemaining)}
            </div>
            
            {/* Play/Pause Button - Always visible next to timer */}
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
              {isRunning ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>

          {/* Scale Buttons - Small +/- buttons */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setScale(Math.max(50, scale - 10))}
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded",
                "bg-muted hover:bg-muted-foreground/20 text-foreground",
                "transition-all duration-200 active:scale-95"
              )}
              title="Diminuir painel"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs text-muted-foreground w-8 text-center">{scale}%</span>
            <button
              onClick={() => setScale(Math.min(150, scale + 10))}
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded",
                "bg-muted hover:bg-muted-foreground/20 text-foreground",
                "transition-all duration-200 active:scale-95"
              )}
              title="Aumentar painel"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Compact Toggle Button */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className={cn(
              "mt-2 p-1 rounded-full",
              "bg-muted/50 hover:bg-muted text-foreground/60 hover:text-foreground",
              "transition-all duration-200"
            )}
          >
            {isCompact ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Collapsible Content */}
          <AnimatePresence>
            {!isCompact && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {/* Time Adjustment Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onAdjustTime(-1)}
                    className={cn(
                      "px-2 py-1 text-xs md:text-sm rounded",
                      "bg-muted hover:bg-muted-foreground/20 text-foreground",
                      "transition-all duration-200 active:scale-95"
                    )}
                  >
                    -1s
                  </button>
                  <button
                    onClick={() => onAdjustTime(1)}
                    className={cn(
                      "px-2 py-1 text-xs md:text-sm rounded",
                      "bg-muted hover:bg-muted-foreground/20 text-foreground",
                      "transition-all duration-200 active:scale-95"
                    )}
                  >
                    +1s
                  </button>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4">
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

                  {/* Revert to Previous Round */}
                  {canRevertRound && onRevertToPreviousRound && (
                    <button
                      onClick={onRevertToPreviousRound}
                      className={cn(
                        "p-2 md:p-3 rounded-full",
                        "bg-orange-500/80 hover:bg-orange-500 text-white",
                        "transition-all duration-200 active:scale-95"
                      )}
                      title="Retornar ao Round Anterior"
                    >
                      <Undo2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  )}

                  {/* Subtract Mode Toggle */}
                  <button
                    onClick={onToggleSubtractMode}
                    className={cn(
                      "p-2 md:p-3 rounded-full",
                      "transition-all duration-200 active:scale-95",
                      isSubtractMode 
                        ? "bg-gamjeom text-black ring-2 ring-gamjeom ring-offset-2 ring-offset-background"
                        : "bg-muted hover:bg-muted-foreground/20 text-foreground"
                    )}
                    title="Modo Correção (Subtrair)"
                  >
                    <Minus className="w-4 h-4 md:w-5 md:h-5" />
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
