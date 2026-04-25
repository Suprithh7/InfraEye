import 'package:local_auth/local_auth.dart';

class DeviceAuthService {
  DeviceAuthService._();

  static final instance = DeviceAuthService._();
  final LocalAuthentication _auth = LocalAuthentication();

  Future<bool> ensureDeviceTrusted() async {
    final canCheck = await _auth.canCheckBiometrics || await _auth.isDeviceSupported();
    if (!canCheck) {
      return true;
    }

    return _auth.authenticate(
      localizedReason: 'Authenticate to access SlumSafe CV inspection data',
      biometricOnly: false,
      persistAcrossBackgrounding: true,
    );
  }
}

