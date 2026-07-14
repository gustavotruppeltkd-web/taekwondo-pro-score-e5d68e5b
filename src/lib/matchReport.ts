/**
 * Pure match-report model and computation — no jsPDF, so it can be unit-tested
 * cheaply and reused independently of PDF rendering.
 */

/**
 * A single scoring/penalty event during a match, tagged with the round and the
 * clock reading (timeRemaining) at the moment it happened. Accumulated across
 * all rounds of one match (survives per-round resets) and discarded when a new
 * match starts. Corrections (subtract mode) are logged as negative values so the
 * running score in the report always matches the real final score.
 */
export interface MatchEvent {
  fighter: 'chung' | 'hong';
  round: number;
  clock: number; // seconds remaining on the round clock when it happened
  value: number; // score delta, or gamjeom count (negative = correction)
  type: 'score' | 'gamjeom';
  isDouble?: boolean;
}

export interface ReportRow {
  clock: number;
  fighter: 'chung' | 'hong';
  event: string;
  chungScore: number;
  hongScore: number;
}

export interface ReportRound {
  round: number;
  winner: 'chung' | 'hong' | null;
  rows: ReportRow[];
}

export interface ComputedReport {
  rounds: ReportRound[];
  totals: {
    chung: { points: number; gamjeoms: number };
    hong: { points: number; gamjeoms: number };
  };
}

export const formatClock = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

export const describeEvent = (e: MatchEvent): string => {
  if (e.type === 'gamjeom') return e.value < 0 ? 'Correção Gam-jeom' : 'Gam-jeom';
  const sign = e.value > 0 ? `+${e.value}` : `${e.value}`;
  return e.isDouble ? `${sign} (dobra)` : sign;
};

/**
 * Replays the event log to reconstruct the running score after each event
 * (grouped by round) and the per-athlete totals. Rules mirror the scoreboard
 * reducer exactly:
 *  - a 'score' event adds its value to its own fighter (clamped at 0);
 *  - a 'gamjeom' event adds its value to the OPPONENT's score (a penalty awards
 *    a point to the other athlete) and counts against the committing fighter.
 */
export const computeMatchReport = (
  log: MatchEvent[],
  roundResults: Array<'chung' | 'hong' | null>
): ComputedReport => {
  const score = { chung: 0, hong: 0 };
  const rounds: ReportRound[] = [];
  const roundNumbers = Array.from(new Set(log.map((e) => e.round))).sort((a, b) => a - b);

  for (const round of roundNumbers) {
    const rows: ReportRow[] = log
      .filter((e) => e.round === round)
      .map((e) => {
        if (e.type === 'score') {
          score[e.fighter] = Math.max(0, score[e.fighter] + e.value);
        } else {
          const opp = e.fighter === 'chung' ? 'hong' : 'chung';
          score[opp] = Math.max(0, score[opp] + e.value);
        }
        return {
          clock: e.clock,
          fighter: e.fighter,
          event: describeEvent(e),
          chungScore: score.chung,
          hongScore: score.hong,
        };
      });
    rounds.push({ round, winner: roundResults[round - 1] ?? null, rows });
  }

  const totalsFor = (f: 'chung' | 'hong') => {
    const opp = f === 'chung' ? 'hong' : 'chung';
    const own = log.filter((e) => e.fighter === f && e.type === 'score').reduce((s, e) => s + e.value, 0);
    const fromGamjeom = log
      .filter((e) => e.fighter === opp && e.type === 'gamjeom')
      .reduce((s, e) => s + e.value, 0);
    const gamjeoms = log.filter((e) => e.fighter === f && e.type === 'gamjeom').reduce((s, e) => s + e.value, 0);
    return { points: Math.max(0, own + fromGamjeom), gamjeoms };
  };

  return { rounds, totals: { chung: totalsFor('chung'), hong: totalsFor('hong') } };
};
