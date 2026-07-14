import { describe, it, expect } from "vitest";
import { computeMatchReport, type MatchEvent } from "./matchReport";
import { resolveFighterName } from "./fighterNames";

const ev = (p: Partial<MatchEvent> & Pick<MatchEvent, "fighter" | "value" | "type">): MatchEvent => ({
  round: 1,
  clock: 100,
  ...p,
});

describe("resolveFighterName", () => {
  it("keeps a provided name", () => {
    expect(resolveFighterName("João", "chung")).toBe("João");
    expect(resolveFighterName("  Maria  ", "hong")).toBe("Maria");
  });
  it("falls back to the default label when empty/whitespace", () => {
    expect(resolveFighterName("", "chung")).toBe("Atleta Azul");
    expect(resolveFighterName("   ", "hong")).toBe("Atleta Vermelho");
  });
});

describe("computeMatchReport running score", () => {
  it("adds a score to the scoring fighter", () => {
    const { rounds } = computeMatchReport(
      [ev({ fighter: "chung", value: 2, type: "score" }), ev({ fighter: "hong", value: 3, type: "score" })],
      []
    );
    const rows = rounds[0].rows;
    expect(rows[0]).toMatchObject({ chungScore: 2, hongScore: 0 });
    expect(rows[1]).toMatchObject({ chungScore: 2, hongScore: 3 });
  });

  it("credits a gamjeom as +1 to the OPPONENT", () => {
    const { rounds, totals } = computeMatchReport([ev({ fighter: "chung", value: 1, type: "gamjeom" })], []);
    // chung committed the penalty; hong gets the point
    expect(rounds[0].rows[0]).toMatchObject({ chungScore: 0, hongScore: 1 });
    expect(totals.hong.points).toBe(1);
    expect(totals.chung.gamjeoms).toBe(1);
  });

  it("handles doubles and corrections so the final score stays exact", () => {
    const { rounds } = computeMatchReport(
      [
        ev({ fighter: "chung", value: 2, type: "score" }), // 2-0
        ev({ fighter: "chung", value: 2, type: "score", isDouble: true }), // 4-0
        ev({ fighter: "chung", value: -2, type: "score" }), // correction -> 2-0
      ],
      []
    );
    const rows = rounds[0].rows;
    expect(rows[1]).toMatchObject({ chungScore: 4 });
    expect(rows[2]).toMatchObject({ chungScore: 2 });
  });

  it("carries the running score across multiple rounds", () => {
    const { rounds } = computeMatchReport(
      [
        ev({ round: 1, fighter: "chung", value: 3, type: "score" }),
        ev({ round: 2, fighter: "hong", value: 2, type: "score" }),
      ],
      ["chung", "hong"]
    );
    expect(rounds).toHaveLength(2);
    expect(rounds[0].winner).toBe("chung");
    expect(rounds[1].rows[0]).toMatchObject({ chungScore: 3, hongScore: 2 });
    expect(rounds[1].winner).toBe("hong");
  });

  it("never lets the score go negative", () => {
    const { rounds } = computeMatchReport([ev({ fighter: "chung", value: -5, type: "score" })], []);
    expect(rounds[0].rows[0].chungScore).toBe(0);
  });
});
