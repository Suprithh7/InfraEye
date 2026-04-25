# SlumSafe CV

SlumSafe CV is a production-grade, multi-city AI platform for municipal infrastructure risk monitoring in informal settlements. The repository is organized as a monorepo with a Flutter mobile client, TypeScript microservices, a React admin dashboard, ML pipelines for risk modeling, and GKE-ready deployment assets.

## Platform goals

- Detect structural damage on-device with TensorFlow Lite.
- Fuse ground inspection, satellite, weather, and history signals.
- Produce explainable 30-day collapse risk scores.
- Prioritize field work with a ranked inspection queue.
- Operate reliably with patchy connectivity and noisy data.

## Repository layout

- `apps/mobile`: Flutter inspector app with offline-first capture workflow.
- `apps/dashboard`: React + TypeScript admin dashboard.
- `services/api-gateway`: REST + gRPC edge layer.
- `services/inspection-service`: Inspection ingestion and metadata handling.
- `services/risk-scoring-service`: Feature fusion and Vertex AI risk orchestration.
- `services/satellite-service`: Earth Engine and remote sensing fallback workflows.
- `services/notification-service`: FCM push notification service.
- `services/data-processing-service`: Pub/Sub-driven asynchronous processors.
- `packages/shared`: Shared domain types, event contracts, and service utilities.
- `ml`: Training, feature engineering, monitoring, and Vertex AI pipelines.
- `infra`: Docker, Kubernetes, and deployment automation.
- `docs`: Architecture, API, and demo documentation.
- `data/demo`: Preloaded demo dataset and precomputed outputs.

## Quick start

1. Install Node.js 20+, Flutter 3.24+, Python 3.11+, and Docker.
2. Copy `.env.example` files from the individual apps and services as needed.
3. Start the backend services locally with Docker Compose:

```bash
docker compose -f infra/docker-compose.demo.yml up --build
```

4. Run the dashboard:

```bash
cd apps/dashboard
npm install
npm run dev
```

5. Run the mobile app:

```bash
cd apps/mobile
flutter pub get
flutter run --dart-define=SLUMSAFE_API_URL=http://10.0.2.2:8080
```

6. Train the demo risk model:

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python pipelines/run_local_training.py
```

## Local demo verification

With the API gateway running locally, verify the demo endpoints:

```powershell
powershell -ExecutionPolicy Bypass -File infra/scripts/verify-demo.ps1
```

The dashboard uses the same gateway contracts for city summary, ranked queue, structure detail, exports, and audit activity. The mobile app now queues inspections locally and can sync them to the gateway with the `Sync queue` action.

## Demo mode

Demo mode is backed by preloaded structures, simulated satellite deltas, and precomputed risk scores in `data/demo`. The dashboard and mobile app can run entirely against the demo stack to show a before-and-after workflow for random versus risk-prioritized inspections.

## Core architecture

The platform follows:

- Clean Architecture for service boundaries and testability.
- Domain-driven design with bounded contexts per microservice.
- Event-driven workflows with Google Pub/Sub topics.
- GCP-native storage and compute: Firestore, BigQuery, Cloud Storage, Vertex AI, and GKE.

See [docs/architecture.md](/C:/Users/suprisuprith/InfraEye/docs/architecture.md) for the full architecture diagram and [docs/demo-walkthrough.md](/C:/Users/suprisuprith/InfraEye/docs/demo-walkthrough.md) for the demo script.
