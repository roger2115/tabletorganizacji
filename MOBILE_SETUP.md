# 📱 APLIKACJA MOBILNA - Instrukcja instalacji

Kompletna instrukcja tworzenia aplikacji mobilnej dla Tabletu Organizacji.

## 🚀 Szybki start

### 1. Uruchom API serwer
```bash
cd Strona
node mobile-api.js
```

### 2. Utwórz aplikację React Native
```bash
npx react-native init TabletMobile
cd TabletMobile
```

### 3. Skopiuj kod
Skopiuj zawartość `mobile-app-example.js` do `App.js`

### 4. Uruchom aplikację
```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

## 📋 Szczegółowa instalacja

### Wymagania
- Node.js 16+
- React Native CLI
- Android Studio (Android)
- Xcode (iOS)

### 1. Konfiguracja API serwera

#### Instalacja zależności
```bash
npm init -y
npm install express cors firebase-admin
```

#### Konfiguracja Firebase Admin SDK
1. Idź do [Firebase Console](https://console.firebase.google.com/)
2. Wybierz projekt `tablet-organizacji`
3. Project Settings → Service Accounts
4. Generate new private key
5. Pobierz plik JSON
6. Wklej dane do `mobile-api.js`:

```javascript
const serviceAccount = {
  "type": "service_account",
  "project_id": "tablet-organizacji",
  "private_key_id": "TWÓJ_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nTWÓJ_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tablet-organizacji.iam.gserviceaccount.com",
  // ... reszta danych
};
```

#### Uruchomienie serwera
```bash
node mobile-api.js
```

Serwer będzie dostępny na: `http://localhost:3001`

### 2. Tworzenie aplikacji React Native

#### Instalacja React Native CLI
```bash
npm install -g react-native-cli
```

#### Tworzenie projektu
```bash
npx react-native init TabletMobile
cd TabletMobile
```

#### Instalacja zależności
```bash
npm install
```

### 3. Konfiguracja aplikacji

#### Skopiuj kod
Zastąp zawartość `App.js` kodem z `mobile-app-example.js`

#### Konfiguracja URL API
W pliku `App.js` zmień URL na właściwy:
```javascript
class TabletAPI {
  constructor() {
    // Dla emulatora Android
    this.baseURL = 'http://10.0.2.2:3001/api';
    
    // Dla urządzenia fizycznego (zastąp IP)
    // this.baseURL = 'http://192.168.1.100:3001/api';
    
    // Dla iOS simulator
    // this.baseURL = 'http://localhost:3001/api';
  }
}
```

### 4. Uruchomienie aplikacji

#### Android
```bash
# Uruchom emulator Android lub podłącz urządzenie
npx react-native run-android
```

#### iOS
```bash
# Tylko na macOS
npx react-native run-ios
```

---

## 🔧 Konfiguracja zaawansowana

### Ikona aplikacji
1. Wygeneruj ikony na [App Icon Generator](https://appicon.co/)
2. Zastąp ikony w:
   - `android/app/src/main/res/mipmap-*/`
   - `ios/TabletMobile/Images.xcassets/AppIcon.appiconset/`

### Splash Screen
```bash
npm install react-native-splash-screen
```

### Push Notifications
```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging
```

### Offline Storage
```bash
npm install @react-native-async-storage/async-storage
```

---

## 📱 Funkcje aplikacji

### ✅ Zaimplementowane
- **Login/Logout** - Uwierzytelnianie użytkowników
- **Wiadomości** - Przeglądanie wiadomości systemowych
- **Pacjenci** - Lista i szczegóły pacjentów
- **Pliki** - Przeglądanie plików (z obsługą haseł)
- **Status** - Statystyki systemu
- **Real-time** - Automatyczne odświeżanie danych
- **Offline** - Podstawowa obsługa braku internetu

### 🔄 Do dodania
- **Dodawanie danych** - Formularze dla adminów
- **Powiadomienia push** - Alerty o nowych danych
- **Biometria** - Logowanie odciskiem palca
- **Kamera** - Skanowanie QR kodów
- **Mapy** - Lokalizacja pacjentów
- **Grafiki** - Wykresy i statystyki

---

## 🎨 Personalizacja

### Kolory
```javascript
const colors = {
  dark: '#0a0c0e',        // Tło główne
  darkPanel: '#151820',   // Tło paneli
  red: '#e8003d',         // Akcent czerwony
  cyan: '#00e5cc',        // Akcent cyan
  yellow: '#ffd200',      // Akcent żółty
  border: '#2a2e38',      // Obramowania
  white: '#ffffff',       // Tekst główny
  gray: '#888888',        // Tekst pomocniczy
};
```

### Fonty
```javascript
// Dodaj do styles
fontFamily: 'monospace', // Dla kodów i dat
fontWeight: 'bold',      // Dla nagłówków
letterSpacing: 2,        // Dla tytułów
```

### Animacje
```bash
npm install react-native-reanimated
```

```javascript
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

// Użycie
<Animated.View entering={FadeIn.duration(500)}>
  <Text>Animowany tekst</Text>
</Animated.View>
```

---

## 🔒 Bezpieczeństwo

### SSL Pinning
```bash
npm install react-native-ssl-pinning
```

### Keychain Storage
```bash
npm install react-native-keychain
```

### Biometric Authentication
```bash
npm install react-native-biometrics
```

### Przykład implementacji
```javascript
import TouchID from 'react-native-touch-id';

const authenticateWithBiometrics = async () => {
  try {
    const biometryType = await TouchID.isSupported();
    if (biometryType) {
      const isAuthenticated = await TouchID.authenticate('Zaloguj się');
      if (isAuthenticated) {
        // Automatyczne logowanie
        const savedCredentials = await getStoredCredentials();
        await api.login(savedCredentials.login, savedCredentials.password);
      }
    }
  } catch (error) {
    console.log('Biometric authentication failed:', error);
  }
};
```

---

## 📦 Build i dystrybucja

### Android APK
```bash
cd android
./gradlew assembleRelease
```

APK będzie w: `android/app/build/outputs/apk/release/`

### iOS IPA
1. Otwórz `ios/TabletMobile.xcworkspace` w Xcode
2. Product → Archive
3. Distribute App

### Google Play Store
1. Utwórz konto dewelopera
2. Przygotuj store listing
3. Upload APK/AAB
4. Wypełnij metadane

### App Store
1. Utwórz Apple Developer Account
2. App Store Connect
3. Upload przez Xcode
4. Wypełnij metadane

---

## 🧪 Testowanie

### Unit Tests
```bash
npm test
```

### E2E Tests (Detox)
```bash
npm install -g detox-cli
npm install detox --save-dev
```

### Performance
```bash
npx react-native run-android --variant=release
```

---

## 📊 Analytics

### Firebase Analytics
```bash
npm install @react-native-firebase/analytics
```

### Crashlytics
```bash
npm install @react-native-firebase/crashlytics
```

---

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/build.yml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run tests
      run: npm test
      
    - name: Build Android
      run: |
        cd android
        ./gradlew assembleRelease
```

---

## 📞 Wsparcie

### Problemy z instalacją
1. **Metro bundler error**: `npx react-native start --reset-cache`
2. **Android build error**: `cd android && ./gradlew clean`
3. **iOS build error**: `cd ios && pod install`

### Debugowanie
```bash
# Włącz debugger
npx react-native log-android  # Android logs
npx react-native log-ios      # iOS logs
```

### Performance
```bash
# Profile aplikacji
npx react-native run-android --variant=release
```

---

## 🎯 Roadmap

### Wersja 1.1
- [ ] Push notifications
- [ ] Offline sync
- [ ] Biometric login
- [ ] Dark/Light theme

### Wersja 1.2
- [ ] QR code scanner
- [ ] Photo upload
- [ ] Voice notes
- [ ] Maps integration

### Wersja 2.0
- [ ] Tablet mode
- [ ] Multi-language
- [ ] Advanced analytics
- [ ] AI features

---

**Aplikacja mobilna jest gotowa do użycia! 📱🚀**

Możesz teraz tworzyć, testować i dystrybuować aplikację mobilną dla Tabletu Organizacji.