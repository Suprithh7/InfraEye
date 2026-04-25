export type SatelliteFeatureResponse = {
  structureId: string;
  coverageStatus: "optical" | "sar" | "partial" | "unavailable";
  opticalDelta: number;
  sarDelta: number;
  ndbiDelta: number;
  footprintSource: "municipal_gis" | "osm_fallback";
};

export class SatelliteFeatureService {
  async compute(structureId: string): Promise<SatelliteFeatureResponse> {
    const hash = [...structureId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const opticalAvailable = hash % 3 !== 0;
    const sarAvailable = hash % 5 !== 0;

    if (opticalAvailable) {
      return {
        structureId,
        coverageStatus: "optical",
        opticalDelta: Number(((hash % 31) / 100).toFixed(2)),
        sarDelta: Number(((hash % 17) / 100).toFixed(2)),
        ndbiDelta: Number(((hash % 23) / 100).toFixed(2)),
        footprintSource: hash % 7 === 0 ? "osm_fallback" : "municipal_gis",
      };
    }

    if (sarAvailable) {
      return {
        structureId,
        coverageStatus: "sar",
        opticalDelta: 0,
        sarDelta: Number(((hash % 29) / 100).toFixed(2)),
        ndbiDelta: 0,
        footprintSource: hash % 7 === 0 ? "osm_fallback" : "municipal_gis",
      };
    }

    return {
      structureId,
      coverageStatus: "unavailable",
      opticalDelta: 0,
      sarDelta: 0,
      ndbiDelta: 0,
      footprintSource: "osm_fallback",
    };
  }
}

