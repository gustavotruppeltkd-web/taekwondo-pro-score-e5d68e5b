import { useState, useEffect, useCallback, useRef } from 'react';

export interface GamepadMapping {
  chungPlus1: number | null;
  chungPlus2: number | null;
  chungPlus3: number | null;
  chungGamjeom: number | null;
  chungDouble: number | null;
  hongPlus1: number | null;
  hongPlus2: number | null;
  hongPlus3: number | null;
  hongGamjeom: number | null;
  hongDouble: number | null;
  startPause: number | null;
  resetRound: number | null;
  subtractMode: number | null;
  decisionChung: number | null;
  decisionHong: number | null;
  resetMatch: number | null;
}

// PS3/PS4 Standard Mapping (as specified by user)
// HONG (Red):
//   X (button 0): +1 point
//   R1 (button 5): +2 points
//   R2 (button 7): +3 points
//   Triangle (button 3): Gamjeom
// CHUNG (Blue):
//   D-Pad Down (button 13): +1 point
//   L1 (button 4): +2 points
//   L2 (button 6): +3 points
//   D-Pad Up (button 12): Gamjeom
// General:
//   R3 (button 11): Start/Pause
//   L3 (button 10): Reset Round
//   D-Pad Right (button 15): Decision Hong (Red wins)
//   D-Pad Left (button 14): Decision Chung (Blue wins)

export const defaultMapping: GamepadMapping = {
  // Hong (Red) controls
  hongPlus1: 0,       // X button
  hongPlus2: 5,       // R1
  hongPlus3: 7,       // R2
  hongGamjeom: 3,     // Triangle
  hongDouble: 2,      // Square (Was Circle=1)

  // Chung (Blue) controls
  chungPlus1: 13,     // D-Pad Down
  chungPlus2: 4,      // L1
  chungPlus3: 6,      // L2
  chungGamjeom: 12,   // D-Pad Up
  chungDouble: 15,    // D-Pad Right (Was Left=14)

  // General controls
  startPause: 11,     // R3 (Right analog click)
  resetRound: 10,     // L3 (Left analog click)
  subtractMode: 9,    // Options / Start
  decisionHong: 1,    // Circle (Was D-Pad Right=15)
  decisionChung: 14,  // D-Pad Left (Was null)
  resetMatch: 8,      // Select / Share / Back
};

interface GamepadActions {
  onChungPlus1?: () => void;
  onChungPlus2?: () => void;
  onChungPlus3?: () => void;
  onChungGamjeom?: () => void;
  onChungDouble?: () => void;
  onHongPlus1?: () => void;
  onHongPlus2?: () => void;
  onHongPlus3?: () => void;
  onHongGamjeom?: () => void;
  onHongDouble?: () => void;
  onStartPause?: () => void;
  onResetRound?: () => void;
  onSubtractMode?: () => void;
  onDecisionChung?: () => void;
  onDecisionHong?: () => void;
  onResetMatch?: () => void;
}

// Actions that require consensus from 2 controllers
const CONSENSUS_ACTIONS: Set<keyof GamepadMapping> = new Set([
  'chungPlus1', 'chungPlus2', 'chungPlus3', 'chungDouble',
  'hongPlus1', 'hongPlus2', 'hongPlus3', 'hongDouble',
]);

const CONSENSUS_WINDOW_MS = 2000; // 2 seconds

interface PendingVote {
  action: keyof GamepadMapping;
  gamepadIndex: number;
  timestamp: number;
  timeoutId: number;
}

export const useGamepad = (mapping: GamepadMapping, actions: GamepadActions) => {
  const [connectedCount, setConnectedCount] = useState(0);
  const [gamepadNames, setGamepadNames] = useState<string[]>([]);

  // Use refs to store latest values without causing re-renders in the poll loop
  const mappingRef = useRef(mapping);
  const actionsRef = useRef(actions);
  const pressedButtonsMap = useRef<Map<number, Set<number>>>(new Map());
  const animationFrameRef = useRef<number>();
  const pendingVotes = useRef<PendingVote[]>([]);
  const connectedCountRef = useRef(0);
  const gamepadNamesRef = useRef<string[]>([]);

  // Keep refs in sync with props (no re-render triggered)
  useEffect(() => {
    mappingRef.current = mapping;
  }, [mapping]);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // Stable function: find which action a button maps to
  const findActionForButton = useCallback((buttonIndex: number): keyof GamepadMapping | null => {
    const currentMapping = mappingRef.current;
    for (const [key, value] of Object.entries(currentMapping)) {
      if (value === buttonIndex) {
        return key as keyof GamepadMapping;
      }
    }
    return null;
  }, []);

  // Stable function: execute an action
  const resolveAction = useCallback((actionKey: keyof GamepadMapping) => {
    const currentActions = actionsRef.current;
    const actionMap: Record<keyof GamepadMapping, (() => void) | undefined> = {
      chungPlus1: currentActions.onChungPlus1,
      chungPlus2: currentActions.onChungPlus2,
      chungPlus3: currentActions.onChungPlus3,
      chungGamjeom: currentActions.onChungGamjeom,
      chungDouble: currentActions.onChungDouble,
      hongPlus1: currentActions.onHongPlus1,
      hongPlus2: currentActions.onHongPlus2,
      hongPlus3: currentActions.onHongPlus3,
      hongGamjeom: currentActions.onHongGamjeom,
      hongDouble: currentActions.onHongDouble,
      startPause: currentActions.onStartPause,
      resetRound: currentActions.onResetRound,
      subtractMode: currentActions.onSubtractMode,
      decisionChung: currentActions.onDecisionChung,
      decisionHong: currentActions.onDecisionHong,
      resetMatch: currentActions.onResetMatch,
    };
    const action = actionMap[actionKey];
    if (action) {
      action();
    }
  }, []);

  // Stable function: handle a button press with consensus logic
  const handleButtonPress = useCallback((buttonIndex: number, gamepadIndex: number, totalConnected: number) => {
    const actionKey = findActionForButton(buttonIndex);
    if (!actionKey) return;

    // If only 1 controller connected OR action doesn't need consensus → execute immediately
    if (totalConnected <= 1 || !CONSENSUS_ACTIONS.has(actionKey)) {
      resolveAction(actionKey);
      return;
    }

    // Multi-controller consensus logic
    const now = Date.now();

    // Check if there's a pending vote for the same action from a DIFFERENT controller
    const matchingVoteIndex = pendingVotes.current.findIndex(
      (v) => v.action === actionKey && v.gamepadIndex !== gamepadIndex && (now - v.timestamp) < CONSENSUS_WINDOW_MS
    );

    if (matchingVoteIndex !== -1) {
      // Consensus reached! Clear the pending vote and execute action
      const vote = pendingVotes.current[matchingVoteIndex];
      window.clearTimeout(vote.timeoutId);
      pendingVotes.current.splice(matchingVoteIndex, 1);
      resolveAction(actionKey);
    } else {
      // No matching vote yet — register this as a pending vote
      // Remove any existing vote from same controller for same action
      pendingVotes.current = pendingVotes.current.filter(
        (v) => !(v.action === actionKey && v.gamepadIndex === gamepadIndex)
      );

      const timeoutId = window.setTimeout(() => {
        // Remove expired vote
        pendingVotes.current = pendingVotes.current.filter(
          (v) => !(v.action === actionKey && v.gamepadIndex === gamepadIndex && v.timestamp === now)
        );
      }, CONSENSUS_WINDOW_MS);

      pendingVotes.current.push({
        action: actionKey,
        gamepadIndex,
        timestamp: now,
        timeoutId,
      });
    }
  }, [findActionForButton, resolveAction]);

  // Single stable effect — poll loop never restarts due to prop/state changes
  useEffect(() => {
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const names: string[] = [];

      // FIRST PASS: count all connected gamepads
      let count = 0;
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          count++;
          names.push(gamepads[i]!.id);
        }
      }

      // SECOND PASS: process buttons with correct totalConnected
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue;

        if (!pressedButtonsMap.current.has(i)) {
          pressedButtonsMap.current.set(i, new Set());
        }
        const pressed = pressedButtonsMap.current.get(i)!;

        gamepad.buttons.forEach((button, index) => {
          if (button.pressed && !pressed.has(index)) {
            pressed.add(index);
            handleButtonPress(index, i, count);
          } else if (!button.pressed && pressed.has(index)) {
            pressed.delete(index);
          }
        });
      }

      // Clean up disconnected gamepads
      for (const [idx] of pressedButtonsMap.current) {
        if (!gamepads[idx]) {
          pressedButtonsMap.current.delete(idx);
        }
      }

      // Only update React state when values actually change to avoid unnecessary re-renders
      if (count !== connectedCountRef.current) {
        connectedCountRef.current = count;
        setConnectedCount(count);
      }

      const namesKey = names.join('||');
      const prevNamesKey = gamepadNamesRef.current.join('||');
      if (namesKey !== prevNamesKey) {
        gamepadNamesRef.current = names;
        setGamepadNames(names);
      }

      animationFrameRef.current = requestAnimationFrame(pollGamepad);
    };

    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('Gamepad connected:', e.gamepad.id, '(index:', e.gamepad.index, ')');
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('Gamepad disconnected:', e.gamepad.id, '(index:', e.gamepad.index, ')');
      pressedButtonsMap.current.delete(e.gamepad.index);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    animationFrameRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clear all pending vote timeouts
      pendingVotes.current.forEach((v) => window.clearTimeout(v.timeoutId));
      pendingVotes.current = [];
    };
  }, [handleButtonPress]);

  return {
    connected: connectedCount > 0,
    connectedCount,
    gamepadName: gamepadNames[0] ?? null,
    gamepadNames,
  };
};

export const useGamepadButtonListener = (onButtonPress: (buttonIndex: number) => void) => {
  const pressedRef = useRef<Map<number, Set<number>>>(new Map());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads();

      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue;

        if (!pressedRef.current.has(i)) {
          pressedRef.current.set(i, new Set());
        }
        const pressed = pressedRef.current.get(i)!;

        gamepad.buttons.forEach((button, index) => {
          if (button.pressed && !pressed.has(index)) {
            pressed.add(index);
            onButtonPress(index);
          } else if (!button.pressed) {
            pressed.delete(index);
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(poll);
    };

    animationFrameRef.current = requestAnimationFrame(poll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onButtonPress]);
};
