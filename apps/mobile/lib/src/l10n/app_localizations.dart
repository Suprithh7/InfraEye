import 'package:flutter/widgets.dart';

class AppLocalizations {
  AppLocalizations(this.locale);

  final Locale locale;

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const _localized = {
    'en': {
      'appTitle': 'SlumSafe CV',
      'captureHeadline': 'Rapid structural inspection',
      'guidanceTitle': 'Capture guidance',
      'captureCta': 'Capture and queue',
      'offlineReady': 'Offline-first mode keeps inspections encrypted until sync succeeds.',
    },
    'hi': {
      'appTitle': 'स्लमसेफ सीवी',
      'captureHeadline': 'तेज़ संरचनात्मक निरीक्षण',
      'guidanceTitle': 'कैप्चर मार्गदर्शन',
      'captureCta': 'कैप्चर करें और कतार में रखें',
      'offlineReady': 'ऑफलाइन मोड निरीक्षणों को सिंक होने तक एन्क्रिप्टेड रखता है।',
    },
  };

  String get appTitle => _localized[locale.languageCode]!['appTitle']!;
  String get captureHeadline => _localized[locale.languageCode]!['captureHeadline']!;
  String get guidanceTitle => _localized[locale.languageCode]!['guidanceTitle']!;
  String get captureCta => _localized[locale.languageCode]!['captureCta']!;
  String get offlineReady => _localized[locale.languageCode]!['offlineReady']!;
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'hi'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async => AppLocalizations(locale);

  @override
  bool shouldReload(covariant LocalizationsDelegate<AppLocalizations> old) => false;
}

