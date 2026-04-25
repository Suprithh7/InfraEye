import 'package:hive/hive.dart';

import '../../features/inspection/domain/inspection_record.dart';
import '../../features/inspection/domain/sync_status.dart';

class SyncEngine {
  SyncEngine(this._box);

  final Box<Map> _box;

  Future<void> enqueue(InspectionRecord record) async {
    await _box.put(record.id, record.toMap());
  }

  Future<List<InspectionRecord>> pending() async {
    return _box.values
        .map((row) => InspectionRecord.fromMap(Map<String, dynamic>.from(row)))
        .where((record) => record.syncStatus != SyncStatus.synced)
        .toList()
      ..sort((a, b) => a.updatedAt.compareTo(b.updatedAt));
  }

  Future<int> pendingCount() async {
    return (await pending()).length;
  }

  Future<void> markSyncing(String id) async {
    await _update(id, {
      'syncStatus': SyncStatus.syncing.name,
    });
  }

  Future<void> markSynced(String id, String remoteInspectionId) async {
    await _update(id, {
      'syncStatus': SyncStatus.synced.name,
      'remoteInspectionId': remoteInspectionId,
    });
  }

  Future<void> markFailed(String id) async {
    await _update(id, {
      'syncStatus': SyncStatus.failed.name,
    });
  }

  Future<void> _update(String id, Map<String, dynamic> patch) async {
    final current = _box.get(id);
    if (current == null) {
      return;
    }

    await _box.put(id, {
      ...Map<String, dynamic>.from(current),
      ...patch,
    });
  }

  Future<void> resolveConflict(InspectionRecord local, InspectionRecord remote) async {
    final winner = local.updatedAt.isAfter(remote.updatedAt) ? local : remote;
    await _box.put(winner.id, winner.toMap());
  }
}
