import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export class DemoDataClient {
  private readonly riskRows = this.loadCsv("risk_scores.csv");

  async getRiskQueue(cityId: string, limit = 50) {
    return this.riskRows
      .filter((row) => row.city_id === cityId)
      .sort((a, b) => Number(b.risk_probability) - Number(a.risk_probability))
      .slice(0, limit)
      .map((row, index) => ({
        structureId: row.structure_id,
        riskProbability: Number(row.risk_probability),
        confidence: Number(row.confidence),
        queueRank: index + 1,
        nextInspectionDueDays: Number(row.reinspection_interval_days),
        topFactors: [row.top_factor_1, row.top_factor_2, row.top_factor_3].filter(Boolean),
      }));
  }

  async getRiskDetail(structureId: string) {
    const row = this.riskRows.find((entry) => entry.structure_id === structureId);
    if (!row) {
      return null;
    }

    return {
      structureId: row.structure_id,
      cityId: row.city_id,
      riskProbability: Number(row.risk_probability),
      confidence: Number(row.confidence),
      reinspectionIntervalDays: Number(row.reinspection_interval_days),
      topContributors: [row.top_factor_1, row.top_factor_2, row.top_factor_3]
        .filter(Boolean)
        .map((feature, index) => ({
          feature,
          direction: "increase",
          contribution: Number((0.3 - index * 0.08).toFixed(2)),
        })),
      evidence: {
        latestInspectionId: "INSP-DEMO-LATEST",
        satelliteStatus: featureIncludes(row.top_factor_1, "partial") ? "partial" : "optical",
        rainfallMm7d: 88,
      },
    };
  }

  async createInspection(payload: JsonValue) {
    return {
      inspectionId: `insp-${Date.now()}`,
      uploadUrl: "https://storage.googleapis.com/slumsafe-demo/upload/session",
      status: "pending_upload",
      payload,
    };
  }

  private loadCsv(fileName: string) {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(currentDir, "..", "..", "..", "data", "demo", fileName), "utf8");
    const [header, ...rows] = raw.trim().split(/\r?\n/);
    const columns = header.split(",");
    return rows.map((line) =>
      Object.fromEntries(line.split(",").map((value, index) => [columns[index], value])),
    );
  }
}

function featureIncludes(value: unknown, expected: string) {
  return typeof value === "string" && value.includes(expected);
}
