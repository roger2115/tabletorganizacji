# 📱 MOBILE API - Dokumentacja

API REST dla aplikacji mobilnych do zarządzania Tabletem Organizacji.

## 🚀 Uruchomienie API

### 1. Instalacja zależności
```bash
npm init -y
npm install express cors firebase-admin
```

### 2. Konfiguracja Firebase Admin SDK
1. Idź do Firebase Console → Project Settings → Service Accounts
2. Kliknij "Generate new private key"
3. Pobierz plik JSON i wklej dane do `mobile-api.js`

### 3. Uruchomienie serwera
```bash
node mobile-api.js
```

API będzie dostępne na: `http://localhost:3001`

---

## 🔐 Uwierzytelnianie

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "login": "DrS",
  "password": "admin123"
}
```

**Odpowiedź:**
```json
{
  "success": true,
  "token": "base64-encoded-token",
  "user": {
    "login": "DrS",
    "role": "admin"
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-token
```

### Używanie tokenu
Wszystkie chronione endpointy wymagają nagłówka:
```http
Authorization: Bearer your-token
```

---

## 📊 Endpointy danych

### 📋 Wiadomości informacyjne

#### Pobierz wszystkie wiadomości
```http
GET /api/info
Authorization: Bearer your-token
```

**Odpowiedź:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1640995200000,
      "title": "Aktualizacja systemu",
      "content": "System zostanie zaktualizowany...",
      "created": "2023-12-31T23:00:00.000Z",
      "author": "DrS"
    }
  ],
  "count": 1
}
```

#### Dodaj nową wiadomość (tylko admin)
```http
POST /api/info
Authorization: Bearer your-token
Content-Type: application/json

{
  "title": "Nowa wiadomość",
  "content": "Treść wiadomości..."
}
```

### 🏥 Pacjenci

#### Pobierz wszystkich pacjentów
```http
GET /api/patients
Authorization: Bearer your-token
```

#### Pobierz konkretnego pacjenta
```http
GET /api/patients/123456789
Authorization: Bearer your-token
```

#### Dodaj nowego pacjenta (tylko admin)
```http
POST /api/patients
Authorization: Bearer your-token
Content-Type: application/json

{
  "name": "Jan Kowalski",
  "age": 35,
  "gender": "M",
  "condition": "Stabilny",
  "bloodType": "A+",
  "allergies": "Penicylina"
}
```

### 📁 Pliki

#### Pobierz wszystkie pliki
```http
GET /api/files
Authorization: Bearer your-token
```

**Uwaga:** Pliki chronione hasłem będą miały ukrytą treść dla użytkowników niebędących adminami.

#### Odblokuj plik hasłem
```http
POST /api/files/123456789/unlock
Authorization: Bearer your-token
Content-Type: application/json

{
  "password": "secret123"
}
```

### 🔬 Projekt XYZ

#### Pobierz dane projektu
```http
GET /api/xyz
Authorization: Bearer your-token
```

### 📊 Status systemu

#### Pobierz status
```http
GET /api/status
Authorization: Bearer your-token
```

**Odpowiedź:**
```json
{
  "success": true,
  "data": {
    "info_cards": 5,
    "patients": 12,
    "files": 8,
    "users": 3,
    "server_time": "2023-12-31T23:00:00.000Z",
    "user": {
      "login": "DrS",
      "role": "admin"
    }
  }
}
```

---

## 🔄 Real-time Updates

### Server-Sent Events
```http
GET /api/events
Authorization: Bearer your-token
```

**Przykład odpowiedzi:**
```
data: {"type":"connected","timestamp":"2023-12-31T23:00:00.000Z"}

data: {"type":"info_updated","data":[...],"timestamp":"2023-12-31T23:01:00.000Z"}

data: {"type":"patients_updated","data":[...],"timestamp":"2023-12-31T23:02:00.000Z"}
```

**Typy eventów:**
- `connected` - Połączenie nawiązane
- `info_updated` - Zaktualizowane wiadomości
- `patients_updated` - Zaktualizowani pacjenci
- `files_updated` - Zaktualizowane pliki

---

## 📱 Przykład aplikacji mobilnej (React Native)

### Instalacja
```bash
npm install axios
```

### Klasa API
```javascript
class TabletAPI {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.token = null;
  }

  async login(login, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.token = data.token;
        return data.user;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      throw new Error('Login failed: ' + error.message);
    }
  }

  async getInfo() {
    return this.request('/info');
  }

  async getPatients() {
    return this.request('/patients');
  }

  async getPatient(id) {
    return this.request(`/patients/${id}`);
  }

  async getFiles() {
    return this.request('/files');
  }

  async unlockFile(id, password) {
    return this.request(`/files/${id}/unlock`, 'POST', { password });
  }

  async getStatus() {
    return this.request('/status');
  }

  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw new Error('API request failed: ' + error.message);
    }
  }

  // Real-time events
  connectToEvents(onEvent) {
    const eventSource = new EventSource(`${this.baseURL}/events`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
    };

    return eventSource;
  }
}

// Użycie
const api = new TabletAPI();

// Login
const user = await api.login('DrS', 'admin123');
console.log('Logged in as:', user);

// Pobierz dane
const info = await api.getInfo();
console.log('Info cards:', info.data);

const patients = await api.getPatients();
console.log('Patients:', patients.data);

// Real-time updates
const eventSource = api.connectToEvents((event) => {
  console.log('Real-time update:', event);
  
  switch (event.type) {
    case 'info_updated':
      // Odśwież listę wiadomości
      break;
    case 'patients_updated':
      // Odśwież listę pacjentów
      break;
  }
});
```

---

## 🔒 Bezpieczeństwo

### Produkcja
1. **HTTPS**: Używaj tylko HTTPS w produkcji
2. **JWT**: Zastąp prosty token systemem JWT
3. **Rate limiting**: Dodaj ograniczenia żądań
4. **CORS**: Skonfiguruj właściwe domeny
5. **Validation**: Dodaj walidację wszystkich danych wejściowych

### Przykład konfiguracji produkcyjnej
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS dla produkcji
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true
}));

// Helmet dla bezpieczeństwa
const helmet = require('helmet');
app.use(helmet());
```

---

## 🧪 Testowanie API

### Postman Collection
```json
{
  "info": {
    "name": "Tablet Organizacji API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"login\": \"DrS\",\n  \"password\": \"admin123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3001/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "auth", "login"]
        }
      }
    }
  ]
}
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"DrS","password":"admin123"}'

# Get info (replace TOKEN with actual token)
curl -X GET http://localhost:3001/api/info \
  -H "Authorization: Bearer TOKEN"

# Add patient
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jan Kowalski","age":35,"gender":"M"}'
```

---

## 📋 Kody błędów

| Kod | Znaczenie |
|-----|-----------|
| 200 | OK |
| 400 | Bad Request - Błędne dane |
| 401 | Unauthorized - Brak autoryzacji |
| 403 | Forbidden - Brak uprawnień |
| 404 | Not Found - Nie znaleziono |
| 500 | Internal Server Error - Błąd serwera |

---

## 🚀 Deployment

### Heroku
```bash
# Zainstaluj Heroku CLI
npm install -g heroku

# Login
heroku login

# Utwórz aplikację
heroku create tablet-api

# Ustaw zmienne środowiskowe
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Docker
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "mobile-api.js"]
```

---

**API jest gotowe do użycia! 🎉**

Możesz teraz tworzyć aplikacje mobilne, które łączą się z Tabletem Organizacji i synchronizują dane w czasie rzeczywistym.