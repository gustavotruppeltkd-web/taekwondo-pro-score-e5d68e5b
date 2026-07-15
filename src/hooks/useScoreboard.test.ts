import { describe, it, expect, vi } from "vitest";
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
