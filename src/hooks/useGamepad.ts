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
<<<<<<< HEAD
  resetMatch: number | null;
=======
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
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
<<<<<<< HEAD
  hongDouble: 2,      // Square (Was Circle=1)

=======
  hongDouble: 1,      // Circle
  
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
  // Chung (Blue) controls
  chungPlus1: 13,     // D-Pad Down
  chungPlus2: 4,      // L1
  chungPlus3: 6,      // L2
  chungGamjeom: 12,   // D-Pad Up
<<<<<<< HEAD
  chungDouble: 15,    // D-Pad Right (Was Left=14)

=======
  chungDouble: 14,    // D-Pad Left
  
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
  // General controls
  startPause: 11,     // R3 (Right analog click)
  resetRound: 10,     // L3 (Left analog click)
  subtractMode: 9,    // Options / Start
<<<<<<< HEAD
  decisionHong: 1,    // Circle (Was D-Pad Right=15)
  decisionChung: 14,  // D-Pad Left (Was null)
  resetMatch: 8,      // Select / Share / Back
=======
  decisionHong: 15,   // D-Pad Right (Red wins)
  decisionChung: null, // Not mapped (D-Pad Left now used for chungDouble)
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
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
<<<<<<< HEAD
  onResetMatch?: () => void;
=======
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
}

export const useGamepad = (mapping: GamepadMapping, actions: GamepadActions) => {
  const [connected, setConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState<string | null>(null);
  const pressedButtons = useRef<Set<number>>(new Set());
  const animationFrameRef = useRef<number>();

  const handleButtonPress = useCallback((buttonIndex: number) => {
    const actionMap: Record<keyof GamepadMapping, (() => void) | undefined> = {
      chungPlus1: actions.onChungPlus1,
      chungPlus2: actions.onChungPlus2,
      chungPlus3: actions.onChungPlus3,
      chungGamjeom: actions.onChungGamjeom,
      chungDouble: actions.onChungDouble,
      hongPlus1: actions.onHongPlus1,
      hongPlus2: actions.onHongPlus2,
      hongPlus3: actions.onHongPlus3,
      hongGamjeom: actions.onHongGamjeom,
      hongDouble: actions.onHongDouble,
      startPause: actions.onStartPause,
      resetRound: actions.onResetRound,
      subtractMode: actions.onSubtractMode,
      decisionChung: actions.onDecisionChung,
      decisionHong: actions.onDecisionHong,
<<<<<<< HEAD
      resetMatch: actions.onResetMatch,
=======
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
    };

    for (const [key, action] of Object.entries(actionMap)) {
      if (mapping[key as keyof GamepadMapping] === buttonIndex && action) {
        action();
        break;
      }
    }
  }, [mapping, actions]);

  const pollGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];

    if (gamepad) {
      if (!connected) {
        setConnected(true);
        setGamepadName(gamepad.id);
      }

      gamepad.buttons.forEach((button, index) => {
        if (button.pressed && !pressedButtons.current.has(index)) {
          pressedButtons.current.add(index);
          handleButtonPress(index);
        } else if (!button.pressed && pressedButtons.current.has(index)) {
          pressedButtons.current.delete(index);
        }
      });
    } else if (connected) {
      setConnected(false);
      setGamepadName(null);
    }

    animationFrameRef.current = requestAnimationFrame(pollGamepad);
  }, [connected, handleButtonPress]);

  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('Gamepad connected:', e.gamepad.id);
      setConnected(true);
      setGamepadName(e.gamepad.id);
    };

    const handleGamepadDisconnected = () => {
      console.log('Gamepad disconnected');
      setConnected(false);
      setGamepadName(null);
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
    };
  }, [pollGamepad]);

  return { connected, gamepadName };
};

export const useGamepadButtonListener = (onButtonPress: (buttonIndex: number) => void) => {
  const pressedRef = useRef<Set<number>>(new Set());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad) {
        gamepad.buttons.forEach((button, index) => {
          if (button.pressed && !pressedRef.current.has(index)) {
            pressedRef.current.add(index);
            onButtonPress(index);
          } else if (!button.pressed) {
            pressedRef.current.delete(index);
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
