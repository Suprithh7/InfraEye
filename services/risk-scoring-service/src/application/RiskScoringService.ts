import { scoreRisk, RiskFeatureVector } from "../domain/RiskEngine.js";

export class RiskScoringService {
  async score(structureId: string, cityId: string, features: RiskFeatureVector) {
    return {
      structureId,
      cityId,
      ...scoreRisk(features),
    };
  }
}

