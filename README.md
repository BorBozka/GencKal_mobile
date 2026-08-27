# GençKal Mobile (GencKalculator)

Vücut kompozisyonu (BMI / FFMI) hesaplayan ve yapay zekâ destekli kişiselleştirilmiş diyet planları üreten bir React Native (Expo) mobil uygulaması.

## İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [Backend Gereksinimi](#backend-gereksinimi)
- [Kullanılabilir Komutlar](#kullanılabilir-komutlar)
- [Tema ve Kişiselleştirme](#tema-ve-kişiselleştirme)
- [Notlar](#notlar)

## Özellikler

**Hesaplayıcı sekmesi**
- Boy, kilo, yaş, cinsiyet, vücut yağ oranı ve aktivite seviyesine göre BMI (Vücut Kitle İndeksi) ve FFMI (Yağsız Vücut Kitle İndeksi) hesaplama
- Sonuçların referans skala üzerinde görsel karşılaştırması
- Hedef kilo simülatörü: mevcut yağsız kütleye göre farklı hedef kilolarda FFMI'nin nasıl değişeceğini gösterir

**Diyet Planı sekmesi**
- Bulk (kilo alma), Maintain (koruma) ve Cut (kilo verme) hazır plan şablonları; TDEE'ye (Toplam Günlük Enerji Harcaması) göre otomatik kalori hedefi ve makro dağılımı
- 5 farklı diyet tipi: standart, karnivor, vejetaryen, vegan, keto
- Öğün sayısı seçimi (2-5 öğün) ve alerjen/istisna girişi
- Yapay zekâ ile diyet planı üretimi (Gemini AI tabanlı bir backend API üzerinden); backend'e ulaşılamazsa otomatik olarak yerel şablon tabanlı bir plan üretici (`localDietGenerator.ts`) devreye girer, böylece uygulama backend olmadan da demo amaçlı çalışabilir
- Üretilen plandaki herhangi bir besini AI (veya backend yoksa yerel alternatiflerden) değiştirme ("swap") özelliği
- Hesap girişi yapan kullanıcılar için planı kaydetme

**Kayıtlı Planlar**
- Girişli kullanıcıların daha önce kaydettiği diyet planlarının listesi, detay görünümü ve silme işlemi

**Ayarlar sekmesi**
- Hesap yönetimi (giriş/kayıt, çıkış yapma, kayıtlı planlara erişim)
- Görünüm modu: Aydınlık / Karanlık / Sistem
- Renk teması: Indigo, Orman Yeşili, Kırmızı
- Bilgilendirme (BMI/FFMI formülleri ve referans tabloları) ve İletişim ekranlarına erişim

**Kimlik doğrulama**
- E-posta/şifre ile giriş ve kayıt
- Token, mümkünse `expo-secure-store` ile güvenli şekilde saklanır; kullanılamıyorsa `AsyncStorage`'a düşer

## Teknoloji Yığını

- [Expo](https://expo.dev/) `~54.0.33` (new architecture aktif) ve [Expo Router](https://docs.expo.dev/router/introduction/) `~6.0.23` (dosya tabanlı yönlendirme)
- React `19.1.0` / React Native `0.81.5`
- TypeScript `~5.9.2`
- [NativeWind](https://www.nativewind.dev/) `^4.2.3` (Tailwind CSS `3.3.2`) — bazı bileşenlerde `className`, bazılarında doğrudan `StyleSheet`/inline `style` kullanılıyor
- `@react-native-async-storage/async-storage`, `expo-secure-store` — yerel depolama ve token saklama
- `lucide-react-native`, `@expo/vector-icons` (Ionicons/Feather) — ikonlar
- `expo-haptics` — dokunsal geri bildirim
- `react-native-modal`, özel `AppDialogContext` — uygulama içi diyalog/uyarı sistemi

## Proje Yapısı

```
app/
  _layout.tsx           # Kök layout: Theme/AppDialog/Auth/Form provider'ları, splash screen
  (tabs)/
    _layout.tsx          # Alt sekme navigasyonu (Hesaplayıcı / Diyet Planı / Ayarlar)
    index.tsx             # Hesaplayıcı sekmesi (BMI/FFMI)
    diet.tsx               # Diyet planı sihirbazı ve sonuç ekranı
    settings.tsx            # Ayarlar sekmesi
  auth.tsx                # Giriş / Kayıt ekranı
  saved-plans.tsx          # Kayıtlı diyet planları
  information.tsx           # BMI/FFMI bilgilendirme ekranı
  contact.tsx                # İletişim ekranı

src/
  components/    # BrandLogo, InputPanel, ResultsPanel, TargetSimulator, ReferenceScale, SegmentedControl, TDEECalculatorPanel
  context/       # FormContext, ThemeContext, AuthContext, AppDialogContext
  services/      # api.ts (base URL çözümleme), dietApi.ts, savedPlansApi.ts, localDietGenerator.ts
  types/         # Paylaşılan TypeScript tipleri
  utils/         # calculations.ts (BMI/FFMI/TDEE formülleri), dietTypeGuards.ts
```

## Kurulum

Gereksinimler: [Node.js](https://nodejs.org/) (LTS önerilir) ve npm, ayrıca telefonunuzda [Expo Go](https://expo.dev/go) uygulaması.

```bash
git clone https://github.com/BorBozka/GencKal_mobile.git
cd GencKal_mobile
npm install
npx expo start
```

Terminalde çıkan QR kodu Expo Go uygulamasıyla (Android: Expo Go içinden tara, iOS: Kamera uygulamasıyla tara) okutarak uygulamayı telefonunuzda açabilirsiniz. Bilgisayar ve telefonun aynı Wi-Fi ağında olması gerekir.

## Backend Gereksinimi

Bu depo yalnızca mobil istemciyi (Expo/React Native uygulamasını) içerir; sunucu tarafı kodu ayrı bir projededir ve bu depoda yer almaz.

Uygulama, `src/services/api.ts` üzerinden bir REST API'ye istek atar:

- Geliştirme modunda API adresi, Expo'nun geliştirme sunucusu adresinden (`Constants.expoConfig.hostUri`) otomatik türetilir ve varsayılan olarak `3000` portu kullanılır (`app.json` içindeki `expo.extra.apiPort`). Yani `npx expo start` ile aynı ağdaki bir bilgisayarda `3000` portunda çalışan bir backend varsa, uygulama otomatik olarak ona bağlanır.
- Prodüksiyonda `expo.extra.apiBaseUrl` (HTTPS) değerinin `app.json`'da tanımlanması gerekir; aksi halde API çağrıları başarısız olur.

Backend olmadan da uygulama **büyük ölçüde kullanılabilir**: giriş/kayıt, plan kaydetme ve besin değiştirme gibi hesap gerektiren özellikler çalışmaz, ancak Hesaplayıcı sekmesi tamamen yerel çalışır ve Diyet Planı sekmesi, API'ye ulaşılamadığında otomatik olarak yerel şablon tabanlı bir plan üretici (`src/services/localDietGenerator.ts`) ile devam eder.

Beklenen API uç noktaları (istemci tarafından çağrılan):

| Uç nokta | Yöntem | Açıklama |
|---|---|---|
| `/api/auth/signin` | POST | E-posta/şifre ile giriş |
| `/api/auth/signup` | POST | Yeni hesap oluşturma |
| `/api/auth/me` | GET | Kayıtlı token'ı doğrulama |
| `/api/generate-diet` | POST | AI ile diyet planı üretimi |
| `/api/swap-food` | POST | Bir besini AI ile değiştirme |
| `/api/diet-plans` | GET / POST | Kayıtlı planları listeleme / yeni plan kaydetme |
| `/api/diet-plans/:id` | GET / DELETE | Tek bir kayıtlı planı getirme / silme |

## Kullanılabilir Komutlar

```bash
npm run start       # Expo geliştirme sunucusunu başlatır
npm run android      # Android emülatöründe/cihazında açar
npm run ios           # iOS simülatöründe/cihazında açar (yalnızca macOS)
npm run web             # Tarayıcıda açar
npm run lint              # ESLint kontrolü
npm run typecheck          # TypeScript tip kontrolü (tsc --noEmit)
```

## Tema ve Kişiselleştirme

Ayarlar sekmesinden Aydınlık/Karanlık/Sistem görünüm modu ile Indigo, Orman Yeşili veya Kırmızı vurgu rengi seçilebilir. Tercihler `AsyncStorage`'da saklanır ve bir sonraki açılışta hatırlanır.

## Notlar

- Bu proje kişisel/portföy amaçlı geliştirilmiştir.
- `instructions.md` dosyası, projede kod değişikliklerinin nasıl yapılması gerektiğine dair geliştirici notlarını içerir.
