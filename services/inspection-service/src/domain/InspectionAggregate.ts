import { Inspection, InspectionSchema } from "@slumsafe/shared";

export class InspectionAggregate {
  constructor(private readonly inspection: Inspection) {}

  static create(input: Inspection) {
    return new InspectionAggregate(InspectionSchema.parse(input));
  }

  toPrimitives() {
    return this.inspection;
  }

  markProcessing() {
    return new InspectionAggregate({
      ...this.inspection,
      status: "processing",
    });
  }
}

