import json
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from inference.predict import score_demo_frame


if __name__ == "__main__":
    frame = score_demo_frame()
    summary = frame[["structure_id", "top_factors"]].to_dict(orient="records")
    print(json.dumps(summary, indent=2))
