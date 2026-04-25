export type RiskFeatureVector = {
  crackCount: number;
  spallAreaRatio: number;
  leaningSeverity: number;
  rainfallMm7d: number;
  opticalDelta: number;
  sarDelta: number;
  structureAgeYears: number;
  inspectionGapDays: number;
  hasPartialCoverage: boolean;
};

export type RiskScoreResult = {
  riskProbability: number;
  confidence: number;
  reinspectionIntervalDays: number;
  topContributors: Array<{
    feature: string;
    direction: "increase" | "decrease";
    contribution: number;
  }>;
};

const featureWeights: Record<keyof Omit<RiskFeatureVector, "hasPartialCoverage">, number> = {
  crackCount: 0.06,
  spallAreaRatio: 0.28,
  leaningSeverity: 0.25,
  rainfallMm7d: 0.003,
  opticalDelta: 0.14,
  sarDelta: 0.17,
  structureAgeYears: 0.01,
  inspectionGapDays: 0.003,
};

export function scoreRisk(vector: RiskFeatureVector): RiskScoreResult {
  const raw =
    vector.crackCount * featureWeights.crackCount +
    vector.spallAreaRatio * featureWeights.spallAreaRatio * 10 +
    vector.leaningSeverity * featureWeights.leaningSeverity * 10 +
    vector.rainfallMm7d * featureWeights.rainfallMm7d +
    vector.opticalDelta * featureWeights.opticalDelta * 10 +
    vector.sarDelta * featureWeights.sarDelta * 10 +
    vector.structureAgeYears * featureWeights.structureAgeYears +
    vector.inspectionGapDays * featureWeights.inspectionGapDays +
    (vector.hasPartialCoverage ? 0.08 : 0);

  const probability = Number((1 / (1 + Math.exp(-raw + 2.6))).toFixed(2));
  const confidence = Number(
    Math.max(0.45, 0.94 - (vector.hasPartialCoverage ? 0.14 : 0) - vector.sarDelta * 0.06).toFixed(2),
  );

  const contributors = [
    { feature: "crackCount", value: vector.crackCount * featureWeights.crackCount },
    { feature: "spallAreaRatio", value: vector.spallAreaRatio * featureWeights.spallAreaRatio * 10 },
    { feature: "leaningSeverity", value: vector.leaningSeverity * featureWeights.leaningSeverity * 10 },
    { feature: "rainfallMm7d", value: vector.rainfallMm7d * featureWeights.rainfallMm7d },
    { feature: "opticalDelta", value: vector.opticalDelta * featureWeights.opticalDelta * 10 },
    { feature: "sarDelta", value: vector.sarDelta * featureWeights.sarDelta * 10 },
    { feature: "structureAgeYears", value: vector.structureAgeYears * featureWeights.structureAgeYears },
    { feature: "inspectionGapDays", value: vector.inspectionGapDays * featureWeights.inspectionGapDays },
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((entry) => ({
      feature: entry.feature,
      direction: "increase" as const,
      contribution: Number(entry.value.toFixed(2)),
    }));

  return {
    riskProbability: probability,
    confidence,
    reinspectionIntervalDays: probability > 0.8 ? 5 : probability > 0.6 ? 10 : probability > 0.3 ? 21 : 30,
    topContributors: contributors,
  };
}
