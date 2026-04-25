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

  Future<void> markSynced(String id) async {
    final current = _box.get(id);
    if (current == null) {
      return;
    }

    await _box.put(id, {
      ...Map<String, dynamic>.from(current),
      'syncStatus': SyncStatus.synced.name,
    });
  }

  Future<void> resolveConflict(InspectionRecord local, InspectionRecord remote) async {
    final winner = local.updatedAt.isAfter(remote.updatedAt) ? local : remote;
    await _box.put(winner.id, winner.toMap());
  }
}

