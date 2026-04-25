import Fastify from "fastify";
import { z } from "zod";
import { RiskScoringService } from "./application/RiskScoringService.js";

const app = Fastify({ logger: true });
const service = new RiskScoringService();

const ScoreSchema = z.object({
  cityId: z.string(),
  structureId: z.string(),
  crackCount: z.number().nonnegative(),
  spallAreaRatio: z.number().min(0).max(1),
  leaningSeverity: z.number().min(0).max(1),
  rainfallMm7d: z.number().nonnegative(),
  opticalDelta: z.number(),
  sarDelta: z.number(),
  structureAgeYears: z.number().nonnegative(),
  inspectionGapDays: z.number().nonnegative(),
  hasPartialCoverage: z.boolean().default(false),
});

app.get("/health", async () => ({ status: "ok", service: "risk-scoring-service" }));

app.post("/score", async (request) => {
  const payload = ScoreSchema.parse(request.body);
  return service.score(payload.structureId, payload.cityId, payload);
});

app.listen({
  port: Number(process.env.PORT ?? 8082),
  host: "0.0.0.0",
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

