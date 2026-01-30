import { useState, useCallback, useEffect, useRef } from 'react';
import { playRoundStartBeep, playRoundEndBeep, playTenSecondWarning, playScoreBeep, playFaultBeep } from './useAudio';

export interface ScoreboardSettings {
  roundTime: number;
  restTime: number;
  maxScore: number;
  maxGamjeom: number;
  totalRounds: number;
  chungName: string;
  hongName: string;
}

export interface FighterScore {
  score: number;
  gamjeom: number;
  roundsWon: number;
}

export interface ScoreboardState {
  chung: FighterScore;
  hong: FighterScore;
  currentRound: number;
  timeRemaining: number;
  isRunning: boolean;
  isResting: boolean;
  matchEnded: boolean;
  roundWinner: 'chung' | 'hong' | null;
  matchWinner: 'chung' | 'hong' | null;
  showRoundWinner: boolean;
  showDecisionModal: boolean;
  roundResults: Array<'chung' | 'hong' | null>;
}

const defaultSettings: ScoreboardSettings = {
  roundTime: 120,
  restTime: 60,
  maxScore: 20,
  maxGamjeom: 10,
  totalRounds: 3,
  chungName: 'Atleta Azul',
  hongName: 'Atleta Vermelho',
};

const initialFighterScore: FighterScore = {
  score: 0,
  gamjeom: 0,
  roundsWon: 0,
};

export const useScoreboard = (initialSettings?: Partial<ScoreboardSettings>) => {
  const [settings, setSettings] = useState<ScoreboardSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  const [state, setState] = useState<ScoreboardState>({
    chung: { ...initialFighterScore },
    hong: { ...initialFighterScore },
    currentRound: 1,
    timeRemaining: settings.roundTime,
    isRunning: false,
    isResting: false,
    matchEnded: false,
    roundWinner: null,
    matchWinner: null,
    showRoundWinner: false,
    showDecisionModal: false,
    roundResults: [],
  });

  const timerRef = useRef<number | null>(null);
  const tenSecondAlertRef = useRef(false);

  // Handle referee decision for tie
  const handleRefereeDecision = useCallback((winner: 'chung' | 'hong') => {
    setState(prev => {
      const newChung = { ...prev.chung };
      const newHong = { ...prev.hong };
      const newResults = [...prev.roundResults];
      
      if (winner === 'chung') {
        newChung.roundsWon += 1;
      } else {
        newHong.roundsWon += 1;
      }
      
      newResults[prev.currentRound - 1] = winner;
      
      const roundsToWin = Math.ceil(settings.totalRounds / 2);
      
      // Check for match winner
      if (newChung.roundsWon >= roundsToWin) {
        return {
          ...prev,
          chung: newChung,
          hong: newHong,
          roundResults: newResults,
          showDecisionModal: false,
          showRoundWinner: true,
          roundWinner: winner,
          matchEnded: true,
          matchWinner: 'chung',
        };
      }
      if (newHong.roundsWon >= roundsToWin) {
        return {
          ...prev,
          chung: newChung,
          hong: newHong,
          roundResults: newResults,
          showDecisionModal: false,
          showRoundWinner: true,
          roundWinner: winner,
          matchEnded: true,
          matchWinner: 'hong',
        };
      }
      
      // More rounds to go
      return {
        ...prev,
        chung: newChung,
        hong: newHong,
        roundResults: newResults,
        showDecisionModal: false,
        showRoundWinner: true,
        roundWinner: winner,
        isResting: true,
        isRunning: true,
        timeRemaining: settings.restTime,
      };
    });
  }, [settings.totalRounds, settings.restTime]);

  // Dismiss round winner banner and proceed
  const dismissRoundWinner = useCallback(() => {
    setState(prev => ({
      ...prev,
      showRoundWinner: false,
    }));
  }, []);

  // End current round and update state
  const endRound = useCallback((currentState: ScoreboardState): ScoreboardState => {
    const { chung, hong, currentRound } = currentState;
    
    // Check for tie
    if (chung.score === hong.score) {
      return {
        ...currentState,
        isRunning: false,
        showDecisionModal: true,
      };
    }
    
    const roundWinner = chung.score > hong.score ? 'chung' : 'hong';
    const newChung = { ...chung };
    const newHong = { ...hong };
    const newResults = [...currentState.roundResults];
    
    if (roundWinner === 'chung') {
      newChung.roundsWon += 1;
    } else {
      newHong.roundsWon += 1;
    }
    
    newResults[currentRound - 1] = roundWinner;
    
    const roundsToWin = Math.ceil(settings.totalRounds / 2);
    
    // Check for match winner
    if (newChung.roundsWon >= roundsToWin) {
      return {
        ...currentState,
        chung: newChung,
        hong: newHong,
        roundResults: newResults,
        isRunning: false,
        matchEnded: true,
        roundWinner,
        matchWinner: 'chung',
        showRoundWinner: true,
      };
    }
    if (newHong.roundsWon >= roundsToWin) {
      return {
        ...currentState,
        chung: newChung,
        hong: newHong,
        roundResults: newResults,
        isRunning: false,
        matchEnded: true,
        roundWinner,
        matchWinner: 'hong',
        showRoundWinner: true,
      };
    }
    
    // More rounds to go
    return {
      ...currentState,
      chung: newChung,
      hong: newHong,
      roundResults: newResults,
      isRunning: true,
      isResting: true,
      timeRemaining: settings.restTime,
      roundWinner,
      showRoundWinner: true,
    };
  }, [settings.totalRounds, settings.restTime]);

  // Check for immediate victory conditions
  const checkImmediateVictory = useCallback((newState: ScoreboardState): ScoreboardState => {
    const { chung, hong, currentRound } = newState;
    const scoreDiff = Math.abs(chung.score - hong.score);
    
    // Point gap victory
    if (scoreDiff >= settings.maxScore) {
      return endRound({
        ...newState,
        timeRemaining: 0,
      });
    }

    // Gamjeom limit - opponent wins the round
    if (chung.gamjeom >= settings.maxGamjeom) {
      const newHong = { ...hong, roundsWon: hong.roundsWon + 1 };
      const newResults = [...newState.roundResults];
      newResults[currentRound - 1] = 'hong';
      
      const roundsToWin = Math.ceil(settings.totalRounds / 2);
      if (newHong.roundsWon >= roundsToWin) {
        return {
          ...newState,
          hong: newHong,
          roundResults: newResults,
          isRunning: false,
          matchEnded: true,
          roundWinner: 'hong',
          matchWinner: 'hong',
          showRoundWinner: true,
        };
      }
      return {
        ...newState,
        hong: newHong,
        roundResults: newResults,
        isRunning: true,
        isResting: true,
        timeRemaining: settings.restTime,
        roundWinner: 'hong',
        showRoundWinner: true,
      };
    }

    if (hong.gamjeom >= settings.maxGamjeom) {
      const newChung = { ...chung, roundsWon: chung.roundsWon + 1 };
      const newResults = [...newState.roundResults];
      newResults[currentRound - 1] = 'chung';
      
      const roundsToWin = Math.ceil(settings.totalRounds / 2);
      if (newChung.roundsWon >= roundsToWin) {
        return {
          ...newState,
          chung: newChung,
          roundResults: newResults,
          isRunning: false,
          matchEnded: true,
          roundWinner: 'chung',
          matchWinner: 'chung',
          showRoundWinner: true,
        };
      }
      return {
        ...newState,
        chung: newChung,
        roundResults: newResults,
        isRunning: true,
        isResting: true,
        timeRemaining: settings.restTime,
        roundWinner: 'chung',
        showRoundWinner: true,
      };
    }

    return newState;
  }, [settings.maxScore, settings.maxGamjeom, settings.totalRounds, settings.restTime, endRound]);

  // Scoring functions
  const addPoints = useCallback((fighter: 'chung' | 'hong', points: number) => {
    if (state.matchEnded || state.isResting) return;
    playScoreBeep();
    setState(prev => {
      const newState = {
        ...prev,
        [fighter]: { ...prev[fighter], score: prev[fighter].score + points },
      };
      return checkImmediateVictory(newState);
    });
  }, [checkImmediateVictory, state.matchEnded, state.isResting]);

  const addGamjeom = useCallback((fighter: 'chung' | 'hong') => {
    if (state.matchEnded || state.isResting) return;
    playFaultBeep();
    setState(prev => {
      const opponent = fighter === 'chung' ? 'hong' : 'chung';
      const newState = {
        ...prev,
        [fighter]: { ...prev[fighter], gamjeom: prev[fighter].gamjeom + 1 },
        [opponent]: { ...prev[opponent], score: prev[opponent].score + 1 },
      };
      return checkImmediateVictory(newState);
    });
  }, [checkImmediateVictory, state.matchEnded, state.isResting]);

  // Timer control
  const toggleTimer = useCallback(() => {
    setState(prev => {
      if (prev.matchEnded) return prev;
      if (!prev.isRunning) {
        playRoundStartBeep();
      }
      return { ...prev, isRunning: !prev.isRunning };
    });
  }, []);

  const resetRound = useCallback(() => {
    tenSecondAlertRef.current = false;
    setState(prev => ({
      ...prev,
      chung: { ...prev.chung, score: 0, gamjeom: 0 },
      hong: { ...prev.hong, score: 0, gamjeom: 0 },
      timeRemaining: settings.roundTime,
      isRunning: false,
      isResting: false,
      roundWinner: null,
      showRoundWinner: false,
      showDecisionModal: false,
    }));
  }, [settings.roundTime]);

  const resetMatch = useCallback(() => {
    tenSecondAlertRef.current = false;
    setState({
      chung: { ...initialFighterScore },
      hong: { ...initialFighterScore },
      currentRound: 1,
      timeRemaining: settings.roundTime,
      isRunning: false,
      isResting: false,
      matchEnded: false,
      roundWinner: null,
      matchWinner: null,
      showRoundWinner: false,
      showDecisionModal: false,
      roundResults: [],
    });
  }, [settings.roundTime]);

  const nextRound = useCallback(() => {
    tenSecondAlertRef.current = false;
    setState(prev => ({
      ...prev,
      chung: { ...prev.chung, score: 0, gamjeom: 0 },
      hong: { ...prev.hong, score: 0, gamjeom: 0 },
      currentRound: prev.currentRound + 1,
      timeRemaining: settings.roundTime,
      isResting: false,
      isRunning: false,
      roundWinner: null,
      showRoundWinner: false,
    }));
  }, [settings.roundTime]);

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
                chung: { ...prev.chung, score: 0, gamjeom: 0 },
                hong: { ...prev.hong, score: 0, gamjeom: 0 },
                currentRound: prev.currentRound + 1,
                timeRemaining: settings.roundTime,
                isResting: false,
                isRunning: false,
                roundWinner: null,
                showRoundWinner: false,
              };
            } else {
              // Round ended by time
              tenSecondAlertRef.current = false;
              return endRound(prev);
            }
          }

          // 10 second warning
          if (prev.timeRemaining === 11 && !tenSecondAlertRef.current && !prev.isResting) {
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
  }, [state.isRunning, state.matchEnded, settings.roundTime, settings.restTime, endRound]);

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
    handleRefereeDecision,
    dismissRoundWinner,
  };
};
