import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Silence audio (no AudioContext in jsdom).
vi.mock("./useAudio", () => ({
  playRoundStartBeep: vi.fn(),
  playRoundEndBeep: vi.fn(),
  playTenSecondWarning: vi.fn(),
  playScoreBeep: vi.fn(),
  playFaultBeep: vi.fn(),
}));

import { useScoreboard } from "./useScoreboard";

const scoreEntries = (h: { type: string; value: number }[]) => h.filter((e) => e.type === "score");

describe("useScoreboard — correction (subtract) mode", () => {
  it("normal scoring adds one history entry and increases the score", () => {
    const { result } = renderHook(() => useScoreboard());
    act(() => result.current.addPoints("chung", 2));
    expect(result.current.state.chung.score).toBe(2);
    expect(scoreEntries(result.current.state.chungHistory)).toHaveLength(1);
  });

  it("correction ERASES the matching point (score + history revert, no phantom entry)", () => {
    const { result } = renderHook(() => useScoreboard());
    act(() => result.current.addPoints("chung", 2));
    act(() => result.current.addPoints("chung", 3));
    expect(result.current.state.chung.score).toBe(5);

    act(() => result.current.toggleSubtractMode());
    act(() => result.current.addPoints("chung", 2)); // correct the +2

    expect(result.current.state.chung.score).toBe(3);
    const entries = scoreEntries(result.current.state.chungHistory);
    expect(entries).toHaveLength(1);
    expect(entries[0].value).toBe(3);
    // no negative "soco" phantom entry
    expect(result.current.state.chungHistory.some((e) => e.value < 0)).toBe(false);
  });

  it("removed point no longer counts (tiebreaker input reverts)", () => {
    const { result } = renderHook(() => useScoreboard());
    act(() => result.current.addPoints("chung", 3));
    act(() => result.current.addPoints("chung", 3)); // two 3s
    const countThrees = () =>
      result.current.state.chungHistory.filter((e) => e.type === "score" && e.value === 3 && !e.isDouble).length;
    expect(countThrees()).toBe(2);

    act(() => result.current.toggleSubtractMode());
    act(() => result.current.addPoints("chung", 3)); // erase one 3

    expect(result.current.state.chung.score).toBe(3);
    expect(countThrees()).toBe(1); // the corrected point stopped counting
  });

  it("does nothing when there is no matching point to correct", () => {
    const { result } = renderHook(() => useScoreboard());
    act(() => result.current.addPoints("chung", 1));
    act(() => result.current.toggleSubtractMode());
    act(() => result.current.addPoints("chung", 3)); // no +3 exists
    expect(result.current.state.chung.score).toBe(1);
    expect(scoreEntries(result.current.state.chungHistory)).toHaveLength(1);
  });
});

describe("useScoreboard — saving settings preserves a live match", () => {
  it("does NOT wipe scores/faults/history when settings are saved mid-match", () => {
    const { result } = renderHook(() => useScoreboard());
    act(() => result.current.addPoints("chung", 3));
    act(() => result.current.addGamjeom("hong")); // chung gets a point, hong a fault
    const chungScoreBefore = result.current.state.chung.score;

    act(() => result.current.updateSettings({ chungName: "João", roundTime: 90 }));

    expect(result.current.state.chung.score).toBe(chungScoreBefore);
    expect(result.current.state.hong.gamjeom).toBe(1);
    expect(scoreEntries(result.current.state.chungHistory).length).toBeGreaterThan(0);
    expect(result.current.settings.chungName).toBe("João");
  });

  it("applies the new round time to the clock on a fresh (unstarted) round", () => {
    const { result } = renderHook(() => useScoreboard());
    act(() => result.current.updateSettings({ roundTime: 90 }));
    expect(result.current.state.timeRemaining).toBe(90);
  });
});

describe("useScoreboard — victory conditions", () => {
  it("a point gap of maxScore ends the round for the leader (then rest)", () => {
    const { result } = renderHook(() => useScoreboard()); // maxScore 15, best-of-3
    for (let i = 0; i < 5; i++) act(() => result.current.addPoints("chung", 3));
    expect(result.current.state.chung.score).toBe(15);
    expect(result.current.state.roundWinner).toBe("chung");
    expect(result.current.state.chung.roundsWon).toBe(1);
    expect(result.current.state.isResting).toBe(true);
    expect(result.current.state.matchEnded).toBe(false);
  });

  it("reaching the gam-jeom limit gives the round to the opponent", () => {
    const { result } = renderHook(() => useScoreboard()); // maxGamjeom 5
    for (let i = 0; i < 5; i++) act(() => result.current.addGamjeom("chung"));
    expect(result.current.state.chung.gamjeom).toBe(5);
    expect(result.current.state.roundWinner).toBe("hong");
    expect(result.current.state.hong.roundsWon).toBe(1);
  });

  it("winning enough rounds ends the match", () => {
    const { result } = renderHook(() => useScoreboard());
    for (let i = 0; i < 5; i++) act(() => result.current.addPoints("chung", 3)); // R1
    act(() => result.current.nextRound());
    for (let i = 0; i < 5; i++) act(() => result.current.addPoints("chung", 3)); // R2
    expect(result.current.state.chung.roundsWon).toBe(2);
    expect(result.current.state.matchEnded).toBe(true);
    expect(result.current.state.matchWinner).toBe("chung");
  });
});

describe("useScoreboard — tiebreaker at time-out", () => {
  afterEach(() => vi.useRealTimers());

  it("auto-resolves a tie in favor of who scored more 3-pointers", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useScoreboard({ roundTime: 2 }));
    // 6-6, chung has two 3s, hong has three 2s -> chung wins tiebreaker
    act(() => result.current.addPoints("chung", 3));
    act(() => result.current.addPoints("chung", 3));
    act(() => result.current.addPoints("hong", 2));
    act(() => result.current.addPoints("hong", 2));
    act(() => result.current.addPoints("hong", 2));
    act(() => result.current.toggleTimer());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.state.roundWinner).toBe("chung");
  });

  it("shows the referee decision modal when a tie cannot be broken", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useScoreboard({ roundTime: 2 }));
    // identical scoring on both sides -> unbreakable tie
    act(() => result.current.addPoints("chung", 2));
    act(() => result.current.addPoints("hong", 2));
    act(() => result.current.toggleTimer());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.state.showDecisionModal).toBe(true);
    expect(result.current.state.roundWinner).toBeNull();
  });
});
