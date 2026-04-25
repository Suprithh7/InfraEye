import 'dart:convert';
import 'dart:math';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

class EncryptedStore {
  EncryptedStore._();

  static final instance = EncryptedStore._();
  static const _keyName = 'hive_encryption_key';
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  Future<void> initialize() async {
    await Hive.initFlutter();
    final key = await _loadOrCreateKey();
    await Hive.openBox<Map>('inspection_queue', encryptionCipher: HiveAesCipher(key));
  }

  Future<List<int>> _loadOrCreateKey() async {
    final existing = await _secureStorage.read(key: _keyName);
    if (existing != null) {
      return List<int>.from(jsonDecode(existing) as List<dynamic>);
    }

    final random = Random.secure();
    final key = List<int>.generate(32, (_) => random.nextInt(255));
    await _secureStorage.write(key: _keyName, value: jsonEncode(key));
    return key;
  }
}

