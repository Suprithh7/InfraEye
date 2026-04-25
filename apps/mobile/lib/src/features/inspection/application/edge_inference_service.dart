class DetectionResult {
  DetectionResult({
    required this.crackCount,
    required this.spallAreaRatio,
    required this.leaningSeverity,
    required this.latencyMs,
  });

  final int crackCount;
  final double spallAreaRatio;
  final double leaningSeverity;
  final int latencyMs;
}

class EdgeInferenceService {
  Future<DetectionResult> runDemoInference() async {
    await Future<void>.delayed(const Duration(milliseconds: 420));
    return DetectionResult(
      crackCount: 11,
      spallAreaRatio: 0.18,
      leaningSeverity: 0.36,
      latencyMs: 420,
    );
  }
}

