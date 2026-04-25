import 'sync_status.dart';

class InspectionRecord {
  InspectionRecord({
    required this.id,
    required this.structureId,
    required this.cityId,
    required this.crackCount,
    required this.spallAreaRatio,
    required this.leaningSeverity,
    required this.blurVariance,
    required this.lightingScore,
    required this.updatedAt,
    required this.syncStatus,
    this.remoteInspectionId,
  });

  final String id;
  final String structureId;
  final String cityId;
  final int crackCount;
  final double spallAreaRatio;
  final double leaningSeverity;
  final double blurVariance;
  final double lightingScore;
  final DateTime updatedAt;
  final SyncStatus syncStatus;
  final String? remoteInspectionId;

  Map<String, dynamic> toMap() => {
        'id': id,
        'structureId': structureId,
        'cityId': cityId,
        'crackCount': crackCount,
        'spallAreaRatio': spallAreaRatio,
        'leaningSeverity': leaningSeverity,
        'blurVariance': blurVariance,
        'lightingScore': lightingScore,
        'updatedAt': updatedAt.toIso8601String(),
        'syncStatus': syncStatus.name,
        'remoteInspectionId': remoteInspectionId,
      };

  factory InspectionRecord.fromMap(Map<String, dynamic> map) => InspectionRecord(
        id: map['id'] as String,
        structureId: map['structureId'] as String,
        cityId: map['cityId'] as String,
        crackCount: map['crackCount'] as int,
        spallAreaRatio: (map['spallAreaRatio'] as num).toDouble(),
        leaningSeverity: (map['leaningSeverity'] as num).toDouble(),
        blurVariance: (map['blurVariance'] as num).toDouble(),
        lightingScore: (map['lightingScore'] as num).toDouble(),
        updatedAt: DateTime.parse(map['updatedAt'] as String),
        syncStatus: SyncStatus.values.byName(map['syncStatus'] as String),
        remoteInspectionId: map['remoteInspectionId'] as String?,
      );
}
