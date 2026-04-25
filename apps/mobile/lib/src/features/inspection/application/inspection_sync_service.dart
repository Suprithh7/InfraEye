import '../../../core/network/api_client.dart';
import '../../../core/sync/sync_engine.dart';
import '../domain/inspection_record.dart';

class InspectionSyncService {
  InspectionSyncService({
    required this.syncEngine,
    required this.apiClient,
  });

  final SyncEngine syncEngine;
  final ApiClient apiClient;

  Future<int> syncPending() async {
    final pending = await syncEngine.pending();
    var syncedCount = 0;

    for (final record in pending) {
      try {
        await syncEngine.markSyncing(record.id);
        final remoteInspectionId = await apiClient.createInspection(record);
        await apiClient.syncInspection(
          inspectionId: remoteInspectionId,
          cityId: record.cityId,
        );
        await syncEngine.markSynced(record.id, remoteInspectionId);
        syncedCount += 1;
      } catch (_) {
        await syncEngine.markFailed(record.id);
      }
    }

    return syncedCount;
  }

  Future<void> enqueue(InspectionRecord record) {
    return syncEngine.enqueue(record);
  }
}
