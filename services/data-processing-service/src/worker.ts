import { Topics } from "@slumsafe/shared";

type EnrichedFeatureVector = {
  structureId: string;
  cityId: string;
  rainfallMm7d: number;
  inspectionGapDays: number;
  opticalDelta: number;
  sarDelta: number;
};

export class FeatureAggregationWorker {
  async handleInspectionCreated(event: { structureId: string; cityId: string }) {
    const enriched: EnrichedFeatureVector = {
      structureId: event.structureId,
      cityId: event.cityId,
      rainfallMm7d: 88,
      inspectionGapDays: 51,
      opticalDelta: 0.16,
      sarDelta: 0.14,
    };

    console.info(JSON.stringify({ topic: Topics.riskScoreRequested, payload: enriched }));
    return enriched;
  }
}

if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, "/") ?? "")) {
  const worker = new FeatureAggregationWorker();
  worker
    .handleInspectionCreated({ structureId: "STR-005", cityId: "mumbai-dharavi" })
    .then((result) => console.info(result))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

