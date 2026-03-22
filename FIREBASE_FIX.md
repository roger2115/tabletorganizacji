# 🔥 FIREBASE - Rozwiązywanie problemów

## ❌ Najczęstsze problemy

### 1. "Permission denied" - Reguły bezpieczeństwa
**Problem**: Firebase blokuje dostęp do danych

**Rozwiązanie**:
1. Idź do Firebase Console
2. Realtime Database → Rules
3. Zmień na:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **UWAGA**: To tylko do testów! W produkcji użyj bezpiecznych reguł.

### 2. "Failed to load Firebase scripts"
**Problem**: Brak internetu lub blokada skryptów

**Rozwiązanie**:
1. Sprawdź połączenie internetowe
2. Wyłącz AdBlock na stronie
3. Sprawdź czy CDN Firebase jest dostępny

### 3. "Invalid API key"
**Problem**: Błędna konfiguracja Firebase

**Rozwiązanie**:
1. Sprawdź czy wszystkie klucze są poprawne
2. Sprawdź czy projekt Firebase jest aktywny
3. Sprawdź czy domena jest dodana do autoryzowanych

## 🛠️ Szybka naprawa

### Opcja 1: Wyłącz Firebase tymczasowo
Dodaj na początku `<script>`:
```javascript
window.DISABLE_FIREBASE = true;
```

### Opcja 2: Użyj wersji bez Firebase
Skopiuj `index.html` i usuń sekcję Firebase (linie 4500+)

### Opcja 3: Popraw reguły Firebase
```json
{
  "rules": {
    "tablet": {
      ".read": true,
      ".write": true
    }
  }
}
```

## ✅ Test połączenia

Otwórz konsolę (F12) i sprawdź:
- ✅ `🔥 Firebase initialized successfully`
- ❌ `❌ Firebase initialization failed`

Jeśli widzisz błąd, Firebase nie działa.

## 🚀 Wersja bez Firebase

Aplikacja działa bez Firebase - używa tylko localStorage.
Wszystkie funkcje działają, tylko bez synchronizacji między urządzeniami.