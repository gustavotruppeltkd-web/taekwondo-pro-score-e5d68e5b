import { describe, it, expect } from "vitest";
import {
  activeAxisButtons,
  activeAxisInputs,
  axisButtonIndex,
  hatButtonIndex,
  decodeHatButtons,
  AXIS_BUTTON_BASE,
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
