# ML stack

The ML directory contains the risk prediction training pipeline, explainability helpers, local demo training entrypoints, and lightweight monitoring utilities.

## Components

- `training/train_risk_model.py`: feature preparation and XGBoost training.
- `inference/predict.py`: batch scoring and explanation generation.
- `pipelines/vertex_training_pipeline.py`: Vertex AI pipeline definition.
- `monitoring/drift_report.py`: weekly drift checks against baseline feature statistics.
- `feature_store/feature_schema.yaml`: canonical feature contract.

