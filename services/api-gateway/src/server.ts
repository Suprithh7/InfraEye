import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { config } from "./config.js";
import { registerRoutes } from "./routes.js";

const app = Fastify({
  logger: true,
  requestIdHeader: "x-trace-id",
});

await app.register(cors, {
  origin: true,
});

await app.register(jwt, {
  secret: config.jwtSecret,
});

app.addHook("preHandler", async (request) => {
  if (request.url === "/health") {
    return;
  }

  if (config.appMode === "demo") {
    return;
  }

  await request.jwtVerify();
});

app.addHook("onSend", async (request, reply, payload) => {
  reply.header("x-slumsafe-role", request.headers["x-demo-role"] ?? "Supervisor");
  reply.header("x-slumsafe-mode", config.appMode);
  return payload;
});

await registerRoutes(app);

app.listen({ port: config.port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
