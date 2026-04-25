import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

import '../../../l10n/app_localizations.dart';
import '../../inspection/application/edge_inference_service.dart';
import '../../inspection/domain/inspection_record.dart';
import '../../inspection/domain/sync_status.dart';
import '../../../core/sync/sync_engine.dart';

class InspectionShell extends StatefulWidget {
  const InspectionShell({super.key});

  @override
  State<InspectionShell> createState() => _InspectionShellState();
}

class _InspectionShellState extends State<InspectionShell> {
  final EdgeInferenceService _inference = EdgeInferenceService();
  late final SyncEngine _syncEngine;
  DetectionResult? _lastResult;
  bool _queued = false;

  @override
  void initState() {
    super.initState();
    _syncEngine = SyncEngine(Hive.box<Map>('inspection_queue'));
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

    await _syncEngine.enqueue(record);
    setState(() {
      _lastResult = result;
      _queued = true;
    });
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
            FilledButton.icon(
              onPressed: _captureAndQueue,
              icon: const Icon(Icons.camera_alt_outlined),
              label: Text(l10n.captureCta),
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
                      if (_queued) const Text('Saved securely for sync when connectivity is available.'),
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

