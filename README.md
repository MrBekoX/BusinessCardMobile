# CardVault

Dijital kartvizit yönetim uygulaması. React Native ve Supabase ile geliştirilmiş cross-platform mobil uygulama.

## Özellikler

- **Kartvizit Yönetimi**: Oluşturma, düzenleme, silme, arama ve favorilere ekleme
- **QR Kod**: QR kod oluşturma ve kamera ile tarama
- **Koleksiyonlar**: Kartvizitleri kategorilere ayırma
- **Paylaşım**: vCard formatında dışa aktarma, sosyal medya paylaşımı
- **Offline Destek**: Çevrimdışı çalışma ve senkronizasyon kuyruğu
- **Tema**: Light/Dark mod ve sistem teması desteği
- **Güvenlik**: Input validasyonu, Row Level Security (RLS)

## Teknolojiler

| Kategori | Teknoloji |
|----------|-----------|
| Framework | React Native 0.81.5, Expo 54 |
| Backend | Supabase (PostgreSQL) |
| Navigation | React Navigation 6.x |
| State | React Context API |
| UI | React Native Vector Icons, Linear Gradient |
| QR | react-native-qrcode-svg, expo-camera |
| Storage | AsyncStorage, Expo Secure Store |
| Testing | Jest, ESLint, Prettier |

## Gereksinimler

- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI
- iOS Simulator / Android Emulator veya fiziksel cihaz

## Kurulum

1. **Repoyu klonlayın**

```bash
git clone https://github.com/kullaniciadi/cardvault.git
cd cardvault
```

2. **Bağımlılıkları yükleyin**

```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın**

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
APP_ENV=development
APP_VERSION=1.0.0
DEEP_LINK_SCHEME=cardvault
DEEP_LINK_PREFIX=cardvault://
```

Supabase key'lerinizi [Supabase Dashboard](https://supabase.com/dashboard) > Project Settings > API bölümünden alabilirsiniz.

4. **Uygulamayı başlatın**

```bash
npm start
```

Platform seçenekleri:

```bash
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   └── common/
│       ├── Card.js
│       ├── CustomInput.js
│       └── MemoizedButton.js
├── config/              # Yapılandırma dosyaları
│   ├── settings.js
│   └── errorMessages.js
├── constants/           # Sabitler
│   └── theme.js
├── context/             # React Context providers
│   ├── AuthContext.js
│   └── ThemeContext.js
├── lib/                 # Kütüphane entegrasyonları
│   ├── supabaseClient.js
│   └── databaseSetup.js
├── navigation/          # Navigasyon yapılandırması
│   ├── AppNavigator.js
│   ├── AuthNavigator.js
│   └── linking.js
├── screens/             # Ekranlar
│   ├── App/
│   │   ├── HomeScreen.js
│   │   ├── CardListScreen.js
│   │   ├── CardCreateScreen.js
│   │   ├── CardDetailScreen.js
│   │   ├── QRScannerScreen.js
│   │   ├── CollectionsScreen.js
│   │   └── SettingsScreen.js
│   └── Auth/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       └── ResetPasswordScreen.js
├── services/            # İş mantığı servisleri
│   ├── cardService.js
│   ├── collectionService.js
│   ├── profileService.js
│   ├── qrService.js
│   ├── shareService.js
│   └── offlineService.js
└── utils/               # Yardımcı fonksiyonlar
    ├── formatters.js
    └── validators.js
```

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm start` | Expo development server başlatır |
| `npm run android` | Android'de çalıştırır |
| `npm run ios` | iOS'te çalıştırır |
| `npm run web` | Web'de çalıştırır |
| `npm test` | Jest testlerini çalıştırır |
| `npm run lint` | ESLint ile kod kontrolü |
| `npm run lint:fix` | ESLint hatalarını otomatik düzeltir |

## Veritabanı

Supabase'de aşağıdaki tablolar kullanılmaktadır:

- `profiles` - Kullanıcı profilleri
- `cards` - Kartvizitler
- `collections` - Koleksiyonlar
- `card_collections` - Kartvizit-koleksiyon ilişkisi

Migration dosyaları `supabase/migrations/` klasöründe bulunmaktadır.

## Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `SUPABASE_URL` | Supabase proje URL'i | Evet |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Evet |
| `APP_ENV` | Ortam (development/production) | Hayır |
| `APP_VERSION` | Uygulama versiyonu | Hayır |
| `DEEP_LINK_SCHEME` | Deep link şeması | Hayır |
| `DEEP_LINK_PREFIX` | Deep link prefix'i | Hayır |

## Platform Desteği

- iOS 13.0+
- Android API 21+ (Android 5.0)
- Web (modern tarayıcılar)

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'e push yapın (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.
