import {
  AuditLog,
  CityOption,
  DashboardSummary,
  RiskDetail,
  RiskQueueItem,
  Role,
  Session,
  fallbackAuditLogs,
  fallbackCities,
  fallbackDetail,
  fallbackQueue,
  fallbackSession,
  fallbackSummary,
} from './data';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

async function request<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, init);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
}

export async function fetchCities(): Promise<CityOption[]> {
  return request('/v1/cities', undefined, fallbackCities);
}

export async function fetchDemoSession(role: Role): Promise<Session> {
  return request(
    '/v1/auth/demo-session',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ role }),
    },
    fallbackSession,
  );
}

export async function fetchDashboardSummary(cityId: string): Promise<DashboardSummary> {
  return request(`/v1/dashboard/summary?cityId=${encodeURIComponent(cityId)}`, undefined, fallbackSummary);
}

export async function fetchRiskQueue(cityId: string, role: Role): Promise<RiskQueueItem[]> {
  const response = await request<{ items: RiskQueueItem[] }>(
    `/v1/risk-queue?cityId=${encodeURIComponent(cityId)}&limit=50&role=${encodeURIComponent(role)}`,
    {
      headers: {
        'x-demo-role': role,
      },
    },
    { items: fallbackQueue },
  );

  return response.items;
}

export async function fetchRiskDetail(structureId: string): Promise<RiskDetail> {
  return request(`/v1/structures/${encodeURIComponent(structureId)}/risk`, undefined, fallbackDetail);
}

export async function fetchAuditLogs(cityId: string, role: Role): Promise<AuditLog[]> {
  const response = await request<{ items: AuditLog[] }>(
    `/v1/audit/logs?cityId=${encodeURIComponent(cityId)}&role=${encodeURIComponent(role)}`,
    {
      headers: {
        'x-demo-role': role,
      },
    },
    { items: fallbackAuditLogs },
  );

  return response.items;
}

export async function exportReport(cityId: string, format: 'pdf' | 'csv') {
  return request<{
    fileName: string;
    contentType: string;
    content: string;
  }>(
    '/v1/reports/export',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ cityId, format }),
    },
    {
      fileName: `slumsafe-${cityId}.${format}`,
      contentType: format === 'csv' ? 'text/csv' : 'application/pdf',
      content:
        format === 'csv'
          ? 'structure_id,risk_probability\nSTR-001,0.86\nSTR-005,0.63'
          : 'SlumSafe CV report export is unavailable, so the dashboard is using fallback demo content.',
    },
  );
}
