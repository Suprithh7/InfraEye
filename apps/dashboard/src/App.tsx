import { useEffect, useMemo, useState } from 'react';
import {
  exportReport,
  fetchAuditLogs,
  fetchCities,
  fetchDashboardSummary,
  fetchDemoSession,
  fetchRiskDetail,
  fetchRiskQueue,
} from './api';
import {
  AuditLog,
  CityOption,
  DashboardSummary,
  RiskDetail,
  RiskQueueItem,
  Role,
  Session,
  fallbackDetail,
  fallbackSession,
  fallbackSummary,
} from './data';

const roles: Role[] = ['Inspector', 'Supervisor', 'Admin'];

function App() {
  const [selectedRole, setSelectedRole] = useState<Role>('Supervisor');
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('mumbai-dharavi');
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [queue, setQueue] = useState<RiskQueueItem[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState('STR-001');
  const [detail, setDetail] = useState<RiskDetail>(fallbackDetail);
  const [session, setSession] = useState<Session>(fallbackSession);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [status, setStatus] = useState('Loading connected city data...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities().then((result) => {
      setCities(result);
      if (result.length > 0) {
        setSelectedCityId(result[0].id);
      }
    });
  }, []);

  useEffect(() => {
    fetchDemoSession(selectedRole)
      .then((result) => setSession(result))
      .catch(() => setStatus('Using fallback demo session.'));
  }, [selectedRole]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setStatus('Refreshing city summary and ranked queue...');

    Promise.all([
      fetchDashboardSummary(selectedCityId),
      fetchRiskQueue(selectedCityId, selectedRole),
      fetchAuditLogs(selectedCityId, selectedRole),
    ])
      .then(([summaryResult, queueResult, auditResult]) => {
        if (!mounted) {
          return;
        }

        setSummary(summaryResult);
        setQueue(queueResult);
        setAuditLogs(auditResult);
        if (queueResult[0]) {
          setSelectedStructureId(queueResult[0].structureId);
        }
        setStatus('Connected to the gateway demo API.');
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setStatus('Gateway unavailable, showing fallback demo state.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedCityId, selectedRole]);

  useEffect(() => {
    let mounted = true;
    fetchRiskDetail(selectedStructureId)
      .then((result) => {
        if (mounted) {
          setDetail(result);
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus('Risk detail endpoint unavailable, keeping fallback evidence panel.');
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedStructureId]);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId) ?? cities[0],
    [cities, selectedCityId],
  );

  async function handleExport(format: 'pdf' | 'csv') {
    const report = await exportReport(selectedCityId, format);
    const blob = new Blob([report.content], { type: report.contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = report.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="eyebrow">SlumSafe CV</p>
        <h1>Municipal infrastructure risk operations</h1>
        <p className="lede">
          Multi-city risk triage with explainable collapse scores, drill-down evidence, and
          exportable supervision workflows.
        </p>
        <div className="session-card">
          <span className="eyebrow">Active session</span>
          <strong>{session.user.name}</strong>
          <span>{session.user.role} access</span>
        </div>
        <label className="role-card">
          <span>City</span>
          <select value={selectedCityId} onChange={(event) => setSelectedCityId(event.target.value)}>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label className="role-card">
          <span>Role</span>
          <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role)}>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <p className="status-banner">{status}</p>
        <div className="metric-grid">
          <article>
            <span>Structures</span>
            <strong>{summary.totalStructures.toLocaleString()}</strong>
          </article>
          <article>
            <span>High risk</span>
            <strong>{summary.highRiskStructures.toLocaleString()}</strong>
          </article>
          <article>
            <span>Avg API</span>
            <strong>{(summary.averageApiResponseMs / 1000).toFixed(1)} s</strong>
          </article>
          <article>
            <span>Coverage</span>
            <strong>{(summary.coverageRate * 100).toFixed(1)}%</strong>
          </article>
        </div>
      </aside>

      <main className="main">
        <section className="hero">
          <div className="panel">
            <p className="eyebrow">Before / After</p>
            <h2>Inspection efficiency improves when queues are ranked by risk</h2>
            <p className="small">
              {selectedCity?.name ?? summary.cityName} uses the same queue contract for both the mobile
              app and supervisor workflow.
            </p>
            <div className="comparison">
              <div>
                <h3>Before</h3>
                {summary.randomQueue.map((item, index) => (
                  <p key={item.structureId}>
                    #{index + 1} {item.structureId} <span>Random assignment</span>
                  </p>
                ))}
              </div>
              <div>
                <h3>After</h3>
                {summary.prioritizedQueue.map((item, index) => (
                  <p key={item.structureId}>
                    #{index + 1} {item.structureId} <span>{Math.round(item.riskProbability * 100)}% risk</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="panel map-panel">
            <p className="eyebrow">Risk heatmap</p>
            <h2>Google Maps-ready layer</h2>
            <div className="map-surface">
              {queue.map((item) => (
                <button
                  key={item.structureId}
                  className="map-point"
                  style={{
                    left: `${20 + item.riskProbability * 60}%`,
                    top: `${25 + item.confidence * 35}%`,
                  }}
                  onClick={() => setSelectedStructureId(item.structureId)}
                >
                  {item.structureId}
                </button>
              ))}
            </div>
            <small>
              Replace the demo surface with the Google Maps JavaScript API using the same structure
              geometry contract.
            </small>
          </div>
        </section>

        <section className="content-grid">
          <article className="panel queue-panel">
            <p className="eyebrow">Ranked queue</p>
            <h2>{selectedRole} view</h2>
            {loading && <p className="small">Loading ranked queue...</p>}
            {queue.map((item) => (
              <button
                key={item.structureId}
                className={`queue-item ${selectedStructureId === item.structureId ? 'active' : ''}`}
                onClick={() => setSelectedStructureId(item.structureId)}
              >
                <div>
                  <strong>{item.structureId}</strong>
                  <span>{item.locality} | {item.assignedLabel}</span>
                </div>
                <div>
                  <strong>{Math.round(item.riskProbability * 100)}%</strong>
                  <span>{Math.round(item.confidence * 100)}% confidence</span>
                </div>
              </button>
            ))}
          </article>

          <article className="panel detail-panel">
            <p className="eyebrow">Structure drill-down</p>
            <h2>{detail.structureId}</h2>
            <p>{detail.locality} | {detail.ward}</p>
            <div className="chips">
              {detail.topContributors.map((factor) => (
                <span key={factor.feature}>{factor.feature}</span>
              ))}
            </div>
            <div className="trend">
              {detail.trend.map((value, index) => (
                <div key={index} style={{ height: `${value * 100}%` }} />
              ))}
            </div>
            <p className="small">
              Explainability panel: {detail.evidence.rainfallMm7d} mm rainfall in the last 7 days,
              satellite mode {detail.evidence.satelliteStatus}, and footprint source {detail.evidence.footprintSource}.
            </p>
            <div className="exports">
              <button onClick={() => handleExport('pdf')}>Export PDF</button>
              <button onClick={() => handleExport('csv')}>Export CSV</button>
            </div>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel audit-panel">
            <p className="eyebrow">Audit trail</p>
            <h2>RBAC activity feed</h2>
            {auditLogs.map((log) => (
              <div key={log.id} className="audit-item">
                <strong>{log.action}</strong>
                <span>
                  {log.actorName} | {log.targetId} | {new Date(log.occurredAt).toLocaleString()}
                </span>
                <span className={`outcome ${log.outcome}`}>{log.outcome}</span>
              </div>
            ))}
          </article>

          <article className="panel detail-panel">
            <p className="eyebrow">Operational status</p>
            <h2>Decision support</h2>
            <p className="small">
              Token: <code>{session.token}</code>
            </p>
            <p className="small">City scope: {session.user.cityIds.join(', ')}</p>
            <p className="small">
              Queue rank #{queue.find((item) => item.structureId === detail.structureId)?.queueRank ?? '-'} with
              reinspection in {detail.reinspectionIntervalDays} days.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
