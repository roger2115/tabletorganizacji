# 🔥 FIREBASE - Instrukcja podpięcia bazy danych

## 📋 Spis treści
1. [Tworzenie projektu Firebase](#1-tworzenie-projektu-firebase)
2. [Konfiguracja bazy danych](#2-konfiguracja-bazy-danych)
3. [Integracja z kodem](#3-integracja-z-kodem)
4. [Testowanie](#4-testowanie)
5. [Alternatywne opcje](#5-alternatywne-opcje)

---

## 1. 🚀 Tworzenie projektu Firebase

### Krok 1: Rejestracja
1. Idź na https://console.firebase.google.com/
2. Zaloguj się kontem Google
3. Kliknij **"Utwórz projekt"**

### Krok 2: Konfiguracja projektu
1. **Nazwa projektu**: `tablet-organizacji` (lub dowolna)
2. **Google Analytics**: Wyłącz (nie potrzebne)
3. Kliknij **"Utwórz projekt"**

### Krok 3: Dodanie aplikacji web
1. W konsoli Firebase kliknij ikonę **`</>`** (Web)
2. **Nazwa aplikacji**: `Tablet Organizacji`
3. **Hosting**: Zaznacz jeśli chcesz darmowy hosting
4. Kliknij **"Zarejestruj aplikację"**

### Krok 4: Skopiuj konfigurację
```javascript
// Skopiuj te dane - będą potrzebne!
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "tablet-organizacji.firebaseapp.com",
  databaseURL: "https://tablet-organizacji-default-rtdb.firebaseio.com/",
  projectId: "tablet-organizacji",
  storageBucket: "tablet-organizacji.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 2. 🗄️ Konfiguracja bazy danych

### Krok 1: Realtime Database
1. W menu Firebase wybierz **"Realtime Database"**
2. Kliknij **"Utwórz bazę danych"**
3. **Lokalizacja**: `europe-west1` (Europa)
4. **Reguły bezpieczeństwa**: Zacznij w **trybie testowym**

### Krok 2: Reguły bezpieczeństwa
```json
{
  "rules": {
    "tablet_data": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Krok 3: Authentication (opcjonalne)
1. Wybierz **"Authentication"**
2. Zakładka **"Sign-in method"**
3. Włącz **"Anonymous"** - kliknij i **"Włącz"**

---

## 3. 🔧 Integracja z kodem

### Opcja A: Moduły ES6 (Recommended)

**1. Stwórz plik `firebase-init.js`:**
```javascript
// firebase-init.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, get, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// WKLEJ TUTAJ SWOJĄ KONFIGURACJĘ
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Eksportuj dla użycia w innych plikach
window.firebaseDB = database;
window.firebaseRef = ref;
window.firebaseSet = set;
window.firebaseGet = get;
window.firebaseOnValue = onValue;

console.log('🔥 Firebase initialized');
```

**2. Dodaj do `index.html` przed zamknięciem `</body>`:**
```html
<script type="module" src="firebase-init.js"></script>
<script>
// Funkcje bazy danych
async function saveToFirebase(key, data) {
  if (window.firebaseDB) {
    try {
      await window.firebaseSet(window.firebaseRef(window.firebaseDB, `tablet_data/${key}`), data);
      console.log(`💾 ${key} saved to Firebase`);
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  }
}

async function loadFromFirebase(key) {
  if (window.firebaseDB) {
    try {
      const snapshot = await window.firebaseGet(window.firebaseRef(window.firebaseDB, `tablet_data/${key}`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
    } catch (error) {
      console.error('Firebase load error:', error);
    }
  }
  return null;
}

// Nadpisz istniejące funkcje zapisywania
const originalSaveInfoCard = saveInfoCard;
saveInfoCard = async function() {
  // Wywołaj oryginalną funkcję
  originalSaveInfoCard.apply(this, arguments);
  
  // Zapisz do Firebase
  const info = JSON.parse(localStorage.getItem('rp_info') || '[]');
  await saveToFirebase('rp_info', info);
};

// Podobnie dla innych funkcji...
</script>
```

### Opcja B: CDN (Prostsze)

**Dodaj przed zamknięciem `</body>` w `index.html`:**
```html
<!-- Firebase CDN -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>

<script>
// WKLEJ TUTAJ SWOJĄ KONFIGURACJĘ
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Funkcje bazy danych
async function saveToFirebase(key, data) {
  try {
    await database.ref(`tablet_data/${key}`).set(data);
    console.log(`💾 ${key} saved to Firebase`);
  } catch (error) {
    console.error('Firebase save error:', error);
  }
}

async function loadFromFirebase(key) {
  try {
    const snapshot = await database.ref(`tablet_data/${key}`).once('value');
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error('Firebase load error:', error);
  }
  return null;
}

// Real-time listeners
database.ref('tablet_data/rp_info').on('value', (snapshot) => {
  if (snapshot.exists()) {
    localStorage.setItem('rp_info', JSON.stringify(snapshot.val()));
    loadInfoCards(); // Odśwież UI
  }
});

// Status połączenia
database.ref('.info/connected').on('value', (snapshot) => {
  const connected = snapshot.val();
  const statusEl = document.querySelector('.taskbar-left .status-item:first-child span');
  if (statusEl) {
    statusEl.textContent = connected ? 'DB: ONLINE' : 'DB: OFFLINE';
    statusEl.style.color = connected ? 'var(--cyan)' : 'var(--red)';
  }
});

console.log('🔥 Firebase initialized');
</script>
```

---

## 4. 🧪 Testowanie

### Test 1: Sprawdź połączenie
1. Otwórz konsolę przeglądarki (F12)
2. Powinien pojawić się komunikat: `🔥 Firebase initialized`
3. W Firebase Console sprawdź czy pojawiły się dane w bazie

### Test 2: Synchronizacja danych
1. Dodaj nową wiadomość w zakładce INFORMACJE
2. Sprawdź w Firebase Console czy dane się zapisały
3. Otwórz stronę w innej karcie - dane powinny się zsynchronizować

### Test 3: Real-time updates
1. Otwórz stronę w dwóch kartach
2. Zmień coś w jednej karcie
3. Druga karta powinna automatycznie się zaktualizować

---

## 5. 🔄 Alternatywne opcje

### A. Supabase (PostgreSQL)
```javascript
// 1. Zarejestruj się na https://supabase.com
// 2. Utwórz projekt
// 3. Dodaj CDN:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// 4. Konfiguracja:
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// 5. Użycie:
async function saveData(table, data) {
  const { error } = await supabase.from(table).insert(data)
  if (error) console.error('Error:', error)
}
```

### B. JSON Server (Lokalny)
```bash
# 1. Zainstaluj Node.js
# 2. Zainstaluj json-server:
npm install -g json-server

# 3. Stwórz db.json:
{
  "info": [],
  "patients": [],
  "files": [],
  "xyz": {}
}

# 4. Uruchom serwer:
json-server --watch db.json --port 3000

# 5. API dostępne na http://localhost:3000
```

### C. Własny backend (Node.js + Express)
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let data = {
  info: [],
  patients: [],
  files: [],
  xyz: {}
};

app.get('/api/:table', (req, res) => {
  res.json(data[req.params.table] || []);
});

app.post('/api/:table', (req, res) => {
  data[req.params.table] = req.body;
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## 🔒 Bezpieczeństwo

### Reguły Firebase (Produkcja)
```json
{
  "rules": {
    "tablet_data": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Uwierzytelnianie
```javascript
// Dodaj logowanie przez Google
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();

async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Logged in:', result.user);
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

---

## 📞 Pomoc

**Problemy z Firebase:**
- Sprawdź reguły bezpieczeństwa
- Sprawdź URL bazy danych
- Sprawdź klucze API

**Błędy CORS:**
- Dodaj domenę do Firebase Hosting
- Użyj Firebase Hosting zamiast file://

**Problemy z synchronizacją:**
- Sprawdź połączenie internetowe
- Sprawdź limity Firebase (darmowy plan)

---

## 🎯 Gotowe rozwiązanie

Jeśli chcesz szybko przetestować, użyj tej konfiguracji testowej:

```javascript
// Testowa konfiguracja Firebase (tylko do testów!)
const firebaseConfig = {
  apiKey: "AIzaSyBvOQIE5YhzL3p7ODNjH8R2G3qJVHpOcQE",
  authDomain: "tablet-test-12345.firebaseapp.com",
  databaseURL: "https://tablet-test-12345-default-rtdb.firebaseio.com/",
  projectId: "tablet-test-12345",
  storageBucket: "tablet-test-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**⚠️ UWAGA:** To tylko przykład! Stwórz własny projekt Firebase dla bezpieczeństwa.

---

**Powodzenia! 🚀**