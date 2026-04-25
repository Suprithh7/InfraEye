export type RiskItem = {
  structureId: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
  riskProbability: number;
  confidence: number;
  trend: number[];
  topFactors: string[];
};

export const demoRiskItems: RiskItem[] = [
  {
    structureId: 'STR-001',
    locality: 'Dharavi Cluster A-12',
    city: 'Mumbai',
    lat: 19.0421,
    lng: 72.8577,
    riskProbability: 0.86,
    confidence: 0.81,
    trend: [0.42, 0.51, 0.63, 0.71, 0.86],
    topFactors: ['crack_density', 'rainfall_7d', 'optical_delta'],
  },
  {
    structureId: 'STR-003',
    locality: 'Bholakpur Lane 7',
    city: 'Hyderabad',
    lat: 17.4426,
    lng: 78.4891,
    riskProbability: 0.79,
    confidence: 0.72,
    trend: [0.39, 0.47, 0.52, 0.66, 0.79],
    topFactors: ['sar_delta', 'inspection_gap', 'structure_age'],
  },
  {
    structureId: 'STR-005',
    locality: 'Dharavi Cluster C-04',
    city: 'Mumbai',
    lat: 19.0433,
    lng: 72.8592,
    riskProbability: 0.63,
    confidence: 0.65,
    trend: [0.31, 0.36, 0.48, 0.55, 0.63],
    topFactors: ['partial_coverage', 'spall_area', 'repairs_history'],
  },
];

