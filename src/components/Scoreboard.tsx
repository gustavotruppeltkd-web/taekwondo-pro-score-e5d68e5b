import { useState, useCallback } from "react";
import { FighterPanel } from "./FighterPanel";
import { TimerPanel } from "./TimerPanel";
import { SettingsDialog } from "./SettingsDialog";
import { GamepadDialog } from "./GamepadDialog";
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
    toggleTimer,
    resetRound,
    resetMatch,
    updateSettings,
  } = useScoreboard();

  // Gamepad actions
  const gamepadActions = {
    onChungPlus1: useCallback(() => addPoints('chung', 1), [addPoints]),
    onChungPlus2: useCallback(() => addPoints('chung', 2), [addPoints]),
    onChungPlus3: useCallback(() => addPoints('chung', 3), [addPoints]),
    onChungGamjeom: useCallback(() => addGamjeom('chung'), [addGamjeom]),
    onHongPlus1: useCallback(() => addPoints('hong', 1), [addPoints]),
    onHongPlus2: useCallback(() => addPoints('hong', 2), [addPoints]),
    onHongPlus3: useCallback(() => addPoints('hong', 3), [addPoints]),
    onHongGamjeom: useCallback(() => addGamjeom('hong'), [addGamjeom]),
    onStartPause: toggleTimer,
    onResetRound: resetRound,
  };

  const { connected: gamepadConnected, gamepadName } = useGamepad(gamepadMapping, gamepadActions);

  const roundsToWin = Math.ceil(settings.totalRounds / 2);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Chung (Blue) Side */}
      <FighterPanel
        side="chung"
        name={settings.chungName}
        score={state.chung.score}
        gamjeom={state.chung.gamjeom}
        roundsWon={state.chung.roundsWon}
        roundsToWin={roundsToWin}
        onAddPoints={(points) => addPoints('chung', points)}
        onAddGamjeom={() => addGamjeom('chung')}
        disabled={state.matchEnded || state.isResting}
      />

      {/* Hong (Red) Side */}
      <FighterPanel
        side="hong"
        name={settings.hongName}
        score={state.hong.score}
        gamjeom={state.hong.gamjeom}
        roundsWon={state.hong.roundsWon}
        roundsToWin={roundsToWin}
        onAddPoints={(points) => addPoints('hong', points)}
        onAddGamjeom={() => addGamjeom('hong')}
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
        onToggleTimer={toggleTimer}
        onResetRound={resetRound}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGamepad={() => setGamepadOpen(true)}
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
