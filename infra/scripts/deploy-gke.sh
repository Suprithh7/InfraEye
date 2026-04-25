#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-slumsafe-prod}"
CLUSTER_NAME="${CLUSTER_NAME:-slumsafe-gke}"
REGION="${REGION:-asia-south1}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

gcloud container clusters get-credentials "$CLUSTER_NAME" --region "$REGION" --project "$PROJECT_ID"
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/api-gateway.yaml
kubectl apply -f infra/k8s/services.yaml
kubectl apply -f infra/k8s/dashboard.yaml
kubectl -n slumsafe set image deployment/api-gateway api-gateway="gcr.io/$PROJECT_ID/api-gateway:$IMAGE_TAG"
kubectl -n slumsafe set image deployment/inspection-service inspection-service="gcr.io/$PROJECT_ID/inspection-service:$IMAGE_TAG"
kubectl -n slumsafe set image deployment/risk-scoring-service risk-scoring-service="gcr.io/$PROJECT_ID/risk-scoring-service:$IMAGE_TAG"
kubectl -n slumsafe set image deployment/satellite-service satellite-service="gcr.io/$PROJECT_ID/satellite-service:$IMAGE_TAG"
kubectl -n slumsafe set image deployment/notification-service notification-service="gcr.io/$PROJECT_ID/notification-service:$IMAGE_TAG"
kubectl -n slumsafe set image deployment/data-processing-service data-processing-service="gcr.io/$PROJECT_ID/data-processing-service:$IMAGE_TAG"
kubectl -n slumsafe set image deployment/dashboard dashboard="gcr.io/$PROJECT_ID/dashboard:$IMAGE_TAG"
