import { useState } from 'react';
import { demoRiskItems } from './data';

const roles = ['Inspector', 'Supervisor', 'Admin'] as const;

function App() {
  const [selectedRole, setSelectedRole] = useState<(typeof roles)[number]>('Supervisor');
  const [selectedStructure, setSelectedStructure] = useState(demoRiskItems[0]);

  const prioritized = [...demoRiskItems].sort((a, b) => b.riskProbability - a.riskProbability);
  const randomBaseline = [...demoRiskItems].sort((a, b) => a.structureId.localeCompare(b.structureId));

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="eyebrow">SlumSafe CV</p>
        <h1>Municipal infrastructure risk operations</h1>
        <p className="lede">
          Multi-city risk triage with explainable collapse scores, drill-down evidence, and
          exportable supervision workflows.
        </p>
        <label className="role-card">
          <span>Role</span>
          <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as never)}>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <div className="metric-grid">
          <article>
            <span>Structures</span>
            <strong>10,240</strong>
          </article>
          <article>
            <span>High risk</span>
            <strong>642</strong>
          </article>
          <article>
            <span>Avg API</span>
            <strong>1.4 s</strong>
          </article>
          <article>
            <span>Coverage</span>
            <strong>96.1%</strong>
          </article>
        </div>
      </aside>

      <main className="main">
        <section className="hero">
          <div className="panel">
            <p className="eyebrow">Before / After</p>
            <h2>Inspection efficiency improves when queues are ranked by risk</h2>
            <div className="comparison">
              <div>
                <h3>Before</h3>
                {randomBaseline.map((item, index) => (
                  <p key={item.structureId}>
                    #{index + 1} {item.structureId} <span>Random assignment</span>
                  </p>
                ))}
              </div>
              <div>
                <h3>After</h3>
                {prioritized.map((item, index) => (
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
              {prioritized.map((item) => (
                <button
                  key={item.structureId}
                  className="map-point"
                  style={{
                    left: `${20 + item.riskProbability * 60}%`,
                    top: `${25 + item.confidence * 35}%`,
                  }}
                  onClick={() => setSelectedStructure(item)}
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
            {prioritized.map((item) => (
              <button
                key={item.structureId}
                className={`queue-item ${selectedStructure.structureId === item.structureId ? 'active' : ''}`}
                onClick={() => setSelectedStructure(item)}
              >
                <div>
                  <strong>{item.structureId}</strong>
                  <span>{item.locality}</span>
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
            <h2>{selectedStructure.structureId}</h2>
            <p>{selectedStructure.locality}</p>
            <div className="chips">
              {selectedStructure.topFactors.map((factor) => (
                <span key={factor}>{factor}</span>
              ))}
            </div>
            <div className="trend">
              {selectedStructure.trend.map((value, index) => (
                <div key={index} style={{ height: `${value * 100}%` }} />
              ))}
            </div>
            <p className="small">
              Explainability panel: recent rainfall, damage severity, and remote sensing deltas are
              the dominant drivers for this structure.
            </p>
            <div className="exports">
              <button>Export PDF</button>
              <button>Export CSV</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
