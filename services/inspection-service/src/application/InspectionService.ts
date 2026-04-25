import { randomUUID } from "node:crypto";
import { InspectionAggregate } from "../domain/InspectionAggregate.js";
import { EventPublisher } from "../infrastructure/PubSubPublisher.js";
import { InspectionRepository } from "../infrastructure/InspectionRepository.js";

type CreateInspectionCommand = {
  cityId: string;
  structureId: string;
  inspectorId: string;
  imageCount: number;
  damageFeatures: {
    crackCount: number;
    spallAreaRatio: number;
    leaningSeverity: number;
  };
  captureQuality?: {
    blurVariance: number;
    lightingScore: number;
  };
  capturedAt: string;
};

export class InspectionService {
  constructor(
    private readonly repository: InspectionRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async createInspection(command: CreateInspectionCommand) {
    const inspection = InspectionAggregate.create({
      inspectionId: randomUUID(),
      ...command,
      status: "pending_upload",
    });

    await this.repository.save(inspection.toPrimitives());
    await this.publisher.publish("inspection.created", inspection.toPrimitives());

    return inspection.toPrimitives();
  }
}

