# 🚀 Instrukcja wdrożenia na GitHub Pages

## Krok 1: Stwórz repozytorium na GitHubie

1. Wejdź na https://github.com
2. Kliknij "New repository" (zielony przycisk)
3. Nazwa: `tablet-organizacji` (lub dowolna)
4. Opis: `Cyberpunk-styled tablet interface dla Discord RP`
5. Wybierz: **Public** (aby GitHub Pages działało za darmo)
6. **NIE** zaznaczaj "Add a README file"
7. Kliknij "Create repository"

## Krok 2: Zainicjuj Git lokalnie

Otwórz PowerShell w folderze `Strona` i wykonaj:

```powershell
# Inicjalizuj git
git init

# Dodaj wszystkie pliki
git add .

# Pierwszy commit
git commit -m "Initial commit - Tablet Organizacji v5.0"

# Zmień nazwę brancha na main
git branch -M main

# Dodaj remote (ZMIEŃ na swój URL!)
git remote add origin https://github.com/TWOJ-USERNAME/tablet-organizacji.git

# Wypchnij na GitHub
git push -u origin main
```

**WAŻNE:** Zamień `TWOJ-USERNAME` na swoją nazwę użytkownika GitHub!

## Krok 3: Włącz GitHub Pages

1. Wejdź do swojego repozytorium na GitHubie
2. Kliknij **Settings** (ustawienia)
3. W menu po lewej kliknij **Pages**
4. W sekcji "Source" wybierz:
   - Source: **GitHub Actions**
5. Zapisz

## Krok 4: Poczekaj na deployment

1. Wejdź do zakładki **Actions** w repozytorium
2. Zobaczysz workflow "Deploy to GitHub Pages"
3. Poczekaj aż się zakończy (zielony checkmark ✓)
4. Twoja strona będzie dostępna pod:
   ```
   https://TWOJ-USERNAME.github.io/tablet-organizacji/
   ```

## 🎉 Gotowe!

Teraz za każdym razem gdy zrobisz:
```powershell
git add .
git commit -m "Opis zmian"
git push
```

Strona automatycznie się zaktualizuje!

## 🔧 Troubleshooting

### Problem: "git: command not found"
**Rozwiązanie:** Zainstaluj Git z https://git-scm.com/download/win

### Problem: "Permission denied"
**Rozwiązanie:** Skonfiguruj SSH key lub użyj HTTPS z Personal Access Token

### Problem: Strona nie działa po deployment
**Rozwiązanie:** 
1. Sprawdź czy workflow się wykonał (Actions tab)
2. Sprawdź czy GitHub Pages jest włączone (Settings > Pages)
3. Poczekaj 5-10 minut na propagację

## 📱 Dostęp

Po wdrożeniu możesz udostępnić link:
```
https://TWOJ-USERNAME.github.io/tablet-organizacji/
```

Każdy kto ma ten link może korzystać z tabletu!

## 🔐 Bezpieczeństwo

- Dane są zapisywane w localStorage przeglądarki (lokalnie)
- Każdy użytkownik ma swoje własne dane
- Hasła NIE są szyfrowane (to tylko RP, nie używaj prawdziwych haseł!)
