from __future__ import annotations

from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
DEMO_DIR = ROOT / "data" / "demo"


def compute_drift() -> pd.DataFrame:
    structures = pd.read_csv(DEMO_DIR / "structures.csv")
    satellite = pd.read_csv(DEMO_DIR / "satellite_features.csv")

    current = structures.merge(satellite, on="structure_id", how="left")
    baseline = current.copy()
    baseline["optical_delta"] = baseline["optical_delta"] * 0.8
    baseline["sar_delta"] = baseline["sar_delta"] * 0.75

    report = []
    for column in ["optical_delta", "sar_delta", "structure_age_years", "last_inspection_days"]:
        baseline_mean = baseline[column].mean()
        current_mean = current[column].mean()
        drift = abs(current_mean - baseline_mean)
        report.append(
            {
                "feature": column,
                "baseline_mean": round(float(baseline_mean), 4),
                "current_mean": round(float(current_mean), 4),
                "drift": round(float(drift), 4),
                "status": "alert" if drift > 0.05 else "ok",
            }
        )

    return pd.DataFrame(report)


if __name__ == "__main__":
    print(compute_drift().to_dict(orient="records"))

