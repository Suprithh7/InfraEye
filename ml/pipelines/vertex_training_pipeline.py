from __future__ import annotations

from kfp import dsl


@dsl.component(base_image="python:3.11")
def train_component() -> str:
    return "Train XGBoost risk model using BigQuery-exported feature tables and register to Vertex Model Registry."


@dsl.component(base_image="python:3.11")
def evaluate_component() -> str:
    return "Evaluate weekly model performance, compute AUC, and emit drift statistics."


@dsl.component(base_image="python:3.11")
def deploy_component() -> str:
    return "Deploy candidate model to Vertex AI Endpoint if AUC >= 0.83 and no severe drift alert exists."


@dsl.pipeline(
    name="slumsafe-risk-training",
    description="Weekly retraining pipeline for SlumSafe CV risk prediction.",
)
def risk_training_pipeline():
    trained = train_component()
    evaluated = evaluate_component().after(trained)
    deploy_component().after(evaluated)


if __name__ == "__main__":
    from kfp import compiler

    compiler.Compiler().compile(
        pipeline_func=risk_training_pipeline,
        package_path="ml/artifacts/vertex_training_pipeline.json",
    )

