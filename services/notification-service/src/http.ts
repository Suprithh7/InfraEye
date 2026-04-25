import Fastify from "fastify";
import { z } from "zod";
import { NotificationDispatcher } from "./application/NotificationDispatcher.js";

const app = Fastify({ logger: true });
const dispatcher = new NotificationDispatcher();

const NotificationSchema = z.object({
  userId: z.string(),
  role: z.enum(["inspector", "supervisor", "admin"]),
  title: z.string(),
  body: z.string(),
  severity: z.enum(["info", "warning", "critical"]),
});

app.get("/health", async () => ({ status: "ok", service: "notification-service" }));

app.post("/dispatch", async (request, reply) => {
  reply.code(202);
  return dispatcher.dispatch(NotificationSchema.parse(request.body));
});

app.listen({
  port: Number(process.env.PORT ?? 8084),
  host: "0.0.0.0",
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

