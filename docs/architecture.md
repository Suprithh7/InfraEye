# SlumSafe CV Architecture

## System diagram

```mermaid
flowchart LR
    subgraph Mobile["Mobile Edge Layer (Flutter)"]
        Capture["Camera Capture + Guidance"]
        EdgeCV["TFLite YOLOv8 INT8"]
        Offline["Offline Queue + Encrypted Storage"]
        Sync["Sync Engine"]
    end

    subgraph Gateway["API Gateway Layer"]
        Api["REST / gRPC Gateway"]
        Auth["OAuth2 / Firebase Auth"]
        Audit["Audit Log Middleware"]
    end

    subgraph Services["AI Inference Services"]
        Inspection["Inspection Service"]
        Risk["Risk Scoring Service"]
        Satellite["Satellite Service"]
        Notify["Notification Service"]
    end

    subgraph Processing["Data Processing Layer"]
        PubSub["Google Pub/Sub"]
        Worker["Feature / Event Workers"]
        Batch["Daily Batch Jobs"]
        FeatureStore["Feature Store"]
        Vertex["Vertex AI Endpoint"]
        GEE["Google Earth Engine"]
        Weather["Open-Meteo"]
        OSM["OpenStreetMap Fallback"]
    end

    subgraph Data["Storage"]
        Firestore["Firestore"]
        BigQuery["BigQuery"]
        GCS["Cloud Storage"]
    end

    subgraph Analytics["Analytics + Visualization"]
        Dashboard["React Admin Dashboard"]
        Maps["Google Maps Heatmap"]
        Reports["PDF / CSV Reporting"]
    end

    Capture --> EdgeCV --> Offline --> Sync --> Api
    Api --> Auth
    Api --> Inspection
    Api --> Risk
    Api --> Satellite
    Api --> Notify
    Inspection --> PubSub
    Satellite --> PubSub
    Risk --> PubSub
    PubSub --> Worker --> FeatureStore
    Worker --> Firestore
    Worker --> BigQuery
    Inspection --> GCS
    Risk --> Vertex
    Satellite --> GEE
    Satellite --> Weather
    Satellite --> OSM
    Firestore --> Dashboard
    BigQuery --> Dashboard
    Dashboard --> Maps
    Dashboard --> Reports
    Notify --> Dashboard
```

## Bounded contexts

- `Inspection`: capture sessions, media metadata, upload lifecycle, and inspector workflow state.
- `Risk`: feature aggregation, explainability, ranking, confidence scoring, and reinspection scheduling.
- `Satellite`: parcel lookup, Earth Engine orchestration, fallback radar analysis, and coverage health.
- `Notification`: alerts, escalation policies, and multi-role delivery.
- `Analytics`: heatmaps, drill-down metrics, exports, and multi-city tenancy.

## Architectural decisions

- Offline-first mobile workflow stores inspections locally and syncs with idempotent retries.
- Event-driven communication decouples upload, enrichment, scoring, and notification steps.
- Firestore supports operational sync; BigQuery stores analytical and ML feature tables.
- Vertex AI hosts the risk model while the mobile app runs quantized damage detection on-device.
- Demo mode mirrors production contracts but sources features from `data/demo` rather than live systems.

## Reliability and degraded modes

- Poor image quality triggers a retake prompt before an upload event is emitted.
- Missing satellite optical coverage falls back to Sentinel-1 SAR; if both fail, the feature vector is marked partial and the risk model lowers confidence.
- Missing building footprints fall back from municipal GIS to OpenStreetMap-derived polygons.
- All services emit audit logs and trace IDs for replay and incident response.

## Scalability notes

- Services are stateless and horizontally scalable on GKE.
- Pub/Sub smooths bursty mobile uploads during city-wide campaigns.
- Feature aggregation is partitioned by `city_id` and `structure_id` for multi-city tenancy.
- Dashboard analytics query BigQuery materialized views rather than operational collections.

