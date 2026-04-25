import 'package:image/image.dart' as img;

class CaptureQualityResult {
  CaptureQualityResult({
    required this.blurVariance,
    required this.lightingScore,
    required this.isAcceptable,
    required this.reason,
  });

  final double blurVariance;
  final double lightingScore;
  final bool isAcceptable;
  final String reason;
}

class CaptureQualityService {
  CaptureQualityResult validate(img.Image image) {
    final blurVariance = _estimateLaplacianVariance(image);
    final lightingScore = _estimateLighting(image);

    if (blurVariance < 110) {
      return CaptureQualityResult(
        blurVariance: blurVariance,
        lightingScore: lightingScore,
        isAcceptable: false,
        reason: 'Image is too blurry. Retake with steadier framing.',
      );
    }

    if (lightingScore < 0.35) {
      return CaptureQualityResult(
        blurVariance: blurVariance,
        lightingScore: lightingScore,
        isAcceptable: false,
        reason: 'Lighting is too low. Move closer or improve visibility.',
      );
    }

    return CaptureQualityResult(
      blurVariance: blurVariance,
      lightingScore: lightingScore,
      isAcceptable: true,
      reason: 'Capture quality is acceptable.',
    );
  }

  double _estimateLaplacianVariance(img.Image image) {
    double mean = 0;
    double squared = 0;
    int samples = 0;

    for (var y = 1; y < image.height - 1; y += 4) {
      for (var x = 1; x < image.width - 1; x += 4) {
        final center = img.getLuminance(image.getPixel(x, y));
        final up = img.getLuminance(image.getPixel(x, y - 1));
        final down = img.getLuminance(image.getPixel(x, y + 1));
        final left = img.getLuminance(image.getPixel(x - 1, y));
        final right = img.getLuminance(image.getPixel(x + 1, y));
        final laplacian = (4 * center - up - down - left - right).toDouble();
        mean += laplacian;
        squared += laplacian * laplacian;
        samples++;
      }
    }

    if (samples == 0) {
      return 0;
    }

    final avg = mean / samples;
    return (squared / samples) - (avg * avg);
  }

  double _estimateLighting(img.Image image) {
    double luminance = 0;
    int samples = 0;

    for (var y = 0; y < image.height; y += 8) {
      for (var x = 0; x < image.width; x += 8) {
        luminance += img.getLuminance(image.getPixel(x, y));
        samples++;
      }
    }

    return samples == 0 ? 0 : (luminance / samples) / 255.0;
  }
}

