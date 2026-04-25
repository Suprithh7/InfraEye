import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { config } from "./config.js";
import { registerRoutes } from "./routes.js";

const app = Fastify({
  logger: true,
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

  if (process.env.APP_MODE === "demo") {
    return;
  }

  await request.jwtVerify();
});

await registerRoutes(app);

app.listen({ port: config.port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

