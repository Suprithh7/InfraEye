import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../features/inspection/domain/inspection_record.dart';

class ApiClient {
  ApiClient({
    http.Client? client,
    String? baseUrl,
    this.role = 'Inspector',
  })  : _client = client ?? http.Client(),
        baseUrl = baseUrl ?? const String.fromEnvironment('SLUMSAFE_API_URL', defaultValue: 'http://10.0.2.2:8080');

  final http.Client _client;
  final String baseUrl;
  final String role;

  Future<String> createInspection(InspectionRecord record) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/v1/inspections'),
      headers: {
        'content-type': 'application/json',
        'x-demo-role': role,
      },
      body: jsonEncode({
        'cityId': record.cityId,
        'structureId': record.structureId,
        'inspectorId': 'mobile-demo-inspector',
        'imageCount': 1,
        'damageFeatures': {
          'crackCount': record.crackCount,
          'spallAreaRatio': record.spallAreaRatio,
          'leaningSeverity': record.leaningSeverity,
        },
        'captureQuality': {
          'blurVariance': record.blurVariance,
          'lightingScore': record.lightingScore,
        },
        'capturedAt': record.updatedAt.toIso8601String(),
      }),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to create inspection: ${response.statusCode}');
    }

    final payload = jsonDecode(response.body) as Map<String, dynamic>;
    return payload['inspectionId'] as String;
  }

  Future<void> syncInspection({
    required String inspectionId,
    required String cityId,
  }) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/v1/inspections/$inspectionId/sync'),
      headers: {
        'content-type': 'application/json',
        'x-demo-role': role,
      },
      body: jsonEncode({
        'cityId': cityId,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to sync inspection: ${response.statusCode}');
    }
  }
}

