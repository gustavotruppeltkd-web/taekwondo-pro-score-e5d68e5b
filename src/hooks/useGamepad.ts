import { useState, useEffect, useCallback, useRef } from 'react';

export interface GamepadMapping {
  chungPlus1: number | null;
  chungPlus2: number | null;
  chungPlus3: number | null;
  chungGamjeom: number | null;
  hongPlus1: number | null;
  hongPlus2: number | null;
  hongPlus3: number | null;
  hongGamjeom: number | null;
  startPause: number | null;
  resetRound: number | null;
  subtractMode: number | null;
  decisionChung: number | null;
  decisionHong: number | null;
}

export const defaultMapping: GamepadMapping = {
  chungPlus1: 0,      // X
  chungPlus2: 2,      // Square
  chungPlus3: 3,      // Triangle
  chungGamjeom: 4,    // L1
  hongPlus1: 1,       // Circle
  hongPlus2: 14,      // D-pad Left
  hongPlus3: 15,      // D-pad Right
  hongGamjeom: 5,     // R1
  startPause: 9,      // Options
  resetRound: 8,      // Share
  subtractMode: 6,    // L2
  decisionChung: 12,  // D-pad Up
  decisionHong: 13,   // D-pad Down
};

interface GamepadActions {
  onChungPlus1?: () => void;
  onChungPlus2?: () => void;
  onChungPlus3?: () => void;
  onChungGamjeom?: () => void;
  onHongPlus1?: () => void;
  onHongPlus2?: () => void;
  onHongPlus3?: () => void;
  onHongGamjeom?: () => void;
  onStartPause?: () => void;
  onResetRound?: () => void;
  onSubtractMode?: () => void;
  onDecisionChung?: () => void;
  onDecisionHong?: () => void;
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
      hongPlus1: actions.onHongPlus1,
      hongPlus2: actions.onHongPlus2,
      hongPlus3: actions.onHongPlus3,
      hongGamjeom: actions.onHongGamjeom,
      startPause: actions.onStartPause,
      resetRound: actions.onResetRound,
      subtractMode: actions.onSubtractMode,
      decisionChung: actions.onDecisionChung,
      decisionHong: actions.onDecisionHong,
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
