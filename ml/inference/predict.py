from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
import shap


ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = ROOT / "ml" / "artifacts"
DEMO_DIR = ROOT / "data" / "demo"


def load_model():
    model = joblib.load(ARTIFACTS_DIR / "risk_model.joblib")
    features = joblib.load(ARTIFACTS_DIR / "feature_columns.joblib")
    return model, features


def score_demo_frame() -> pd.DataFrame:
    model, feature_columns = load_model()
    structures = pd.read_csv(DEMO_DIR / "structures.csv")
    satellite = pd.read_csv(DEMO_DIR / "satellite_features.csv")
    frame = structures.merge(satellite, on="structure_id", how="left")
    frame["rainfall_mm_7d"] = [88, 32, 74, 21, 60]
    frame["prior_repairs"] = [2, 0, 1, 0, 3]
    frame["crack_count"] = [13, 2, 8, 1, 6]
    frame["spall_area_ratio"] = [0.22, 0.05, 0.17, 0.03, 0.13]
    frame["leaning_severity"] = [0.41, 0.08, 0.52, 0.03, 0.21]
    frame["inspection_gap_days"] = frame["last_inspection_days"]

    probabilities = model.predict_proba(frame[feature_columns])[:, 1]
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(frame[feature_columns])

    frame["risk_probability"] = probabilities
    top_features = []
    for index in range(len(frame)):
        contributions = pd.Series(shap_values[index], index=feature_columns).abs().sort_values(ascending=False)
        top_features.append(list(contributions.head(3).index))

    frame["top_factors"] = top_features
    return frame[
        ["structure_id", "city_id", "risk_probability", "top_factors", "coverage_status"]
    ]


if __name__ == "__main__":
    print(score_demo_frame().to_dict(orient="records"))

