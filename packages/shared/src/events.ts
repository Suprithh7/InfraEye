export type DomainEvent<TPayload> = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  cityId: string;
  structureId: string;
  payload: TPayload;
};

export const Topics = {
  inspectionCreated: "inspection.created",
  inspectionMediaUploaded: "inspection.media_uploaded",
  inspectionSyncFailed: "inspection.sync_failed",
  satelliteRefreshRequested: "satellite.refresh_requested",
  satelliteFeaturesReady: "satellite.features_ready",
  riskScoreRequested: "risk.score_requested",
  riskScored: "risk.scored",
  notificationDispatchRequested: "notification.dispatch_requested",
  auditActivityLogged: "audit.activity_logged",
} as const;

