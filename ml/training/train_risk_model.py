from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split


ROOT = Path(__file__).resolve().parents[2]
DEMO_DIR = ROOT / "data" / "demo"
ARTIFACTS_DIR = ROOT / "ml" / "artifacts"


@dataclass
class TrainingResult:
    auc: float
    model_path: Path
    feature_path: Path


def build_training_frame() -> pd.DataFrame:
    structures = pd.read_csv(DEMO_DIR / "structures.csv")
    satellite = pd.read_csv(DEMO_DIR / "satellite_features.csv")

    frame = structures.merge(satellite, on="structure_id", how="left")
    frame["rainfall_mm_7d"] = [88, 32, 74, 21, 60]
    frame["prior_repairs"] = [2, 0, 1, 0, 3]
    frame["crack_count"] = [13, 2, 8, 1, 6]
    frame["spall_area_ratio"] = [0.22, 0.05, 0.17, 0.03, 0.13]
    frame["leaning_severity"] = [0.41, 0.08, 0.52, 0.03, 0.21]
    frame["inspection_gap_days"] = frame["last_inspection_days"]
    frame["collapse_30d"] = [1, 0, 1, 0, 1]
    return frame


def train_model(frame: pd.DataFrame) -> TrainingResult:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    features = [
        "crack_count",
        "spall_area_ratio",
        "leaning_severity",
        "optical_delta",
        "sar_delta",
        "rainfall_mm_7d",
        "structure_age_years",
        "inspection_gap_days",
        "prior_repairs",
    ]
    x = frame[features]
    y = frame["collapse_30d"]

    if len(frame) < 10:
        replicated = pd.concat([frame] * 40, ignore_index=True)
        replicated["noise"] = np.random.default_rng(42).normal(0, 0.02, len(replicated))
        replicated["spall_area_ratio"] = (
            replicated["spall_area_ratio"] + replicated["noise"]
        ).clip(0, 1)
        replicated["leaning_severity"] = (
            replicated["leaning_severity"] + replicated["noise"]
        ).clip(0, 1)
        x = replicated[features]
        y = replicated["collapse_30d"]

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.25, random_state=42, stratify=y
    )

    model = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="auc",
    )
    model.fit(x_train, y_train)
    predictions = model.predict_proba(x_test)[:, 1]
    auc = roc_auc_score(y_test, predictions)

    model_path = ARTIFACTS_DIR / "risk_model.joblib"
    feature_path = ARTIFACTS_DIR / "feature_columns.joblib"
    joblib.dump(model, model_path)
    joblib.dump(features, feature_path)

    return TrainingResult(auc=auc, model_path=model_path, feature_path=feature_path)


if __name__ == "__main__":
    frame = build_training_frame()
    result = train_model(frame)
    print({"auc": round(result.auc, 4), "model_path": str(result.model_path)})
