import { describe, it, expect } from "vitest";
import { activeAxisButtons, axisButtonIndex, AXIS_BUTTON_BASE } from "./useGamepad";

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
