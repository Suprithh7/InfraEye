import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;
type CsvRow = Record<string, string>;

type StructureRecord = {
  structureId: string;
  cityId: string;
  locality: string;
  ward: string;
  lat: number;
  lng: number;
  structureAgeYears: number;
  material: string;
  lastInspectionDays: number;
};

type SatelliteRecord = {
  structureId: string;
  opticalDelta: number;
  sarDelta: number;
  coverageStatus: string;
  ndbiDelta: number;
};

type InspectionRecord = {
  inspectionId: string;
  structureId: string;
  cityId: string;
  inspectorId: string;
  capturedAt: string;
};

type AuditLogRecord = {
  id: string;
  cityId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetId: string;
  occurredAt: string;
  outcome: string;
};

const cityNames: Record<string, string> = {
  "mumbai-dharavi": "Mumbai Dharavi",
  "hyderabad-bholakpur": "Hyderabad Bholakpur",
};

export class DemoDataClient {
  private readonly riskRows = this.loadCsv("risk_scores.csv");
  private readonly structures = this.loadStructures();
  private readonly satellites = this.loadSatelliteFeatures();
  private readonly inspections = this.loadInspections();

  async getCities() {
    return [...new Set(this.structures.map((structure) => structure.cityId))].map((cityId) => ({
      id: cityId,
      name: cityNames[cityId] ?? cityId,
      region: "India",
    }));
  }

  async getDashboardSummary(cityId: string) {
    const queue = await this.getRiskQueue(cityId, 50, "Supervisor");
    const structures = this.structures.filter((structure) => structure.cityId === cityId);
    const covered = structures.filter((structure) =>
      ["optical", "sar", "partial"].includes(
        this.satellites.find((satellite) => satellite.structureId === structure.structureId)?.coverageStatus ?? "unavailable",
      ),
    ).length;

    return {
      cityId,
      cityName: cityNames[cityId] ?? cityId,
      totalStructures: Math.max(structures.length, 10240),
      highRiskStructures: queue.filter((item) => item.riskProbability >= 0.7).length || 1,
      averageApiResponseMs: 1400,
      coverageRate: structures.length === 0 ? 0 : covered / structures.length,
      prioritizedQueue: queue.slice(0, 5).map((item) => ({
        structureId: item.structureId,
        riskProbability: item.riskProbability,
      })),
      randomQueue: [...queue]
        .sort((a, b) => a.structureId.localeCompare(b.structureId))
        .slice(0, 5)
        .map((item) => ({
          structureId: item.structureId,
          riskProbability: item.riskProbability,
        })),
    };
  }

  async getDemoSession(role: "Inspector" | "Supervisor" | "Admin") {
    return {
      token: `demo-${role.toLowerCase()}-token`,
      user: {
        id: `demo-${role.toLowerCase()}`,
        name:
          role === "Inspector"
            ? "Asha Rao"
            : role === "Supervisor"
              ? "Rohan Mehta"
              : "Nandini Iyer",
        role,
        cityIds: ["mumbai-dharavi", "hyderabad-bholakpur"],
      },
    };
  }

  async getAuditLogs(cityId: string, role: "Inspector" | "Supervisor" | "Admin") {
    const queue = await this.getRiskQueue(cityId, 4, role);
    return queue.map(
      (item, index) =>
        ({
          id: `AUD-${cityId}-${index + 1}`,
          cityId,
          actorName: role === "Inspector" ? "Asha Rao" : role === "Supervisor" ? "Rohan Mehta" : "Nandini Iyer",
          actorRole: role,
          action: index === 0 ? "risk.queue.viewed" : index === 1 ? "inspection.prioritized" : "report.exported",
          targetId: item.structureId,
          occurredAt: new Date(Date.now() - index * 1000 * 60 * 22).toISOString(),
          outcome: index === 3 ? "pending_review" : "success",
        }) satisfies AuditLogRecord,
    );
  }

  async getRiskQueue(cityId: string, limit = 50, role = "Supervisor") {
    return this.riskRows
      .filter((row) => row.city_id === cityId)
      .sort((a, b) => Number(b.risk_probability) - Number(a.risk_probability))
      .slice(0, limit)
      .map((row, index) => {
        const structure = this.structures.find((entry) => entry.structureId === row.structure_id);
        return {
          structureId: row.structure_id,
          locality: structure?.locality ?? row.structure_id,
          city: cityNames[row.city_id] ?? row.city_id,
          ward: structure?.ward ?? "Ward unknown",
          lat: structure?.lat ?? 0,
          lng: structure?.lng ?? 0,
          riskProbability: Number(row.risk_probability),
          confidence: Number(row.confidence),
          queueRank: index + 1,
          nextInspectionDueDays: Number(row.reinspection_interval_days),
          topFactors: [row.top_factor_1, row.top_factor_2, row.top_factor_3].filter(Boolean),
          assignedLabel: queueAssignment(index, role),
        };
      });
  }

  async getRiskDetail(structureId: string) {
    const row = this.riskRows.find((entry) => entry.structure_id === structureId);
    const structure = this.structures.find((entry) => entry.structureId === structureId);
    const satellite = this.satellites.find((entry) => entry.structureId === structureId);
    const inspection = this.inspections.find((entry) => entry.structureId === structureId);

    if (!row || !structure) {
      return null;
    }

    const riskProbability = Number(row.risk_probability);

    return {
      structureId: row.structure_id,
      cityId: row.city_id,
      locality: structure.locality,
      ward: structure.ward,
      riskProbability,
      confidence: Number(row.confidence),
      reinspectionIntervalDays: Number(row.reinspection_interval_days),
      trend: buildTrend(riskProbability),
      topContributors: [row.top_factor_1, row.top_factor_2, row.top_factor_3]
        .filter(Boolean)
        .map((feature, index) => ({
          feature,
          direction: "increase",
          contribution: Number((0.32 - index * 0.08).toFixed(2)),
        })),
      evidence: {
        latestInspectionId: inspection?.inspectionId ?? "INSP-DEMO-LATEST",
        satelliteStatus: satellite?.coverageStatus ?? "unavailable",
        rainfallMm7d: structure.cityId === "mumbai-dharavi" ? 88 : 74,
        footprintSource: structure.structureId.endsWith("5") ? "osm_fallback" : "municipal_gis",
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

  async syncInspection(inspectionId: string, cityId: string) {
    return {
      inspectionId,
      cityId,
      status: "processing",
      acceptedAt: new Date().toISOString(),
    };
  }

  async exportReport(cityId: string, format: "pdf" | "csv") {
    const queue = await this.getRiskQueue(cityId, 10, "Supervisor");
    const cityName = cityNames[cityId] ?? cityId;

    if (format === "csv") {
      return {
        fileName: `slumsafe-${cityId}-risk-report.csv`,
        contentType: "text/csv",
        content: [
          "structure_id,locality,risk_probability,confidence,next_inspection_due_days",
          ...queue.map(
            (item) =>
              `${item.structureId},${csvEscape(item.locality)},${item.riskProbability},${item.confidence},${item.nextInspectionDueDays}`,
          ),
        ].join("\n"),
      };
    }

    return {
      fileName: `slumsafe-${cityId}-risk-report.pdf`,
      contentType: "application/pdf",
      content: [
        "SlumSafe CV Priority Inspection Report",
        `City: ${cityName}`,
        `Generated: ${new Date().toISOString()}`,
        "",
        ...queue.map(
          (item) =>
            `${item.queueRank}. ${item.structureId} | ${item.locality} | risk=${Math.round(item.riskProbability * 100)}% | confidence=${Math.round(item.confidence * 100)}%`,
        ),
      ].join("\n"),
    };
  }

  private loadStructures() {
    return this.loadCsv("structures.csv").map((row) => ({
      structureId: row.structure_id,
      cityId: row.city_id,
      locality: row.name,
      ward: row.ward,
      lat: Number(row.lat),
      lng: Number(row.lng),
      structureAgeYears: Number(row.structure_age_years),
      material: row.material,
      lastInspectionDays: Number(row.last_inspection_days),
    })) satisfies StructureRecord[];
  }

  private loadSatelliteFeatures() {
    return this.loadCsv("satellite_features.csv").map((row) => ({
      structureId: row.structure_id,
      opticalDelta: Number(row.optical_delta),
      sarDelta: Number(row.sar_delta),
      coverageStatus: row.coverage_status,
      ndbiDelta: Number(row.ndbi_delta),
    })) satisfies SatelliteRecord[];
  }

  private loadInspections() {
    return this.loadJson<InspectionRecord[]>("inspections.json");
  }

  private loadCsv(fileName: string) {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(currentDir, "..", "..", "..", "data", "demo", fileName), "utf8");
    const [header, ...rows] = raw.trim().split(/\r?\n/);
    const columns = header.split(",");
    return rows.map((line) =>
      Object.fromEntries(line.split(",").map((value, index) => [columns[index], value])),
    ) as CsvRow[];
  }

  private loadJson<T>(fileName: string) {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(currentDir, "..", "..", "..", "data", "demo", fileName), "utf8");
    return JSON.parse(raw) as T;
  }
}

function buildTrend(riskProbability: number) {
  return [0.46, 0.62, 0.78, 0.9, 1].map((weight) =>
    Number(Math.max(0.08, Math.min(0.98, riskProbability * weight)).toFixed(2)),
  );
}

function queueAssignment(index: number, role: string) {
  if (index === 0) {
    return role === "Inspector" ? "Inspect today" : "Immediate response";
  }

  if (index < 3) {
    return role === "Admin" ? "Escalate resources" : "Supervisor review";
  }

  return "Monitor in route";
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
