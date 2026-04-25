import { FastifyInstance } from "fastify";
import { z } from "zod";
import { CaptureQualitySchema, DamageFeaturesSchema } from "@slumsafe/shared";
import { DemoDataClient } from "./clients.js";

const CreateInspectionSchema = z.object({
  cityId: z.string(),
  structureId: z.string(),
  inspectorId: z.string(),
  imageCount: z.number().int().positive(),
  damageFeatures: DamageFeaturesSchema,
  captureQuality: CaptureQualitySchema.optional(),
  capturedAt: z.string(),
});

export async function registerRoutes(app: FastifyInstance) {
  const demoClient = new DemoDataClient();

  app.get("/health", async () => ({
    status: "ok",
    service: "api-gateway",
    mode: process.env.APP_MODE ?? "demo",
  }));

  app.post("/v1/inspections", async (request, reply) => {
    const payload = CreateInspectionSchema.parse(request.body);
    const inspection = await demoClient.createInspection(payload);
    reply.code(201);
    return inspection;
  });

  app.post("/v1/inspections/:inspectionId/sync", async (request) => ({
    inspectionId: (request.params as { inspectionId: string }).inspectionId,
    status: "processing",
  }));

  app.get("/v1/risk-queue", async (request) => {
    const query = request.query as { cityId: string; limit?: string };
    return {
      items: await demoClient.getRiskQueue(query.cityId, Number(query.limit ?? "50")),
    };
  });

  app.get("/v1/structures/:structureId/risk", async (request, reply) => {
    const detail = await demoClient.getRiskDetail(
      (request.params as { structureId: string }).structureId,
    );
    if (!detail) {
      reply.code(404);
      return { message: "Structure not found" };
    }

    return detail;
  });

  app.post("/v1/satellite/features/:structureId", async (request, reply) => {
    reply.code(202);
    return {
      structureId: (request.params as { structureId: string }).structureId,
      status: "queued",
    };
  });

  app.post("/v1/reports/export", async (request, reply) => {
    const body = request.body as { cityId?: string; format?: string };
    reply.code(202);
    return {
      jobId: `export-${Date.now()}`,
      cityId: body.cityId,
      format: body.format,
      status: "queued",
    };
  });
}

