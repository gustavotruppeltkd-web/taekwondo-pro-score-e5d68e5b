import { useState, useCallback } from "react";
import { Menu, X, Minus, RotateCcw, Undo2, Settings, Gamepad2, FileDown, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import gamepadMap from "@/assets/gamepad-map.png";
import { FighterPanel } from "./FighterPanel";
import { TimerPanel } from "./TimerPanel";
import { SettingsDialog } from "./SettingsDialog";
import { GamepadDialog } from "./GamepadDialog";
import { RefereeDecisionModal } from "./RefereeDecisionModal";
import { RoundWinnerBanner } from "./RoundWinnerBanner";
import { useScoreboard } from "@/hooks/useScoreboard";
import { useGamepad, GamepadMapping } from "@/hooks/useGamepad";
import { loadGamepadMappings, persistGamepadMappings } from "@/lib/gamepadMappings";
import { resolveFighterName } from "@/lib/fighterNames";

export const Scoreboard = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gamepadOpen, setGamepadOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  // Button mappings per controller id — loaded from localStorage so a remapped
  // controller is recognized automatically next time.
  const [gamepadMappings, setGamepadMappings] = useState(() => loadGamepadMappings());

  const handleSaveMapping = useCallback((gamepadId: string, mapping: GamepadMapping) => {
    setGamepadMappings((prev) => {
      const next = { ...prev, [gamepadId]: mapping };
      persistGamepadMappings(next);
      return next;
    });
  }, []);

  const {
    state,
    settings,
    addPoints,
    addGamjeom,
    doubleLastPoint,
    toggleTimer,
    resetRound,
    resetMatch,
    updateSettings,
    handleRefereeDecision,
    dismissRoundWinner,
    canDouble,
    toggleSubtractMode,
    setSubtractMode,
    adjustTime,
    revertToPreviousRound,
    matchLog,
  } = useScoreboard();

  // Resolved display names (fall back to "Atleta Azul" / "Atleta Vermelho").
  const chungName = resolveFighterName(settings.chungName, 'chung');
  const hongName = resolveFighterName(settings.hongName, 'hong');

  const handleDownloadReport = useCallback(async () => {
    // Loaded on demand so jsPDF (and its html2canvas/dompurify deps) never
    // weigh down the live scoreboard bundle — only fetched when the PDF is generated.
    const { generateMatchReport } = await import("@/lib/matchReportPdf");
    generateMatchReport({
      log: matchLog.current,
      chungName,
      hongName,
      winner: state.matchWinner,
      roundResults: state.roundResults,
    });
  }, [matchLog, chungName, hongName, state.matchWinner, state.roundResults]);

  // Compute tiebreaker winner for live display
  const getTiebreakerWinner = useCallback((): 'chung' | 'hong' | null => {
    if (state.chung.score !== state.hong.score) return null; // not tied, use normal score comparison

    const countEntries = (history: typeof state.chungHistory, value: number, isDouble: boolean) =>
      history.filter(e => e.type === 'score' && e.value === value && (isDouble ? e.isDouble === true : !e.isDouble)).length;

    const tiebreakers = [
      { value: 3, isDouble: true },
      { value: 2, isDouble: true },
      { value: 3, isDouble: false },
      { value: 2, isDouble: false },
    ];

    for (const tb of tiebreakers) {
      const chungCount = countEntries(state.chungHistory, tb.value, tb.isDouble);
      const hongCount = countEntries(state.hongHistory, tb.value, tb.isDouble);
      if (chungCount > hongCount) return 'chung';
      if (hongCount > chungCount) return 'hong';
    }
    return null;
  }, [state.chung.score, state.hong.score, state.chungHistory, state.hongHistory]);

  const tiebreakerWinner = getTiebreakerWinner();

  // Gamepad actions
  const gamepadActions = {
    onChungPlus1: useCallback(() => addPoints('chung', 1), [addPoints]),
    onChungPlus2: useCallback(() => addPoints('chung', 2), [addPoints]),
    onChungPlus3: useCallback(() => addPoints('chung', 3), [addPoints]),
    onChungGamjeom: useCallback(() => addGamjeom('chung'), [addGamjeom]),
    onChungDouble: useCallback(() => doubleLastPoint('chung'), [doubleLastPoint]),
    onHongPlus1: useCallback(() => addPoints('hong', 1), [addPoints]),
    onHongPlus2: useCallback(() => addPoints('hong', 2), [addPoints]),
    onHongPlus3: useCallback(() => addPoints('hong', 3), [addPoints]),
    onHongGamjeom: useCallback(() => addGamjeom('hong'), [addGamjeom]),
    onHongDouble: useCallback(() => doubleLastPoint('hong'), [doubleLastPoint]),
    onStartPause: toggleTimer,
    onResetRound: resetRound,
    onSubtractMode: toggleSubtractMode,
    onDecisionChung: useCallback(() => {
      if (state.showDecisionModal) {
        handleRefereeDecision('chung');
      }
    }, [state.showDecisionModal, handleRefereeDecision]),
    onDecisionHong: useCallback(() => {
      if (state.showDecisionModal) {
        handleRefereeDecision('hong');
      }
    }, [state.showDecisionModal, handleRefereeDecision]),
    onResetMatch: resetMatch,
  };

  const { connected: gamepadConnected, connectedCount: gamepadCount, gamepadName, gamepadNames } = useGamepad(gamepadMappings, gamepadActions);

  const roundsToWin = Math.ceil(settings.totalRounds / 2);

  const getWinnerName = () => {
    if (state.roundWinner === 'chung') return chungName;
    if (state.roundWinner === 'hong') return hongName;
    return '';
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">


      {/* Chung (Blue) Side */}
      <FighterPanel
        side="chung"
        name={chungName}
        score={state.chung.score}
        opponentScore={state.hong.score}
        gamjeom={state.chung.gamjeom}
        roundsWon={state.chung.roundsWon}
        roundsToWin={roundsToWin}
        isSubtractMode={state.isSubtractMode}
        pointHistory={state.chungHistory}
        isWinningByTiebreaker={tiebreakerWinner === 'chung'}
        canDouble={canDouble('chung')}
        canUndoDouble={state.isSubtractMode && state.chungHistory.some(e => e.isDouble)}
        onAddPoints={(points) => addPoints('chung', points)}
        onAddGamjeom={() => addGamjeom('chung')}
        onDoubleLastPoint={() => doubleLastPoint('chung')}
        disabled={state.matchEnded || state.isResting}
      />

      {/* Hong (Red) Side */}
      <FighterPanel
        side="hong"
        name={hongName}
        score={state.hong.score}
        opponentScore={state.chung.score}
        gamjeom={state.hong.gamjeom}
        roundsWon={state.hong.roundsWon}
        roundsToWin={roundsToWin}
        isSubtractMode={state.isSubtractMode}
        pointHistory={state.hongHistory}
        isWinningByTiebreaker={tiebreakerWinner === 'hong'}
        canDouble={canDouble('hong')}
        canUndoDouble={state.isSubtractMode && state.hongHistory.some(e => e.isDouble)}
        onAddPoints={(points) => addPoints('hong', points)}
        onAddGamjeom={() => addGamjeom('hong')}
        onDoubleLastPoint={() => doubleLastPoint('hong')}
        disabled={state.matchEnded || state.isResting}
      />

      {/* Center Timer Panel */}
      <TimerPanel
        timeRemaining={state.timeRemaining}
        currentRound={state.currentRound}
        totalRounds={settings.totalRounds}
        isRunning={state.isRunning}
        isResting={state.isResting}
        matchEnded={state.matchEnded}
        matchWinner={state.matchWinner}
        gamepadConnected={gamepadConnected}
        gamepadCount={gamepadCount}
        isSubtractMode={state.isSubtractMode}
        roundResults={state.roundResults}
        winnerName={state.matchWinner === 'chung' ? chungName : hongName}
        canRevertRound={state.previousRoundSnapshot !== null}
        onToggleTimer={toggleTimer}
        onResetRound={resetRound}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGamepad={() => setGamepadOpen(true)}
        onToggleSubtractMode={toggleSubtractMode}
        onAdjustTime={adjustTime}
        onRevertToPreviousRound={revertToPreviousRound}
        onDownloadReport={handleDownloadReport}
      />

      {/* Bottom-center menu — holds every timer control. Opens with an
          animation from the button; the hamburger turns into an X to close. */}
      <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="menu-toolbar"
              initial={{ opacity: 0, y: 22, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 22, scale: 0.8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ transformOrigin: "bottom center" }}
              className="flex items-center gap-1.5 rounded-full bg-neutral-900/95 border border-white/10 px-2.5 py-2 shadow-2xl"
            >
              <button onClick={() => adjustTime(-1)} className="h-9 px-3 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white active:scale-95 transition">-1s</button>
              <button onClick={() => adjustTime(1)} className="h-9 px-3 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white active:scale-95 transition">+1s</button>
              <button onClick={resetRound} title="Reiniciar round" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition">
                <RotateCcw className="w-4 h-4" />
              </button>
              {state.previousRoundSnapshot !== null && (
                <button onClick={revertToPreviousRound} title="Voltar ao round anterior" className="w-9 h-9 rounded-full bg-destructive hover:bg-destructive/80 text-destructive-foreground flex items-center justify-center active:scale-95 transition">
                  <Undo2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={toggleSubtractMode} title="Modo correção" className={cn("w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition", state.isSubtractMode ? "bg-gamjeom text-black" : "bg-white/10 hover:bg-white/20 text-white")}>
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => { setSettingsOpen(true); setMenuOpen(false); }} title="Configurações" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={() => { setGamepadOpen(true); setMenuOpen(false); }} title="Controle" className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition">
                <Gamepad2 className="w-4 h-4" />
                {gamepadConnected && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center bg-timer text-black text-[10px] font-bold rounded-full">
                    {gamepadCount}
                  </span>
                )}
              </button>
              <button onClick={() => { setMapOpen(true); setMenuOpen(false); }} title="Mapa dos controles" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition">
                <Map className="w-4 h-4" />
              </button>
              <button onClick={handleDownloadReport} title="Baixar PDF da luta" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition">
                <FileDown className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-background/90 border-2 border-muted text-foreground/80 hover:text-foreground hover:bg-background flex items-center justify-center shadow-lg transition-all active:scale-95"
          title="Menu"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
        </button>
      </div>

      {/* Round Winner Banner */}
      <RoundWinnerBanner
        winner={state.showRoundWinner ? state.roundWinner : null}
        winnerName={getWinnerName()}
        round={state.currentRound}
        matchEnded={state.matchEnded}
        onDismiss={dismissRoundWinner}
      />

      {/* Referee Decision Modal */}
      <RefereeDecisionModal
        open={state.showDecisionModal}
        chungName={chungName}
        hongName={hongName}
        onDecision={handleRefereeDecision}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={updateSettings}
        onResetMatch={resetMatch}
      />

      {/* Gamepad Dialog */}
      <GamepadDialog
        open={gamepadOpen}
        onOpenChange={setGamepadOpen}
        mappings={gamepadMappings}
        onSaveMapping={handleSaveMapping}
        gamepadConnected={gamepadConnected}
        gamepadCount={gamepadCount}
        gamepadName={gamepadName}
        gamepadNames={gamepadNames}
      />

      {/* Gamepad mapping reference — opened from the menu's map button */}
      {mapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in"
          onClick={() => setMapOpen(false)}
        >
          <button
            onClick={() => setMapOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={gamepadMap}
            alt="Mapeamento original dos controles"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
