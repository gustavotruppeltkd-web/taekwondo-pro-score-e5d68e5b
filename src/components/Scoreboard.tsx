import { useState, useCallback } from "react";
import { FighterPanel } from "./FighterPanel";
import { TimerPanel } from "./TimerPanel";
import { SettingsDialog } from "./SettingsDialog";
import { GamepadDialog } from "./GamepadDialog";
import { RefereeDecisionModal } from "./RefereeDecisionModal";
import { RoundWinnerBanner } from "./RoundWinnerBanner";
import { useScoreboard } from "@/hooks/useScoreboard";
import { useGamepad, GamepadMapping, defaultMapping } from "@/hooks/useGamepad";

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
  } = useScoreboard();

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

  const { connected: gamepadConnected, gamepadName } = useGamepad(gamepadMapping, gamepadActions);

  const roundsToWin = Math.ceil(settings.totalRounds / 2);

  const getWinnerName = () => {
    if (state.roundWinner === 'chung') return settings.chungName;
    if (state.roundWinner === 'hong') return settings.hongName;
    return '';
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">


      {/* Chung (Blue) Side */}
      <FighterPanel
        side="chung"
        name={settings.chungName}
        score={state.chung.score}
        opponentScore={state.hong.score}
        gamjeom={state.chung.gamjeom}
        roundsWon={state.chung.roundsWon}
        roundsToWin={roundsToWin}
        isSubtractMode={state.isSubtractMode}
        pointHistory={state.chungHistory}
        isWinningByTiebreaker={tiebreakerWinner === 'chung'}
        canDouble={canDouble('chung')}
        onAddPoints={(points) => addPoints('chung', points)}
        onAddGamjeom={() => addGamjeom('chung')}
        onDoubleLastPoint={() => doubleLastPoint('chung')}
        disabled={state.matchEnded || state.isResting}
      />

      {/* Hong (Red) Side */}
      <FighterPanel
        side="hong"
        name={settings.hongName}
        score={state.hong.score}
        opponentScore={state.chung.score}
        gamjeom={state.hong.gamjeom}
        roundsWon={state.hong.roundsWon}
        roundsToWin={roundsToWin}
        isSubtractMode={state.isSubtractMode}
        pointHistory={state.hongHistory}
        isWinningByTiebreaker={tiebreakerWinner === 'hong'}
        canDouble={canDouble('hong')}
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
        isSubtractMode={state.isSubtractMode}
        roundResults={state.roundResults}
        winnerName={state.matchWinner === 'chung' ? settings.chungName : settings.hongName}
        canRevertRound={state.previousRoundSnapshot !== null}
        onToggleTimer={toggleTimer}
        onResetRound={resetRound}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGamepad={() => setGamepadOpen(true)}
        onToggleSubtractMode={toggleSubtractMode}
        onAdjustTime={adjustTime}
        onRevertToPreviousRound={revertToPreviousRound}
      />

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
        chungName={settings.chungName}
        hongName={settings.hongName}
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
        gamepadName={gamepadName}
      />
    </div>
  );
};
