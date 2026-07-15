import { useState, useCallback } from "react";
import { Menu } from "lucide-react";
import { FighterPanel } from "./FighterPanel";
import { TimerPanel } from "./TimerPanel";
import { SettingsDialog } from "./SettingsDialog";
import { GamepadDialog } from "./GamepadDialog";
import { RefereeDecisionModal } from "./RefereeDecisionModal";
import { RoundWinnerBanner } from "./RoundWinnerBanner";
import { useScoreboard } from "@/hooks/useScoreboard";
import { useGamepad, GamepadMapping, defaultMapping } from "@/hooks/useGamepad";
import { resolveFighterName } from "@/lib/fighterNames";

export const Scoreboard = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gamepadOpen, setGamepadOpen] = useState(false);
  const [gamepadMapping, setGamepadMapping] = useState<GamepadMapping>(defaultMapping);

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

  const { connected: gamepadConnected, connectedCount: gamepadCount, gamepadName, gamepadNames } = useGamepad(gamepadMapping, gamepadActions);

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

      {/* Menu button — separate from the timer, bottom-center (opens settings) */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-30 w-11 h-11 md:w-12 md:h-12 rounded-full bg-background/90 border-2 border-muted text-foreground/70 hover:text-foreground hover:bg-background flex items-center justify-center shadow-lg transition-all active:scale-95"
        title="Menu / Configurações"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5 md:w-6 md:h-6" />
      </button>

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
        mapping={gamepadMapping}
        onSaveMapping={setGamepadMapping}
        gamepadConnected={gamepadConnected}
        gamepadCount={gamepadCount}
        gamepadName={gamepadName}
        gamepadNames={gamepadNames}
      />
    </div>
  );
};
