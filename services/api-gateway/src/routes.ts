import { FastifyInstance } from "fastify";
import { z } from "zod";
import { CaptureQualitySchema, DamageFeaturesSchema } from "@slumsafe/shared";
import { DemoDataClient } from "./clients.js";
import { config } from "./config.js";

const DemoRoleSchema = z.enum(["Inspector", "Supervisor", "Admin"]);

const CreateInspectionSchema = z.object({
  cityId: z.string(),
  structureId: z.string(),
  inspectorId: z.string(),
  imageCount: z.number().int().positive(),
  damageFeatures: DamageFeaturesSchema,
  captureQuality: CaptureQualitySchema.optional(),
  capturedAt: z.string(),
});

const QueueQuerySchema = z.object({
  cityId: z.string(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  role: DemoRoleSchema.default("Supervisor"),
});

const SummaryQuerySchema = z.object({
  cityId: z.string(),
});

const AuditQuerySchema = z.object({
  cityId: z.string(),
  role: DemoRoleSchema.default("Supervisor"),
});

export async function registerRoutes(app: FastifyInstance) {
  const demoClient = new DemoDataClient();

  app.get("/health", async () => ({
    status: "ok",
    service: "api-gateway",
    mode: config.appMode,
  }));

  app.get("/v1/cities", async () => demoClient.getCities());

  app.post("/v1/auth/demo-session", async (request) => {
    const body = z.object({ role: DemoRoleSchema.default("Supervisor") }).parse(request.body);
    return demoClient.getDemoSession(body.role);
  });

  app.get("/v1/dashboard/summary", async (request) => {
    const query = SummaryQuerySchema.parse(request.query);
    return demoClient.getDashboardSummary(query.cityId);
  });

  app.post("/v1/inspections", async (request, reply) => {
    const payload = CreateInspectionSchema.parse(request.body);
    const inspection = await demoClient.createInspection(payload);
    reply.code(201);
    return inspection;
  });

  app.post("/v1/inspections/:inspectionId/sync", async (request) => {
    const params = request.params as { inspectionId: string };
    const body = z.object({ cityId: z.string().default("mumbai-dharavi") }).parse(request.body ?? {});
    return demoClient.syncInspection(params.inspectionId, body.cityId);
  });

  app.get("/v1/risk-queue", async (request) => {
    const headerRole = request.headers["x-demo-role"];
    const query = QueueQuerySchema.parse({
      ...(request.query as Record<string, unknown>),
      role: (typeof headerRole === "string" ? headerRole : undefined) ?? (request.query as { role?: string }).role,
    });
    return {
      items: await demoClient.getRiskQueue(query.cityId, query.limit, query.role),
    };
  });

  app.get("/v1/audit/logs", async (request) => {
    const headerRole = request.headers["x-demo-role"];
    const query = AuditQuerySchema.parse({
      ...(request.query as Record<string, unknown>),
      role: (typeof headerRole === "string" ? headerRole : undefined) ?? (request.query as { role?: string }).role,
    });
    return {
      items: await demoClient.getAuditLogs(query.cityId, query.role),
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
    const body = z
      .object({
        cityId: z.string(),
        format: z.enum(["pdf", "csv"]),
      })
      .parse(request.body);
    reply.code(200);
    return demoClient.exportReport(body.cityId, body.format);
  });
}
