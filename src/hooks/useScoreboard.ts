import { useState, useCallback, useEffect, useRef } from 'react';
import { playRoundStartBeep, playRoundEndBeep, playTenSecondWarning, playScoreBeep, playFaultBeep } from './useAudio';
import { PointEntry } from '@/components/PointHistorySidebar';

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

export interface RoundSnapshot {
  chung: FighterScore;
  hong: FighterScore;
  currentRound: number;
  roundResults: Array<'chung' | 'hong' | null>;
  chungHistory: PointEntry[];
  hongHistory: PointEntry[];
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
  isSubtractMode: boolean;
  chungHistory: PointEntry[];
  hongHistory: PointEntry[];
  previousRoundSnapshot: RoundSnapshot | null;
}

const defaultSettings: ScoreboardSettings = {
  roundTime: 120,
  restTime: 60,
  maxScore: 15,
  maxGamjeom: 5,
  totalRounds: 3,
  chungName: '',
  hongName: '',
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
    isSubtractMode: false,
    chungHistory: [],
    hongHistory: [],
    previousRoundSnapshot: null,
  });

  const timerRef = useRef<number | null>(null);
  const tenSecondAlertRef = useRef(false);

  // Toggle subtract mode
  const toggleSubtractMode = useCallback(() => {
    setState(prev => ({ ...prev, isSubtractMode: !prev.isSubtractMode }));
  }, []);

  // Set subtract mode (for hold behavior)
  const setSubtractMode = useCallback((active: boolean) => {
    setState(prev => ({ ...prev, isSubtractMode: active }));
  }, []);

  // Adjust time manually
  const adjustTime = useCallback((seconds: number) => {
    setState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, prev.timeRemaining + seconds),
    }));
  }, []);

  // Revert to previous round
  const revertToPreviousRound = useCallback(() => {
    setState(prev => {
      if (!prev.previousRoundSnapshot) return prev;

      const snapshot = prev.previousRoundSnapshot;
      tenSecondAlertRef.current = false;

      return {
        ...prev,
        chung: { ...snapshot.chung },
        hong: { ...snapshot.hong },
        currentRound: snapshot.currentRound,
        roundResults: [...snapshot.roundResults],
        chungHistory: [...snapshot.chungHistory],
        hongHistory: [...snapshot.hongHistory],
        timeRemaining: settings.roundTime,
        isRunning: false,
        isResting: false,
        roundWinner: null,
        showRoundWinner: false,
        showDecisionModal: false,
        matchEnded: false,
        matchWinner: null,
        previousRoundSnapshot: null,
      };
    });
  }, [settings.roundTime]);

  // Handle referee decision for tie
  const handleRefereeDecision = useCallback((winner: 'chung' | 'hong') => {
    setState(prev => {
      // Save snapshot before changing round
      const snapshot: RoundSnapshot = {
        chung: { ...prev.chung },
        hong: { ...prev.hong },
        currentRound: prev.currentRound,
        roundResults: [...prev.roundResults],
        chungHistory: [...prev.chungHistory],
        hongHistory: [...prev.hongHistory],
      };

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
          previousRoundSnapshot: snapshot,
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
          previousRoundSnapshot: snapshot,
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
        previousRoundSnapshot: snapshot,
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

    // Save snapshot before changing round
    const snapshot: RoundSnapshot = {
      chung: { ...chung },
      hong: { ...hong },
      currentRound,
      roundResults: [...currentState.roundResults],
      chungHistory: [...currentState.chungHistory],
      hongHistory: [...currentState.hongHistory],
    };

    // Check for tie - apply tiebreaker criteria
    if (chung.score === hong.score) {
      // Tiebreaker order: 1) double of 3, 2) double of 2, 3) 3 points, 4) 2 points
      const chungHistory = currentState.chungHistory;
      const hongHistory = currentState.hongHistory;

      const countEntries = (history: typeof chungHistory, value: number, isDouble: boolean) =>
        history.filter(e => e.type === 'score' && e.value === value && (isDouble ? e.isDouble === true : !e.isDouble)).length;

      const tiebreakers = [
        { value: 3, isDouble: true },   // Dobro de 3
        { value: 2, isDouble: true },   // Dobro de 2
        { value: 3, isDouble: false },  // 3 pontos
        { value: 2, isDouble: false },  // 2 pontos
      ];

      let tieWinner: 'chung' | 'hong' | null = null;
      for (const tb of tiebreakers) {
        const chungCount = countEntries(chungHistory, tb.value, tb.isDouble);
        const hongCount = countEntries(hongHistory, tb.value, tb.isDouble);
        if (chungCount > hongCount) { tieWinner = 'chung'; break; }
        if (hongCount > chungCount) { tieWinner = 'hong'; break; }
      }

      if (!tieWinner) {
        // No tiebreaker resolved - show decision modal
        return {
          ...currentState,
          isRunning: false,
          showDecisionModal: true,
          previousRoundSnapshot: snapshot,
        };
      }

      // Tiebreaker resolved automatically
      const newChungTie = { ...chung };
      const newHongTie = { ...hong };
      const newResultsTie = [...currentState.roundResults];

      if (tieWinner === 'chung') {
        newChungTie.roundsWon += 1;
      } else {
        newHongTie.roundsWon += 1;
      }
      newResultsTie[currentRound - 1] = tieWinner;

      const roundsToWin = Math.ceil(settings.totalRounds / 2);

      if (newChungTie.roundsWon >= roundsToWin || newHongTie.roundsWon >= roundsToWin) {
        return {
          ...currentState,
          chung: newChungTie,
          hong: newHongTie,
          roundResults: newResultsTie,
          isRunning: false,
          matchEnded: true,
          roundWinner: tieWinner,
          matchWinner: tieWinner,
          showRoundWinner: true,
          previousRoundSnapshot: snapshot,
        };
      }

      return {
        ...currentState,
        chung: newChungTie,
        hong: newHongTie,
        roundResults: newResultsTie,
        isRunning: true,
        isResting: true,
        timeRemaining: settings.restTime,
        roundWinner: tieWinner,
        showRoundWinner: true,
        previousRoundSnapshot: snapshot,
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
        previousRoundSnapshot: snapshot,
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
        previousRoundSnapshot: snapshot,
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
      previousRoundSnapshot: snapshot,
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
      const snapshot: RoundSnapshot = {
        chung: { ...chung },
        hong: { ...hong },
        currentRound,
        roundResults: [...newState.roundResults],
        chungHistory: [...newState.chungHistory],
        hongHistory: [...newState.hongHistory],
      };

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
          previousRoundSnapshot: snapshot,
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
        previousRoundSnapshot: snapshot,
      };
    }

    if (hong.gamjeom >= settings.maxGamjeom) {
      const snapshot: RoundSnapshot = {
        chung: { ...chung },
        hong: { ...hong },
        currentRound,
        roundResults: [...newState.roundResults],
        chungHistory: [...newState.chungHistory],
        hongHistory: [...newState.hongHistory],
      };

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
          previousRoundSnapshot: snapshot,
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
        previousRoundSnapshot: snapshot,
      };
    }

    return newState;
  }, [settings.maxScore, settings.maxGamjeom, settings.totalRounds, settings.restTime, endRound]);

  // Double last point
  const doubleLastPoint = useCallback((fighter: 'chung' | 'hong') => {
    if (state.matchEnded || state.isResting) return;

    setState(prev => {
      const historyKey = fighter === 'chung' ? 'chungHistory' : 'hongHistory';
      const history = prev[historyKey];

      const lastScoreEntry = [...history].reverse().find(e => e.type === 'score' && e.value > 0);
      if (!lastScoreEntry) return prev;

      const doubleValue = lastScoreEntry.value;
      const newScore = Math.max(0, prev[fighter].score + doubleValue);
      const newHistory = [
        ...history,
        { value: doubleValue, type: 'score' as const, timestamp: Date.now(), isDouble: true }
      ];

      playScoreBeep();

      const newState = {
        ...prev,
        [fighter]: { ...prev[fighter], score: newScore },
        [historyKey]: newHistory,
      };
      return checkImmediateVictory(newState);
    });
  }, [checkImmediateVictory, state.matchEnded, state.isResting]);

  // Scoring functions with subtract mode support
  const addPoints = useCallback((fighter: 'chung' | 'hong', points: number) => {
    if (state.matchEnded || state.isResting) return;

    const actualPoints = state.isSubtractMode ? -points : points;
    playScoreBeep();

    setState(prev => {
      const newScore = Math.max(0, prev[fighter].score + actualPoints);
      const historyKey = fighter === 'chung' ? 'chungHistory' : 'hongHistory';
      const newHistory = [
        ...prev[historyKey],
        { value: actualPoints, type: 'score' as const, timestamp: Date.now() }
      ];

      const newState = {
        ...prev,
        [fighter]: { ...prev[fighter], score: newScore },
        [historyKey]: newHistory,
      };
      return checkImmediateVictory(newState);
    });
  }, [checkImmediateVictory, state.matchEnded, state.isResting, state.isSubtractMode]);

  const addGamjeom = useCallback((fighter: 'chung' | 'hong') => {
    if (state.matchEnded || state.isResting) return;
    playFaultBeep();

    setState(prev => {
      const opponent = fighter === 'chung' ? 'hong' : 'chung';

      if (prev.isSubtractMode) {
        // Subtract gamjeom (correction)
        const newGamjeom = Math.max(0, prev[fighter].gamjeom - 1);
        const opponentScore = Math.max(0, prev[opponent].score - 1);
        const historyKey = fighter === 'chung' ? 'chungHistory' : 'hongHistory';
        const newHistory = [
          ...prev[historyKey],
          { value: -1, type: 'gamjeom' as const, timestamp: Date.now() }
        ];

        return {
          ...prev,
          [fighter]: { ...prev[fighter], gamjeom: newGamjeom },
          [opponent]: { ...prev[opponent], score: opponentScore },
          [historyKey]: newHistory,
        };
      }

      // Add gamjeom normally
      const historyKey = fighter === 'chung' ? 'chungHistory' : 'hongHistory';
      const opponentHistoryKey = opponent === 'chung' ? 'chungHistory' : 'hongHistory';

      const newState = {
        ...prev,
        [fighter]: { ...prev[fighter], gamjeom: prev[fighter].gamjeom + 1 },
        [opponent]: { ...prev[opponent], score: prev[opponent].score + 1 },
        [historyKey]: [
          ...prev[historyKey],
          { value: 1, type: 'gamjeom' as const, timestamp: Date.now() }
        ],
        [opponentHistoryKey]: [
          ...prev[opponentHistoryKey],
          { value: 1, type: 'score' as const, timestamp: Date.now() }
        ],
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
      chungHistory: [],
      hongHistory: [],
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
      isSubtractMode: false,
      chungHistory: [],
      hongHistory: [],
      previousRoundSnapshot: null,
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
      chungHistory: [],
      hongHistory: [],
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
                chungHistory: [],
                hongHistory: [],
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

  // Update settings and auto-restart round
  const updateSettings = useCallback((newSettings: Partial<ScoreboardSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Auto-restart current round when settings are saved
    tenSecondAlertRef.current = false;
    setState(prev => ({
      ...prev,
      chung: { ...prev.chung, score: 0, gamjeom: 0 },
      hong: { ...prev.hong, score: 0, gamjeom: 0 },
      timeRemaining: newSettings.roundTime || settings.roundTime,
      isRunning: false,
      isResting: false,
      roundWinner: null,
      showRoundWinner: false,
      showDecisionModal: false,
      chungHistory: [],
      hongHistory: [],
    }));
  }, [settings.roundTime]);

  return {
    state,
    settings,
    addPoints,
    addGamjeom,
    doubleLastPoint,
    toggleTimer,
    resetRound,
    resetMatch,
    nextRound,
    updateSettings,
    handleRefereeDecision,
    dismissRoundWinner,
    toggleSubtractMode,
    setSubtractMode,
    adjustTime,
    revertToPreviousRound,
    canDouble: (fighter: 'chung' | 'hong') => {
      const history = state[fighter === 'chung' ? 'chungHistory' : 'hongHistory'];
      if (history.length === 0) return false;
      const lastEntry = history[history.length - 1];
      return lastEntry.type === 'score' && (lastEntry.value === 2 || lastEntry.value === 3) && !lastEntry.isDouble;
    },
  };
};
