# 🔥 FIREBASE - Rozwiązywanie błędów 404/403

## ❌ Błędy które widzisz:
- `Failed to load resource: 404` - Nie znaleziono zasobu
- `Failed to load resource: 403` - Brak dostępu
- `cloudusersettings-pa-...` - Błędy konfiguracji

## 🛠️ ROZWIĄZANIE KROK PO KROK

### 1. Sprawdź reguły Firebase (NAJWAŻNIEJSZE!)
1. Idź na: https://console.firebase.google.com/
2. Wybierz projekt: `tablet-organizacji`
3. **Realtime Database** → **Rules**
4. Zmień na:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

5. **PUBLISH** (bardzo ważne!)

### 2. Sprawdź czy baza jest aktywna
1. W Firebase Console
2. **Realtime Database**
3. Jeśli widzisz "Create database" - kliknij i utwórz
4. Wybierz **Start in test mode**
5. Lokalizacja: **europe-west1**

### 3. Sprawdź URL bazy danych
W `index.html` sprawdź czy URL jest poprawny:
```javascript
databaseURL: "https://tablet-organizacji-default-rtdb.europe-west1.firebasedatabase.app"
```

### 4. Dodaj domenę do autoryzowanych
1. Firebase Console → **Authentication**
2. **Settings** → **Authorized domains**
3. Dodaj:
   - `localhost`
   - `127.0.0.1`
   - `file://` (jeśli otwierasz lokalnie)

### 5. Sprawdź czy projekt jest aktywny
1. Firebase Console → **Project Overview**
2. Sprawdź czy projekt nie jest zablokowany
3. Sprawdź billing (może być wymagane)

## 🧪 TEST KROK PO KROK

### Test 1: Sprawdź URL
Otwórz w przeglądarce:
```
https://tablet-organizacji-default-rtdb.europe-west1.firebasedatabase.app/.json
```

**Oczekiwany wynik**: JSON z danymi lub `null`
**Błąd 404**: Zły URL lub baza nie istnieje
**Błąd 403**: Złe reguły bezpieczeństwa

### Test 2: Sprawdź reguły
Jeśli widzisz błąd 403, reguły są za restrykcyjne.

### Test 3: Sprawdź w konsoli
Po naprawie powinieneś zobaczyć:
```
🔥 Firebase initialized successfully
📡 Info cards synced from Firebase
```

## 🔧 SZYBKA NAPRAWA

### Opcja 1: Nowa baza danych
1. Firebase Console → Realtime Database
2. **Create database**
3. **Start in test mode**
4. Lokalizacja: **europe-west1**

### Opcja 2: Sprawdź region
Twój URL ma `europe-west1` - sprawdź czy to jest właściwy region w Firebase Console.

### Opcja 3: Nowy projekt
Jeśli nic nie pomaga:
1. Utwórz nowy projekt Firebase
2. Skopiuj nową konfigurację
3. Zastąp w `index.html`

## 📋 CHECKLIST NAPRAWY

- [ ] Reguły Firebase ustawione na test mode
- [ ] Baza danych utworzona i aktywna
- [ ] URL bazy danych poprawny
- [ ] Domeny dodane do autoryzowanych
- [ ] Projekt aktywny (nie zablokowany)
- [ ] Region zgodny z URL

## 🎯 NAJPRAWDOPODOBNIEJSZA PRZYCZYNA

**Reguły bezpieczeństwa!** 90% problemów to złe reguły.

Idź do Firebase Console → Realtime Database → Rules i ustaw:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Nie zapomnij kliknąć PUBLISH!**

## 🆘 JEŚLI DALEJ NIE DZIAŁA

Wyślij mi screenshot z:
1. Firebase Console → Realtime Database (główny widok)
2. Firebase Console → Realtime Database → Rules
3. Konsola przeglądarki (F12) z błędami

Wtedy będę mógł dokładnie zdiagnozować problem!