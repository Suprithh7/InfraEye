import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';

import 'src/core/auth/device_auth_service.dart';
import 'src/core/storage/encrypted_store.dart';
import 'src/features/inspection/presentation/inspection_shell.dart';
import 'src/l10n/app_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EncryptedStore.instance.initialize();

  runApp(const SlumSafeMobileApp());
}

class SlumSafeMobileApp extends StatelessWidget {
  const SlumSafeMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      routes: [
        GoRoute(
          path: '/',
          builder: (_, __) => const InspectionShell(),
        ),
      ],
    );

    return MaterialApp.router(
      title: 'SlumSafe CV',
      routerConfig: router,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('hi'),
      ],
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0B6E4F),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      builder: (context, child) {
        return FutureBuilder<bool>(
          future: DeviceAuthService.instance.ensureDeviceTrusted(),
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Material(
                child: Center(child: CircularProgressIndicator()),
              );
            }

            return child ?? const SizedBox.shrink();
          },
        );
      },
    );
  }
}

