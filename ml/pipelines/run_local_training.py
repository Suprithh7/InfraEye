from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from training.train_risk_model import build_training_frame, train_model


if __name__ == "__main__":
    frame = build_training_frame()
    result = train_model(frame)
    print(
        {
            "status": "trained",
            "auc": round(result.auc, 4),
            "target_auc": 0.83,
            "meets_target": result.auc >= 0.83,
        }
    )
