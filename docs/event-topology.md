# Event topology

## Topics

- `inspection.created`
- `inspection.media_uploaded`
- `inspection.sync_failed`
- `satellite.refresh_requested`
- `satellite.features_ready`
- `risk.score_requested`
- `risk.scored`
- `notification.dispatch_requested`
- `audit.activity_logged`

## Processing chain

1. Mobile sync creates an inspection and uploads images.
2. `inspection.created` triggers metadata persistence.
3. `inspection.media_uploaded` triggers feature extraction and a satellite refresh.
4. `satellite.features_ready` and weather enrichment trigger `risk.score_requested`.
5. `risk.scored` updates Firestore, BigQuery, and the ranked queue.
6. High-risk thresholds emit `notification.dispatch_requested`.

