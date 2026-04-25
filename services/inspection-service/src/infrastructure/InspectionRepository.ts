import { Inspection } from "@slumsafe/shared";

export interface InspectionRepository {
  save(inspection: Inspection): Promise<void>;
}

export class InMemoryInspectionRepository implements InspectionRepository {
  private readonly inspections = new Map<string, Inspection>();

  async save(inspection: Inspection): Promise<void> {
    this.inspections.set(inspection.inspectionId, inspection);
  }
}

