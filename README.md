# CardVault - Dijital Kartvizit Yönetim Uygulaması

## 📱 Proje Özeti

CardVault, React Native ve Supabase kullanılarak geliştirilmiş, kullanıcıların dijital kartvizitlerini oluşturup yönetebileceği kurumsal düzeyde bir mobil uygulamadır.

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- E-posta ve şifre ile giriş
- Yeni kullanıcı kaydı
- Şifre sıfırlama
- Güvenli oturum yönetimi

### 💳 Kartvizit Yönetimi
- Yeni kartvizit oluşturma
- Kartvizit düzenleme ve silme
- QR kod tarama ve oluşturma
- vCard formatında dışa aktarma

### 📁 Koleksiyonlar
- Kartvizitleri kategorilere ayırma
- Özel koleksiyonlar oluşturma
- Koleksiyon bazında filtreleme

### 🎨 Tema Sistemi
- Light/Dark mod desteği
- Sistem teması otomatik algılama
- Tema değiştirme özelliği

### 📱 Modern UI/UX
- Material Design prensipleri
- Responsive tasarım
- Smooth animasyonlar
- Erişilebilirlik desteği

### 🔒 Güvenlik
- Input validasyonu
- XSS koruması
- Güvenli veri saklama
- Row Level Security (RLS)

### 📶 Offline Destek
- Cache yönetimi
- Offline işlem kuyruğu
- Ağ bağlantısı koptuğunda veri senkronizasyonu

## 🛠️ Teknoloji Stack

### Frontend
- **React Native** - Cross-platform mobil uygulama geliştirme
- **Expo** - React Native geliştirme platformu
- **React Navigation** - Navigasyon yönetimi
- **React Context API** - State yönetimi

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Veritabanı
- **Row Level Security** - Veri güvenliği

### Araçlar ve Kütüphaneler
- **TypeScript** - Tip güvenliği
- **ESLint** - Kod kalitesi
- **Prettier** - Kod formatlama
- **React Native Vector Icons** - İkon kütüphanesi

## 📋 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn
- Expo CLI
- Git

### Adım Adım Kurulum

1. **Projeyi klonlayın**
```bash
git clone https://github.com/yourusername/cardvault.git
cd cardvault
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
# veya
yarn install
```

3. **Çevre değişkenlerini ayarlayın**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Uygulamayı başlatın**
```bash
npm start
# veya
expo start
```


## 🚀 Kullanım

### Giriş Yapma
1. Uygulamayı açın
2. Kayıtlı bir kullanıcıysanız e-posta ve şifrenizle giriş yapın
3. Yeni kullanıcıysanız "Hesap Oluştur" butonuna tıklayın

### Kartvizit Oluşturma
1. Ana ekranda "+" butonuna tıklayın
2. Gerekli bilgileri doldurun
3. "Kartvizit Oluştur" butonuna tıklayın

### QR Kod Tarama
1. Alt navigasyonda QR ikonuna tıklayın
2. Kamerayı QR koduna tutun
3. Otomatik olarak taranacaktır

### Koleksiyon Yönetimi
1. "Koleksiyonlar" sekmesine gidin
2. Yeni koleksiyon oluşturun
3. Kartvizitleri koleksiyonlara ekleyin

## 🔒 Güvenlik

### Uygulanan Güvenlik Önlemleri
- **Input Validasyonu**: Tüm kullanıcı girdileri doğrulanır
- **XSS Koruması**: HTML injection'lara karşı koruma
- **SQL Injection**: Supabase RLS ile koruma
- **Veri Şifreleme**: Hassas veriler şifrelenmiş olarak saklanır
- **Oturum Yönetimi**: Güvenli token tabanlı oturumlar

### Güvenlik Kuralları
- Hiçbir zaman kullanıcı girdilerini doğrudan HTML'de kullanmayın
- Tüm API çağrılarını try-catch blokları içine alın
- Supabase'de RLS politikalarını aktif kullanın
- Hassas verileri asla client-side saklamayın

## 🧪 Test

### Unit Testler
```bash
npm test
# veya
yarn test
```

### Linting
```bash
npm run lint
# veya
yarn lint
```

### Kod Formatlama
```bash
npm run lint:fix
# veya
yarn lint:fix
```

## 📱 Platform Desteği

- **iOS**: iOS 11 ve üzeri
- **Android**: Android 5.0 (API 21) ve üzeri
- **Web**: Modern web tarayıcıları

## 🎯 Gelecek Özellikler

- [ ] Gerçek zamanlı bildirimler
- [ ] Yapay zeka destekli kartvizit analizi
- [ ] Bulut senkronizasyonu
- [ ] Takım çalışması özellikleri
- [ ] Gelişmiş arama ve filtreleme
- [ ] Entegrasyonlar (CRM, e-posta servisleri)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Branch'e push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Takım

- **Frontend Developer** - [İsminiz]
- **UI/UX Designer** - [İsminiz]
- **Backend Developer** - [İsminiz]


**CardVault** © 2024 - Dijital kartvizit yönetiminin geleceği.