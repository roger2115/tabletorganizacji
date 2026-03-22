# 🔥 FIREBASE - TEST POŁĄCZENIA

## ❌ BŁĄD: "Firebase not connected"

Widzę błąd połączenia z Firebase. Sprawdźmy to krok po kroku:

---

## 🧪 SZYBKI TEST

### 1. Sprawdź URL bazy danych
Otwórz w przeglądarce:
```
https://tablet-organizacji-default-rtdb.europe-west1.firebasedatabase.app/.json
```

**Oczekiwane wyniki:**
- ✅ `null` lub `{}` = Baza istnieje, reguły OK
- ❌ `404 Not Found` = Baza nie istnieje
- ❌ `403 Forbidden` = Złe reguły bezpieczeństwa

### 2. Sprawdź Firebase Console
1. Idź na: https://console.firebase.google.com/
2. Wybierz projekt: `tablet-organizacji`
3. **Realtime Database** → sprawdź czy baza istnieje

---

## 🛠️ ROZWIĄZANIA

### Opcja 1: Utwórz bazę danych (jeśli nie istnieje)
1. Firebase Console → **Realtime Database**
2. **Create database**
3. **Start in test mode**
4. **Lokalizacja**: `europe-west1`

### Opcja 2: Napraw reguły (jeśli baza istnieje)
1. Firebase Console → **Realtime Database** → **Rules**
2. Ustaw na:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
3. **PUBLISH**

### Opcja 3: Sprawdź region
Twój URL ma `europe-west1` - sprawdź czy to jest właściwy region w Firebase Console.

---

## 🔧 SZYBKA NAPRAWA - WYŁĄCZ FIREBASE

Jeśli Firebase dalej nie działa, wyłącz go tymczasowo:

1. **Otwórz `index.html`**
2. **Znajdź linię** (około 4710):
```javascript
// window.DISABLE_FIREBASE = true;
```
3. **Usuń komentarz**:
```javascript
window.DISABLE_FIREBASE = true;
```
4. **Zapisz plik**

Aplikacja będzie działać tylko z localStorage (bez synchronizacji).

---

## 📋 CHECKLIST NAPRAWY

- [ ] URL bazy danych odpowiada (test w przeglądarce)
- [ ] Baza danych utworzona w Firebase Console
- [ ] Reguły ustawione na test mode
- [ ] Region zgodny z URL (`europe-west1`)
- [ ] Projekt aktywny (nie zablokowany)

---

## 🆘 JEŚLI DALEJ NIE DZIAŁA

**Wyślij mi screenshot z:**
1. Firebase Console → Realtime Database (główny widok)
2. Wyniku testu URL w przeglądarce
3. Firebase Console → Rules

**Albo po prostu wyłącz Firebase i używaj localStorage!**