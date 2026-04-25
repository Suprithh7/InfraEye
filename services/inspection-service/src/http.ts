import Fastify from "fastify";
import { z } from "zod";
import { InspectionService } from "./application/InspectionService.js";
import { InMemoryInspectionRepository } from "./infrastructure/InspectionRepository.js";
import { ConsoleEventPublisher } from "./infrastructure/PubSubPublisher.js";

const app = Fastify({ logger: true });
const service = new InspectionService(
  new InMemoryInspectionRepository(),
  new ConsoleEventPublisher(),
);

const CreateInspectionSchema = z.object({
  cityId: z.string(),
  structureId: z.string(),
  inspectorId: z.string(),
  imageCount: z.number().int().positive(),
  damageFeatures: z.object({
    crackCount: z.number().nonnegative(),
    spallAreaRatio: z.number().min(0).max(1),
    leaningSeverity: z.number().min(0).max(1),
  }),
  captureQuality: z
    .object({
      blurVariance: z.number().nonnegative(),
      lightingScore: z.number().min(0).max(1),
    })
    .optional(),
  capturedAt: z.string(),
});

app.get("/health", async () => ({ status: "ok", service: "inspection-service" }));

app.post("/inspections", async (request, reply) => {
  const inspection = await service.createInspection(CreateInspectionSchema.parse(request.body));
  reply.code(201);
  return inspection;
});

app.listen({
  port: Number(process.env.PORT ?? 8081),
  host: "0.0.0.0",
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

