import { useState, useCallback, useEffect, useRef } from 'react';
import { playRoundStartBeep, playRoundEndBeep, playTenSecondWarning, playScoreBeep, playFaultBeep } from './useAudio';

export interface ScoreboardSettings {
  roundTime: number; // in seconds
  restTime: number; // in seconds
  maxScore: number; // point gap for victory
  maxGamjeom: number; // fault limit
  totalRounds: number;
}

export interface ScoreboardState {
  chungScore: number;
  hongScore: number;
  chungGamjeom: number;
  hongGamjeom: number;
  currentRound: number;
  timeRemaining: number;
  isRunning: boolean;
  isResting: boolean;
  matchEnded: boolean;
  winner: 'chung' | 'hong' | null;
}

const defaultSettings: ScoreboardSettings = {
  roundTime: 120,
  restTime: 60,
  maxScore: 20,
  maxGamjeom: 10,
  totalRounds: 3,
};

export const useScoreboard = (initialSettings?: Partial<ScoreboardSettings>) => {
  const [settings, setSettings] = useState<ScoreboardSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  const [state, setState] = useState<ScoreboardState>({
    chungScore: 0,
    hongScore: 0,
    chungGamjeom: 0,
    hongGamjeom: 0,
    currentRound: 1,
    timeRemaining: settings.roundTime,
    isRunning: false,
    isResting: false,
    matchEnded: false,
    winner: null,
  });

  const timerRef = useRef<number | null>(null);
  const tenSecondAlertRef = useRef(false);

  // Check for victory conditions
  const checkVictory = useCallback((newState: ScoreboardState): ScoreboardState => {
    const scoreDiff = Math.abs(newState.chungScore - newState.hongScore);
    
    // Point gap victory
    if (scoreDiff >= settings.maxScore) {
      return {
        ...newState,
        matchEnded: true,
        isRunning: false,
        winner: newState.chungScore > newState.hongScore ? 'chung' : 'hong',
      };
    }

    // Gamjeom limit
    if (newState.chungGamjeom >= settings.maxGamjeom) {
      return {
        ...newState,
        matchEnded: true,
        isRunning: false,
        winner: 'hong',
      };
    }

    if (newState.hongGamjeom >= settings.maxGamjeom) {
      return {
        ...newState,
        matchEnded: true,
        isRunning: false,
        winner: 'chung',
      };
    }

    return newState;
  }, [settings.maxScore, settings.maxGamjeom]);

  // Scoring functions
  const addPoints = useCallback((fighter: 'chung' | 'hong', points: number) => {
    playScoreBeep();
    setState(prev => {
      const newState = {
        ...prev,
        [`${fighter}Score`]: prev[`${fighter}Score` as keyof ScoreboardState] as number + points,
      } as ScoreboardState;
      return checkVictory(newState);
    });
  }, [checkVictory]);

  const addGamjeom = useCallback((fighter: 'chung' | 'hong') => {
    playFaultBeep();
    setState(prev => {
      const opponent = fighter === 'chung' ? 'hong' : 'chung';
      const newState = {
        ...prev,
        [`${fighter}Gamjeom`]: (prev[`${fighter}Gamjeom` as keyof ScoreboardState] as number) + 1,
        [`${opponent}Score`]: (prev[`${opponent}Score` as keyof ScoreboardState] as number) + 1,
      } as ScoreboardState;
      return checkVictory(newState);
    });
  }, [checkVictory]);

  // Timer control
  const toggleTimer = useCallback(() => {
    setState(prev => {
      if (!prev.isRunning && !prev.matchEnded) {
        playRoundStartBeep();
      }
      return { ...prev, isRunning: !prev.isRunning && !prev.matchEnded };
    });
  }, []);

  const resetRound = useCallback(() => {
    tenSecondAlertRef.current = false;
    setState(prev => ({
      ...prev,
      chungScore: 0,
      hongScore: 0,
      chungGamjeom: 0,
      hongGamjeom: 0,
      timeRemaining: settings.roundTime,
      isRunning: false,
      isResting: false,
      matchEnded: false,
      winner: null,
    }));
  }, [settings.roundTime]);

  const resetMatch = useCallback(() => {
    tenSecondAlertRef.current = false;
    setState({
      chungScore: 0,
      hongScore: 0,
      chungGamjeom: 0,
      hongGamjeom: 0,
      currentRound: 1,
      timeRemaining: settings.roundTime,
      isRunning: false,
      isResting: false,
      matchEnded: false,
      winner: null,
    });
  }, [settings.roundTime]);

  const nextRound = useCallback(() => {
    tenSecondAlertRef.current = false;
    setState(prev => {
      if (prev.currentRound >= settings.totalRounds) {
        // Match ended, determine winner by score
        return {
          ...prev,
          matchEnded: true,
          isRunning: false,
          winner: prev.chungScore > prev.hongScore ? 'chung' : 
                  prev.hongScore > prev.chungScore ? 'hong' : null,
        };
      }
      return {
        ...prev,
        currentRound: prev.currentRound + 1,
        timeRemaining: settings.roundTime,
        isResting: false,
        isRunning: false,
      };
    });
  }, [settings.totalRounds, settings.roundTime]);

  // Timer effect
  useEffect(() => {
    if (state.isRunning && !state.matchEnded) {
      timerRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            playRoundEndBeep();
            
            if (prev.isResting) {
              // Rest period ended, start next round
              tenSecondAlertRef.current = false;
              return {
                ...prev,
                timeRemaining: settings.roundTime,
                isResting: false,
                isRunning: false,
              };
            } else {
              // Round ended
              if (prev.currentRound >= settings.totalRounds) {
                // Match ended
                return {
                  ...prev,
                  timeRemaining: 0,
                  isRunning: false,
                  matchEnded: true,
                  winner: prev.chungScore > prev.hongScore ? 'chung' : 
                          prev.hongScore > prev.chungScore ? 'hong' : null,
                };
              }
              // Start rest period
              tenSecondAlertRef.current = false;
              return {
                ...prev,
                timeRemaining: settings.restTime,
                isResting: true,
              };
            }
          }

          // 10 second warning
          if (prev.timeRemaining === 11 && !tenSecondAlertRef.current) {
            tenSecondAlertRef.current = true;
            playTenSecondWarning();
          }

          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRunning, state.matchEnded, settings.roundTime, settings.restTime, settings.totalRounds]);

  const updateSettings = useCallback((newSettings: Partial<ScoreboardSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    state,
    settings,
    addPoints,
    addGamjeom,
    toggleTimer,
    resetRound,
    resetMatch,
    nextRound,
    updateSettings,
  };
};
