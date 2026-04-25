export type Role = 'Inspector' | 'Supervisor' | 'Admin';

export type Session = {
  token: string;
  user: {
    id: string;
    name: string;
    role: Role;
    cityIds: string[];
  };
};

export type CityOption = {
  id: string;
  name: string;
  region: string;
};

export type RiskQueueItem = {
  structureId: string;
  locality: string;
  city: string;
  ward: string;
  lat: number;
  lng: number;
  riskProbability: number;
  confidence: number;
  queueRank: number;
  nextInspectionDueDays: number;
  topFactors: string[];
  assignedLabel: string;
};

export type RiskDetail = {
  structureId: string;
  cityId: string;
  locality: string;
  ward: string;
  riskProbability: number;
  confidence: number;
  reinspectionIntervalDays: number;
  trend: number[];
  topContributors: Array<{
    feature: string;
    direction: 'increase' | 'decrease';
    contribution: number;
  }>;
  evidence: {
    latestInspectionId: string;
    satelliteStatus: string;
    rainfallMm7d: number;
    footprintSource: string;
  };
};

export type DashboardSummary = {
  cityId: string;
  cityName: string;
  totalStructures: number;
  highRiskStructures: number;
  averageApiResponseMs: number;
  coverageRate: number;
  prioritizedQueue: Array<{
    structureId: string;
    riskProbability: number;
  }>;
  randomQueue: Array<{
    structureId: string;
    riskProbability: number;
  }>;
};

export type AuditLog = {
  id: string;
  cityId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  targetId: string;
  occurredAt: string;
  outcome: string;
};

export const fallbackCities: CityOption[] = [
  { id: 'mumbai-dharavi', name: 'Mumbai Dharavi', region: 'India' },
  { id: 'hyderabad-bholakpur', name: 'Hyderabad Bholakpur', region: 'India' },
];

export const fallbackSession: Session = {
  token: 'demo-supervisor-token',
  user: {
    id: 'demo-supervisor',
    name: 'Rohan Mehta',
    role: 'Supervisor',
    cityIds: ['mumbai-dharavi', 'hyderabad-bholakpur'],
  },
};

export const fallbackSummary: DashboardSummary = {
  cityId: 'mumbai-dharavi',
  cityName: 'Mumbai Dharavi',
  totalStructures: 10240,
  highRiskStructures: 642,
  averageApiResponseMs: 1400,
  coverageRate: 0.961,
  prioritizedQueue: [
    { structureId: 'STR-001', riskProbability: 0.86 },
    { structureId: 'STR-005', riskProbability: 0.63 },
  ],
  randomQueue: [
    { structureId: 'STR-001', riskProbability: 0.86 },
    { structureId: 'STR-002', riskProbability: 0.21 },
  ],
};

export const fallbackQueue: RiskQueueItem[] = [
  {
    structureId: 'STR-001',
    locality: 'Dharavi Cluster A-12',
    city: 'Mumbai Dharavi',
    ward: 'Ward 1',
    lat: 19.0421,
    lng: 72.8577,
    riskProbability: 0.86,
    confidence: 0.81,
    queueRank: 1,
    nextInspectionDueDays: 5,
    topFactors: ['crack_density', 'rainfall_7d', 'optical_delta'],
    assignedLabel: 'Immediate response',
  },
  {
    structureId: 'STR-005',
    locality: 'Dharavi Cluster C-04',
    city: 'Mumbai Dharavi',
    ward: 'Ward 3',
    lat: 19.0433,
    lng: 72.8592,
    riskProbability: 0.63,
    confidence: 0.65,
    queueRank: 2,
    nextInspectionDueDays: 10,
    topFactors: ['partial_coverage', 'spall_area', 'repairs_history'],
    assignedLabel: 'Supervisor review',
  },
];

export const fallbackDetail: RiskDetail = {
  structureId: 'STR-001',
  cityId: 'mumbai-dharavi',
  locality: 'Dharavi Cluster A-12',
  ward: 'Ward 1',
  riskProbability: 0.86,
  confidence: 0.81,
  reinspectionIntervalDays: 5,
  trend: [0.42, 0.51, 0.63, 0.71, 0.86],
  topContributors: [
    { feature: 'crack_density', direction: 'increase', contribution: 0.3 },
    { feature: 'rainfall_7d', direction: 'increase', contribution: 0.22 },
    { feature: 'optical_delta', direction: 'increase', contribution: 0.16 },
  ],
  evidence: {
    latestInspectionId: 'INSP-DEMO-LATEST',
    satelliteStatus: 'optical',
    rainfallMm7d: 88,
    footprintSource: 'municipal_gis',
  },
};

export const fallbackAuditLogs: AuditLog[] = [
  {
    id: 'AUD-mumbai-dharavi-1',
    cityId: 'mumbai-dharavi',
    actorName: 'Rohan Mehta',
    actorRole: 'Supervisor',
    action: 'risk.queue.viewed',
    targetId: 'STR-001',
    occurredAt: '2026-04-25T06:30:00Z',
    outcome: 'success',
  },
  {
    id: 'AUD-mumbai-dharavi-2',
    cityId: 'mumbai-dharavi',
    actorName: 'Rohan Mehta',
    actorRole: 'Supervisor',
    action: 'inspection.prioritized',
    targetId: 'STR-005',
    occurredAt: '2026-04-25T06:08:00Z',
    outcome: 'success',
  },
];
