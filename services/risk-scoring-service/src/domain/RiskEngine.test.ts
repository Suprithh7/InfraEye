import test from "node:test";
import assert from "node:assert/strict";
import { scoreRisk } from "./RiskEngine.js";

test("scoreRisk produces elevated risk for severe signals", () => {
  const result = scoreRisk({
    crackCount: 15,
    spallAreaRatio: 0.22,
    leaningSeverity: 0.4,
    rainfallMm7d: 92,
    opticalDelta: 0.32,
    sarDelta: 0.18,
    structureAgeYears: 28,
    inspectionGapDays: 64,
    hasPartialCoverage: false,
  });

  assert.equal(result.reinspectionIntervalDays, 5);
  assert.ok(result.riskProbability > 0.8);
});

