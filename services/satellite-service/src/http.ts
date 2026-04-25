import Fastify from "fastify";
import { SatelliteFeatureService } from "./application/SatelliteFeatureService.js";

const app = Fastify({ logger: true });
const service = new SatelliteFeatureService();

app.get("/health", async () => ({ status: "ok", service: "satellite-service" }));

app.post("/features/:structureId", async (request, reply) => {
  reply.code(202);
  return service.compute((request.params as { structureId: string }).structureId);
});

app.listen({
  port: Number(process.env.PORT ?? 8083),
  host: "0.0.0.0",
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

