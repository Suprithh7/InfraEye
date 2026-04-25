import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

import '../../../core/network/api_client.dart';
import '../../../core/sync/sync_engine.dart';
import '../../../l10n/app_localizations.dart';
import '../../inspection/application/edge_inference_service.dart';
import '../../inspection/application/inspection_sync_service.dart';
import '../../inspection/domain/inspection_record.dart';
import '../../inspection/domain/sync_status.dart';

class InspectionShell extends StatefulWidget {
  const InspectionShell({super.key});

  @override
  State<InspectionShell> createState() => _InspectionShellState();
}

class _InspectionShellState extends State<InspectionShell> {
  final EdgeInferenceService _inference = EdgeInferenceService();
  late final SyncEngine _syncEngine;
  late final InspectionSyncService _syncService;
  DetectionResult? _lastResult;
  String _statusMessage = 'Ready for offline capture.';
  int _pendingCount = 0;
  bool _syncing = false;

  @override
  void initState() {
    super.initState();
    _syncEngine = SyncEngine(Hive.box<Map>('inspection_queue'));
    _syncService = InspectionSyncService(
      syncEngine: _syncEngine,
      apiClient: ApiClient(),
    );
    _refreshPendingCount();
  }

  Future<void> _refreshPendingCount() async {
    final pendingCount = await _syncEngine.pendingCount();
    if (!mounted) {
      return;
    }

    setState(() {
      _pendingCount = pendingCount;
    });
  }

  Future<void> _captureAndQueue() async {
    final result = await _inference.runDemoInference();
    final now = DateTime.now();
    final record = InspectionRecord(
      id: 'local-${now.microsecondsSinceEpoch}',
      structureId: 'STR-001',
      cityId: 'mumbai-dharavi',
      crackCount: result.crackCount,
      spallAreaRatio: result.spallAreaRatio,
      leaningSeverity: result.leaningSeverity,
      blurVariance: 132.2,
      lightingScore: 0.61,
      updatedAt: now,
      syncStatus: SyncStatus.pending,
    );

    await _syncService.enqueue(record);
    await _refreshPendingCount();
    setState(() {
      _lastResult = result;
      _statusMessage = 'Captured securely and queued for sync.';
    });
  }

  Future<void> _syncQueuedInspections() async {
    setState(() {
      _syncing = true;
      _statusMessage = 'Syncing queued inspections to the gateway...';
    });

    try {
      final syncedCount = await _syncService.syncPending();
      await _refreshPendingCount();
      setState(() {
        _statusMessage = 'Sync complete. $syncedCount inspection(s) accepted by the gateway.';
      });
    } catch (_) {
      setState(() {
        _statusMessage = 'Sync failed. Inspections remain queued for retry.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _syncing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.appTitle),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.captureHeadline,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l10n.guidanceTitle, style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    const Text('1. Frame the wall edge-to-edge.'),
                    const Text('2. Ensure cracks are visible and evenly lit.'),
                    const Text('3. Capture, validate, and queue in under three taps.'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                FilledButton.icon(
                  onPressed: _captureAndQueue,
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: Text(l10n.captureCta),
                ),
                OutlinedButton.icon(
                  onPressed: _syncing ? null : _syncQueuedInspections,
                  icon: _syncing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.sync_outlined),
                  label: Text('Sync queue ($_pendingCount)'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Card(
              color: const Color(0xFFF1F5F9),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(_statusMessage),
              ),
            ),
            const SizedBox(height: 16),
            if (_lastResult != null)
              Card(
                color: const Color(0xFFE8F5E9),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('On-device inference: ${_lastResult!.latencyMs} ms'),
                      Text('Cracks: ${_lastResult!.crackCount}'),
                      Text('Spall ratio: ${_lastResult!.spallAreaRatio.toStringAsFixed(2)}'),
                      Text('Leaning severity: ${_lastResult!.leaningSeverity.toStringAsFixed(2)}'),
                      Text('Pending local queue: $_pendingCount'),
                    ],
                  ),
                ),
              ),
            const Spacer(),
            Row(
              children: [
                const Icon(Icons.wifi_off, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    l10n.offlineReady,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
