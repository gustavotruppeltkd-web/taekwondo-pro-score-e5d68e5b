import { useState, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Settings, Gamepad2, GripHorizontal, Minus, ChevronUp, ChevronDown, Undo2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Rnd } from "react-rnd";
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

// Base dimensions for scaling calculations
const BASE_WIDTH = 400;
const BASE_HEIGHT = 280;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;

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
  const boundsRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  // Panel position and size state
  const [panelState, setPanelState] = useState({
    x: 0,
    y: 0,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
  });

  const isWarning = timeRemaining <= 30 && timeRemaining > 10;
  const isDanger = timeRemaining <= 10;

  // Calculate scale factor based on current size vs base size
  const scaleFactor = useMemo(() => {
    const widthScale = panelState.width / BASE_WIDTH;
    const heightScale = panelState.height / BASE_HEIGHT;
    return Math.min(widthScale, heightScale);
  }, [panelState.width, panelState.height]);

  // Center the panel on mount
  useLayoutEffect(() => {
    if (initializedRef.current) return;
    const bounds = boundsRef.current;
    if (!bounds) return;

    const { width: bw, height: bh } = bounds.getBoundingClientRect();
    if (!bw || !bh) return;

    const initialWidth = Math.min(BASE_WIDTH, bw * 0.85);
    const initialHeight = Math.min(BASE_HEIGHT, bh * 0.6);
    const x = Math.round((bw - initialWidth) / 2);
    const y = Math.round((bh - initialHeight) / 2);

    setPanelState({ x, y, width: initialWidth, height: initialHeight });
    initializedRef.current = true;
  }, []);

  // Resize handle styles - invisible but easy to grab
  const resizeHandleStyles = useMemo(() => {
    const edgeSize = 12;
    const cornerSize = 20;

    return {
      top: { top: 0, left: cornerSize, right: cornerSize, height: edgeSize, cursor: 'ns-resize' },
      bottom: { bottom: 0, left: cornerSize, right: cornerSize, height: edgeSize, cursor: 'ns-resize' },
      left: { left: 0, top: cornerSize, bottom: cornerSize, width: edgeSize, cursor: 'ew-resize' },
      right: { right: 0, top: cornerSize, bottom: cornerSize, width: edgeSize, cursor: 'ew-resize' },
      topLeft: { top: 0, left: 0, width: cornerSize, height: cornerSize, cursor: 'nwse-resize' },
      topRight: { top: 0, right: 0, width: cornerSize, height: cornerSize, cursor: 'nesw-resize' },
      bottomLeft: { bottom: 0, left: 0, width: cornerSize, height: cornerSize, cursor: 'nesw-resize' },
      bottomRight: { bottom: 0, right: 0, width: cornerSize, height: cornerSize, cursor: 'nwse-resize' },
    };
  }, []);

  const handleDragStop = useCallback((_e: unknown, data: { x: number; y: number }) => {
    setPanelState(prev => ({ ...prev, x: data.x, y: data.y }));
  }, []);

  const handleResizeStop = useCallback(
    (_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, position: { x: number; y: number }) => {
      setPanelState({
        x: position.x,
        y: position.y,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      });
    },
    []
  );

  // Dynamic font sizes based on scale
  const timerFontSize = Math.max(32, Math.round(48 * scaleFactor));
  const buttonSize = Math.max(32, Math.round(40 * scaleFactor));
  const iconSize = Math.max(16, Math.round(20 * scaleFactor));

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div ref={boundsRef} className="relative h-full w-full">
        <Rnd
          bounds="parent"
          position={{ x: panelState.x, y: panelState.y }}
          size={{ width: panelState.width, height: panelState.height }}
          minWidth={MIN_WIDTH}
          minHeight={MIN_HEIGHT}
          maxWidth="95%"
          maxHeight="90%"
          dragHandleClassName="timer-drag-handle"
          enableResizing={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true,
          }}
          resizeHandleStyles={resizeHandleStyles}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          className="pointer-events-auto"
          style={{ zIndex: 50 }}
        >
          {/* Main Black Panel - This is what gets resized */}
          <div
            className={cn(
              "w-full h-full flex flex-col",
              "bg-background/95 rounded-2xl scoreboard-shadow",
              "border-4 relative overflow-hidden",
              isSubtractMode ? "border-gamjeom animate-pulse" : "border-muted"
            )}
          >
            {/* Drag Handle Bar at Top */}
            <div
              className={cn(
                "timer-drag-handle",
                "flex items-center justify-center gap-2 py-2",
                "bg-muted/50 hover:bg-muted/80 transition-colors",
                "cursor-grab active:cursor-grabbing",
                "border-b border-border/50",
                "select-none shrink-0"
              )}
            >
              <GripHorizontal className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Arraste aqui
              </span>
              <GripHorizontal className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Content Area - Uses flex to stay centered */}
            <div className="flex-1 flex flex-col items-center justify-center p-3 gap-2 min-h-0">
              {/* Match Ended Overlay */}
              {matchEnded && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "absolute top-12 left-1/2 -translate-x-1/2 z-20",
                    "text-lg font-bold uppercase px-4 py-2 rounded-xl whitespace-nowrap",
                    "border-2 scoreboard-shadow",
                    matchWinner === 'chung' ? "bg-chung border-chung-dark text-chung-foreground" :
                    matchWinner === 'hong' ? "bg-hong border-hong-dark text-hong-foreground" :
                    "bg-muted border-muted-foreground text-foreground"
                  )}
                  style={{ fontSize: Math.max(12, 14 * scaleFactor) }}
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
              <div style={{ transform: `scale(${Math.max(0.7, scaleFactor)})` }}>
                <RoundIndicator
                  totalRounds={totalRounds}
                  currentRound={currentRound}
                  roundResults={roundResults}
                  isResting={isResting}
                />
              </div>

              {/* Rest Indicator */}
              {isResting && (
                <div
                  className="text-primary font-bold uppercase tracking-wider animate-pulse"
                  style={{ fontSize: Math.max(14, 18 * scaleFactor) }}
                >
                  DESCANSO
                </div>
              )}

              {/* Timer Display with Play/Pause */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "font-digital font-bold leading-none",
                    isDanger ? "text-timer-danger text-glow-danger" :
                    isWarning ? "text-timer-warning text-glow-warning" :
                    "text-timer text-glow-timer",
                    matchEnded && "opacity-50"
                  )}
                  style={{ fontSize: timerFontSize }}
                >
                  {formatTime(timeRemaining)}
                </div>

                <button
                  onClick={onToggleTimer}
                  disabled={matchEnded}
                  className={cn(
                    "rounded-full flex items-center justify-center",
                    "bg-primary hover:bg-primary/80 text-primary-foreground",
                    "transition-all duration-200 active:scale-95",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  style={{ width: buttonSize, height: buttonSize }}
                >
                  {isRunning ? (
                    <Pause style={{ width: iconSize, height: iconSize }} />
                  ) : (
                    <Play style={{ width: iconSize, height: iconSize }} />
                  )}
                </button>
              </div>

              {/* Compact Toggle */}
              <button
                onClick={() => setIsCompact(!isCompact)}
                className={cn(
                  "p-1 rounded-full",
                  "bg-muted/50 hover:bg-muted text-foreground/60 hover:text-foreground",
                  "transition-all duration-200"
                )}
              >
                {isCompact ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {/* Collapsible Controls */}
              <AnimatePresence>
                {!isCompact && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-2 overflow-hidden"
                  >
                    {/* Time Adjustment */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAdjustTime(-1)}
                        className={cn(
                          "px-2 py-1 text-xs rounded",
                          "bg-muted hover:bg-muted-foreground/20 text-foreground",
                          "transition-all duration-200 active:scale-95"
                        )}
                      >
                        -1s
                      </button>
                      <button
                        onClick={() => onAdjustTime(1)}
                        className={cn(
                          "px-2 py-1 text-xs rounded",
                          "bg-muted hover:bg-muted-foreground/20 text-foreground",
                          "transition-all duration-200 active:scale-95"
                        )}
                      >
                        +1s
                      </button>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onResetRound}
                        className={cn(
                          "p-2 rounded-full",
                          "bg-muted hover:bg-muted-foreground/20 text-foreground",
                          "transition-all duration-200 active:scale-95"
                        )}
                      >
                        <RotateCcw style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
                      </button>

                      {canRevertRound && onRevertToPreviousRound && (
                        <button
                          onClick={onRevertToPreviousRound}
                          className={cn(
                            "p-2 rounded-full",
                            "bg-destructive/80 hover:bg-destructive text-destructive-foreground",
                            "transition-all duration-200 active:scale-95"
                          )}
                          title="Retornar ao Round Anterior"
                        >
                          <Undo2 style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
                        </button>
                      )}

                      <button
                        onClick={onToggleSubtractMode}
                        className={cn(
                          "p-2 rounded-full",
                          "transition-all duration-200 active:scale-95",
                          isSubtractMode
                            ? "bg-gamjeom text-black ring-2 ring-gamjeom ring-offset-2 ring-offset-background"
                            : "bg-muted hover:bg-muted-foreground/20 text-foreground"
                        )}
                        title="Modo Correção (Subtrair)"
                      >
                        <Minus style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
                      </button>

                      <button
                        onClick={onOpenSettings}
                        className={cn(
                          "p-2 rounded-full",
                          "bg-muted hover:bg-muted-foreground/20 text-foreground",
                          "transition-all duration-200 active:scale-95"
                        )}
                      >
                        <Settings style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
                      </button>

                      <button
                        onClick={onOpenGamepad}
                        className={cn(
                          "p-2 rounded-full relative",
                          "bg-muted hover:bg-muted-foreground/20 text-foreground",
                          "transition-all duration-200 active:scale-95"
                        )}
                      >
                        <Gamepad2 style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
                        {gamepadConnected && (
                          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-timer rounded-full" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Rnd>
      </div>
    </div>
  );
};
