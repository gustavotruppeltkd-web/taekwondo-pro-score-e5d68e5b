import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  activeAxisButtons,
  activeAxisInputs,
  axisButtonIndex,
  hatButtonIndex,
  decodeHatButtons,
  AXIS_BUTTON_BASE,
  useGamepad,
  defaultMapping,
  GamepadMapping,
} from "./useGamepad";

describe("activeAxisButtons — axis to virtual button mapping", () => {
  it("returns nothing when all axes are centered (standard pad at rest)", () => {
    expect(activeAxisButtons([0, 0, 0, 0])).toEqual([]);
    expect(activeAxisButtons([0.1, -0.2, 0.05, 0])).toEqual([]);
  });

  it("maps a fully pushed axis to its negative/positive virtual button", () => {
    expect(activeAxisButtons([-1])).toEqual([axisButtonIndex(0, false)]);
    expect(activeAxisButtons([1])).toEqual([axisButtonIndex(0, true)]);
    // a hat on axis 9 (common on generic pads): up = -1
    expect(activeAxisButtons([0, 0, 0, 0, 0, 0, 0, 0, 0, -1])).toEqual([AXIS_BUTTON_BASE + 9 * 2]);
  });

  it("respects the threshold (small movements are ignored)", () => {
    expect(activeAxisButtons([0.5])).toEqual([]);
    expect(activeAxisButtons([0.7])).toEqual([axisButtonIndex(0, true)]);
  });

  it("ignores out-of-range hat 'neutral' values (e.g. ~1.28)", () => {
    expect(activeAxisButtons([1.2857])).toEqual([]);
    expect(activeAxisButtons([-1.2857])).toEqual([]);
  });

  it("virtual button indices never collide with real button indices", () => {
    // real buttons are 0..~17; virtual base is well above that
    expect(AXIS_BUTTON_BASE).toBeGreaterThan(50);
    expect(axisButtonIndex(0, false)).toBe(AXIS_BUTTON_BASE);
  });
});

describe("decodeHatButtons — D-pad hat decoding", () => {
  it("decodes the 4 cardinal directions", () => {
    expect(decodeHatButtons(9, -1)).toEqual([hatButtonIndex(9, 0)]); // up
    expect(decodeHatButtons(9, 0.143)).toEqual([hatButtonIndex(9, 2)]); // down
    expect(decodeHatButtons(9, 0.714)).toEqual([hatButtonIndex(9, 3)]); // left
    expect(decodeHatButtons(9, -0.428)).toEqual([hatButtonIndex(9, 1)]); // right
  });

  it("decodes diagonals into two directions", () => {
    expect(decodeHatButtons(9, -0.714)).toEqual([hatButtonIndex(9, 0), hatButtonIndex(9, 1)]); // up+right
    expect(decodeHatButtons(9, 1)).toEqual([hatButtonIndex(9, 0), hatButtonIndex(9, 3)]); // up+left
  });
});

describe("activeAxisInputs — hats vs analog sticks", () => {
  it("treats an axis as a hat once it rests out of range, then decodes directions", () => {
    const hatAxes = new Set<number>();
    // Frame 1: hat idle at ~1.286 on axis 9 -> learned as a hat, no direction
    expect(activeAxisInputs([0, 0, 0, 0, 0, 0, 0, 0, 0, 1.2857], hatAxes)).toEqual([]);
    expect(hatAxes.has(9)).toBe(true);
    // Frame 2: D-pad Up (-1) -> decoded direction, NOT a raw analog neg
    expect(activeAxisInputs([0, 0, 0, 0, 0, 0, 0, 0, 0, -1], hatAxes)).toEqual([hatButtonIndex(9, 0)]);
  });

  it("keeps analog sticks as simple pos/neg (never learned as hats)", () => {
    const hatAxes = new Set<number>();
    expect(activeAxisInputs([-1, 0, 0, 0], hatAxes)).toEqual([axisButtonIndex(0, false)]);
    expect(hatAxes.size).toBe(0);
  });
});

// --- Consensus with two controllers (the tricky part: they can have totally
// different button layouts). We fake the Gamepad API + timers so we can drive
// the poll loop frame by frame. ---
describe("useGamepad — consensus across differently-mapped controllers", () => {
  // A minimal, mutable fake gamepad.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeGamepad = (index: number, id: string): any => ({
    index,
    id,
    mapping: "standard",
    connected: true,
    buttons: Array.from({ length: 18 }, () => ({ pressed: false, touched: false, value: 0 })),
    axes: [0, 0, 0, 0],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pads: any[] = [];
  const press = (pad: number, btn: number) => { pads[pad].buttons[btn].pressed = true; };
  const frame = () => act(() => { vi.advanceTimersByTime(20); }); // fire one animation frame

  beforeEach(() => {
    pads = [];
    Object.defineProperty(navigator, "getGamepads", { configurable: true, value: () => pads });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).getGamepads;
  });

  it("scores when both controllers trigger the SAME action via DIFFERENT buttons", () => {
    const onChungPlus2 = vi.fn();
    // iPega: "+2 Azul" mapped to button 2. PS5: not in mappings -> default (chungPlus2 = 4 = L1).
    const mappings: Record<string, GamepadMapping> = { ipega: { ...defaultMapping, chungPlus2: 16 } };

    pads = [makeGamepad(0, "ipega"), makeGamepad(1, "ps5")];
    renderHook(() => useGamepad(mappings, { onChungPlus2 }));
    frame(); // initial poll: two controllers detected

    press(0, 16); // referee A: iPega's mapped +2 button
    frame();
    expect(onChungPlus2).not.toHaveBeenCalled(); // one vote only — not enough

    press(1, 4); // referee B: PS5's default +2 (L1)
    frame();
    expect(onChungPlus2).toHaveBeenCalledTimes(1); // consensus reached ✅
  });

  it("does NOT score when only one controller presses (consensus window expires)", () => {
    const onChungPlus2 = vi.fn();
    const mappings: Record<string, GamepadMapping> = { ipega: { ...defaultMapping, chungPlus2: 16 } };

    pads = [makeGamepad(0, "ipega"), makeGamepad(1, "ps5")];
    renderHook(() => useGamepad(mappings, { onChungPlus2 }));
    frame();

    press(0, 16);
    frame();
    act(() => { vi.advanceTimersByTime(2500); }); // let the ~2s window expire
    press(1, 4);
    frame();
    expect(onChungPlus2).not.toHaveBeenCalled();
  });

  it("non-consensus actions (start/pause) fire from a single controller even with two connected", () => {
    const onStartPause = vi.fn();
    pads = [makeGamepad(0, "ipega"), makeGamepad(1, "ps5")];
    renderHook(() => useGamepad({}, { onStartPause })); // both use default; startPause = R3 (11)
    frame();

    press(0, 11);
    frame();
    expect(onStartPause).toHaveBeenCalledTimes(1);
  });
});
