# Demo walkthrough

## Scenario

The demo compares two inspection workflows in a settlement cluster:

- Before: inspectors visit structures in near-random order.
- After: the ranked queue surfaces structures with the highest 30-day collapse risk.

## Demo assets

- `data/demo/structures.csv`: structure inventory across two cities.
- `data/demo/inspections.json`: ground inspection history.
- `data/demo/satellite_features.csv`: simulated optical and SAR deltas.
- `data/demo/risk_scores.csv`: precomputed risk scores and explanations.

## Flow

1. Open the mobile app in demo mode and authenticate as `inspector@demo.slumsafe`.
2. Capture a structure image. The overlay, blur score, and lighting validator guide the user.
3. Submit while offline to show the encrypted queue holding the inspection locally.
4. Reconnect and sync. The inspection is uploaded and an `inspection.created` event is published.
5. The processing service enriches the structure with weather, satellite, and inspection history features.
6. The risk service returns a score, top SHAP drivers, and a reinspection interval.
7. Open the dashboard to compare:
   - Baseline random queue
   - AI-prioritized queue
8. Drill into a high-risk structure to show the evidence panel and trend chart.
9. Export a PDF report for supervisors and a CSV for planners.

## Demo talking points

- Multi-source fusion works even when optical satellite imagery is unavailable.
- The system favors operational usability with confidence-aware degraded mode behavior.
- Explainability highlights why the structure is risky instead of hiding behind a black-box score.

