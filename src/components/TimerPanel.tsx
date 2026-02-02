import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Settings, Gamepad2, Move, Minus, ChevronUp, ChevronDown, Undo2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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
  const dragControls = useDragControls();

  // Pinch to scale (touch only)
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);
  
  const isWarning = timeRemaining <= 30 && timeRemaining > 10;
  const isDanger = timeRemaining <= 10;

  const scaleValue = scale / 100;

  const clampScale = useCallback((value: number) => Math.min(150, Math.max(50, value)), []);

  const handleStartDrag = useCallback((e: React.PointerEvent) => {
    // Keep drag on desktop mouse, avoid stealing touch gestures (pinch)
    if (e.pointerType !== "mouse") return;
    const target = e.target as HTMLElement;
    if (target.closest("button,[data-no-drag]")) return;
    dragControls.start(e);
  }, [dragControls]);

  const handlePinchPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    const target = e.target as HTMLElement;
    if (target.closest("button,[data-no-pinch]")) return;

    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2) {
      const [a, b] = Array.from(activePointersRef.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      pinchStartRef.current = { distance, scale };
    }
  }, [scale]);

  const handlePinchPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size !== 2 || !pinchStartRef.current) return;

    const [a, b] = Array.from(activePointersRef.current.values());
    const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const ratio = distance / pinchStartRef.current.distance;
    const newScale = clampScale(Math.round(pinchStartRef.current.scale * ratio));
    setScale(newScale);
  }, [clampScale]);

  const handlePinchPointerEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.delete(e.pointerId);
    }
    if (activePointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = scale;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      // Diagonal movement (right-down = increase, left-up = decrease)
      const delta = (deltaX + deltaY) / 2;
      
      const newScale = Math.min(150, Math.max(50, startScale + delta / 2));
      setScale(Math.round(newScale));
    };

    const handlePointerUp = () => {
      target.releasePointerCapture(e.pointerId);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  }, [scale]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
      <motion.div 
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={{ left: -400, right: 400, top: -300, bottom: 300 }}
        onPointerDown={handleStartDrag}
        className="pointer-events-auto flex flex-col items-center cursor-grab active:cursor-grabbing mt-16 md:mt-20"
        whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
        style={{ transform: `scale(${scaleValue})` }}
      >
        {/* Drag Handle Indicator */}
        <div
          onPointerDown={(e) => {
            // Allow dragging on touch only via this handle
            e.stopPropagation();
            dragControls.start(e);
          }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-40 flex items-center gap-1 cursor-grab active:cursor-grabbing"
          title="Arraste para mover"
          data-no-pinch
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
          onPointerDown={handlePinchPointerDown}
          onPointerMove={handlePinchPointerMove}
          onPointerUp={handlePinchPointerEnd}
          onPointerCancel={handlePinchPointerEnd}
          className={cn(
          "bg-background/95 rounded-2xl p-3 md:p-5 scoreboard-shadow",
          "border-4 relative",
          isSubtractMode ? "border-gamjeom animate-pulse" : "border-muted",
          "flex flex-col items-center",
          "touch-none",
          "select-none",
          matchEnded && "opacity-50"
        )}>
          {/* Resize Handle - Top Right Corner - Uses onPointerDown to bypass framer drag */}
          <div
            onPointerDown={handleResizePointerDown}
            className={cn(
              "absolute -top-3 -right-3 w-8 h-8",
              "bg-primary hover:bg-primary/80 rounded-full",
              "cursor-nwse-resize",
              "flex items-center justify-center",
              "transition-colors duration-200",
              "shadow-lg border-2 border-background",
              "z-50"
            )}
            style={{ touchAction: 'none' }}
            title={`Escala: ${scale}% - Arraste para redimensionar`}
            data-no-drag
            data-no-pinch
          >
            <Maximize2 className="w-4 h-4 text-primary-foreground" />
          </div>

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
      </motion.div>
    </div>
  );
};