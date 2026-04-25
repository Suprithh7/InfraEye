export const config = {
  port: Number(process.env.PORT ?? 8080),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  serviceEndpoints: {
    inspection: process.env.INSPECTION_SERVICE_URL ?? "http://inspection-service:8081",
    risk: process.env.RISK_SERVICE_URL ?? "http://risk-scoring-service:8082",
    satellite: process.env.SATELLITE_SERVICE_URL ?? "http://satellite-service:8083",
    notification: process.env.NOTIFICATION_SERVICE_URL ?? "http://notification-service:8084",
  },
};

