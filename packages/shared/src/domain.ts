import { z } from "zod";

export const DamageFeaturesSchema = z.object({
  crackCount: z.number().nonnegative(),
  spallAreaRatio: z.number().min(0).max(1),
  leaningSeverity: z.number().min(0).max(1),
});

export const CaptureQualitySchema = z.object({
  blurVariance: z.number().nonnegative(),
  lightingScore: z.number().min(0).max(1),
});

export const InspectionSchema = z.object({
  inspectionId: z.string(),
  cityId: z.string(),
  structureId: z.string(),
  inspectorId: z.string(),
  imageCount: z.number().int().positive(),
  damageFeatures: DamageFeaturesSchema,
  captureQuality: CaptureQualitySchema.optional(),
  capturedAt: z.string(),
  status: z.enum(["pending_upload", "processing", "completed"]),
});

export const SatelliteFeaturesSchema = z.object({
  structureId: z.string(),
  opticalDelta: z.number(),
  sarDelta: z.number(),
  coverageStatus: z.enum(["optical", "sar", "partial", "unavailable"]),
});

export const RiskScoreSchema = z.object({
  structureId: z.string(),
  cityId: z.string(),
  riskProbability: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  reinspectionIntervalDays: z.number().int().positive(),
  topContributors: z.array(
    z.object({
      feature: z.string(),
      contribution: z.number(),
      direction: z.enum(["increase", "decrease"]),
    }),
  ),
});

export type DamageFeatures = z.infer<typeof DamageFeaturesSchema>;
export type CaptureQuality = z.infer<typeof CaptureQualitySchema>;
export type Inspection = z.infer<typeof InspectionSchema>;
export type SatelliteFeatures = z.infer<typeof SatelliteFeaturesSchema>;
export type RiskScore = z.infer<typeof RiskScoreSchema>;

