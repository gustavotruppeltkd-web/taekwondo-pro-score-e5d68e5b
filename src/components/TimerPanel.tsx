import { useState, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Settings, Gamepad2, Move, Minus, ChevronUp, ChevronDown, Undo2 } from "lucide-react";
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
  const [isResizing, setIsResizing] = useState(false);

  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number }>(() => {
    // Initial guess; we recenter with real viewport bounds on mount.
    const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
    return {
      x: 0,
      y: 0,
      width: isSmall ? 340 : 520,
      height: isSmall ? 260 : 320,
    };
  });
  
  const isWarning = timeRemaining <= 30 && timeRemaining > 10;
  const isDanger = timeRemaining <= 10;

  useLayoutEffect(() => {
    if (initializedRef.current) return;
    const el = boundsRef.current;
    if (!el) return;

    const { width: pw, height: ph } = el.getBoundingClientRect();
    if (!pw || !ph) return;

    const nextWidth = Math.min(560, Math.max(320, Math.round(pw * 0.42)));
    const nextHeight = Math.min(380, Math.max(240, Math.round(ph * 0.34)));
    const nextX = Math.round(pw / 2 - nextWidth / 2);
    const nextY = Math.round(ph / 2 - nextHeight / 2 + 50);

    setRect({ x: nextX, y: nextY, width: nextWidth, height: nextHeight });
    initializedRef.current = true;
  }, []);

  const stopResizePropagation = useCallback((e: unknown) => {
    const anyEvent = e as { stopPropagation?: () => void; preventDefault?: () => void };
    anyEvent?.stopPropagation?.();
    anyEvent?.preventDefault?.();
  }, []);

  const resizeHandleComponent = useMemo(() => {
    const Handle = (
      <span
        onMouseDownCapture={(e) => e.stopPropagation()}
        onTouchStartCapture={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
        className="pointer-events-auto"
        aria-hidden="true"
      />
    );
    return {
      top: Handle,
      right: Handle,
      bottom: Handle,
      left: Handle,
      topLeft: Handle,
      topRight: Handle,
      bottomLeft: Handle,
      bottomRight: Handle,
    };
  }, []);

  const resizeHandleStyles = useMemo(() => {
    // Make edges/corners easy to grab without adding visible UI.
    const edge = 10;
    const corner = 18;
    const halfCorner = corner / 2;
    const halfEdge = edge / 2;

    return {
      top: { top: -halfEdge, left: halfCorner, right: halfCorner, height: edge },
      bottom: { bottom: -halfEdge, left: halfCorner, right: halfCorner, height: edge },
      left: { left: -halfEdge, top: halfCorner, bottom: halfCorner, width: edge },
      right: { right: -halfEdge, top: halfCorner, bottom: halfCorner, width: edge },
      topLeft: { top: -halfCorner, left: -halfCorner, width: corner, height: corner },
      topRight: { top: -halfCorner, right: -halfCorner, width: corner, height: corner },
      bottomLeft: { bottom: -halfCorner, left: -halfCorner, width: corner, height: corner },
      bottomRight: { bottom: -halfCorner, right: -halfCorner, width: corner, height: corner },
    } as const;
  }, []);

  const resizeHandleClasses = useMemo(() => {
    return {
      top: "cursor-ns-resize",
      bottom: "cursor-ns-resize",
      left: "cursor-ew-resize",
      right: "cursor-ew-resize",
      topLeft: "cursor-nwse-resize",
      bottomRight: "cursor-nwse-resize",
      topRight: "cursor-nesw-resize",
      bottomLeft: "cursor-nesw-resize",
    } as const;
  }, []);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div ref={boundsRef} className="relative h-full w-full">
        <Rnd
          bounds="parent"
          position={{ x: rect.x, y: rect.y }}
          size={{ width: rect.width, height: rect.height }}
          minWidth={280}
          minHeight={220}
          maxWidth="90%"
          maxHeight="85%"
          dragHandleClassName="timer-panel-drag-area"
          cancel="button, [data-no-drag]"
          disableDragging={isResizing}
          enableResizing
          resizeHandleWrapperStyle={{ zIndex: 60 }}
          resizeHandleComponent={resizeHandleComponent}
          resizeHandleStyles={resizeHandleStyles}
          resizeHandleClasses={resizeHandleClasses}
          onDragStop={(_, data) => {
            setRect((prev) => ({ ...prev, x: data.x, y: data.y }));
          }}
          onResizeStart={(e) => {
            stopResizePropagation(e);
            setIsResizing(true);
          }}
          onResize={(e) => {
            stopResizePropagation(e);
          }}
          onResizeStop={(e, _dir, ref, _delta, position) => {
            stopResizePropagation(e);
            setIsResizing(false);
            setRect({
              x: position.x,
              y: position.y,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            });
          }}
          className="pointer-events-auto"
        >
          <div className="h-full w-full flex flex-col items-center">
            {/* Drag Handle Indicator */}
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-40 flex items-center gap-1"
              title="Arraste para mover"
            >
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
            <div
              className={cn(
                "timer-panel-drag-area",
                "bg-background/95 rounded-2xl p-3 md:p-5 scoreboard-shadow",
                "border-4 relative",
                isSubtractMode ? "border-gamjeom animate-pulse" : "border-muted",
                "flex flex-col items-center",
                "select-none",
                "cursor-grab active:cursor-grabbing",
                matchEnded && "opacity-50"
              )}
            >

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
          </div>
        </Rnd>
      </div>
    </div>
  );
};