# 🗄️ INNE OPCJE BAZ DANYCH

## 📋 Porównanie opcji

| Opcja | Trudność | Koszt | Funkcje | Polecane dla |
|-------|----------|-------|---------|--------------|
| **Firebase** | ⭐⭐ | Darmowy tier | Realtime, hosting | Początkujący |
| **Supabase** | ⭐⭐⭐ | Darmowy tier | PostgreSQL, auth | Średnio zaawansowani |
| **JSON Server** | ⭐ | Darmowy | Szybki prototyp | Testy lokalne |
| **Własny backend** | ⭐⭐⭐⭐⭐ | Hosting wymagany | Pełna kontrola | Zaawansowani |

---

## 🟢 SUPABASE (PostgreSQL w chmurze)

### Zalety:
- Prawdziwa baza PostgreSQL
- Darmowy tier (500MB, 2GB transfer)
- Automatyczne API REST
- Real-time subscriptions
- Wbudowane uwierzytelnianie

### Konfiguracja:

**1. Rejestracja:**
- Idź na https://supabase.com
- Utwórz konto i projekt
- Skopiuj URL i klucz API

**2. Stwórz tabele:**
```sql
-- Tabela dla wiadomości
CREATE TABLE info_cards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela dla pacjentów
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  condition TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela dla plików
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  password TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**3. Integracja z kodem:**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Zapisz wiadomość
async function saveInfoCard(title, content) {
  const { data, error } = await supabase
    .from('info_cards')
    .insert([{ title, content }])
  
  if (error) {
    console.error('Error:', error)
    notify('Błąd zapisu', 'error')
  } else {
    notify('Wiadomość zapisana')
    loadInfoCards()
  }
}

// Załaduj wiadomości
async function loadInfoCards() {
  const { data, error } = await supabase
    .from('info_cards')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
  } else {
    displayInfoCards(data)
  }
}

// Real-time updates
supabase
  .channel('info_cards')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'info_cards' },
    (payload) => {
      console.log('Change received!', payload)
      loadInfoCards() // Refresh UI
    }
  )
  .subscribe()
</script>
```

---

## 🟡 JSON SERVER (Lokalny development)

### Zalety:
- Bardzo szybka konfiguracja
- Idealne do testów
- Automatyczne REST API
- Nie wymaga internetu

### Konfiguracja:

**1. Instalacja:**
```bash
npm install -g json-server
```

**2. Stwórz `db.json`:**
```json
{
  "info": [
    {
      "id": 1,
      "title": "Testowa wiadomość",
      "content": "To jest test"
    }
  ],
  "patients": [
    {
      "id": 1,
      "name": "Jan Kowalski",
      "age": 30,
      "gender": "M"
    }
  ],
  "files": [],
  "xyz": {
    "alpha": 92,
    "beta": 67,
    "tests": 45,
    "notes": "Projekt w toku"
  }
}
```

**3. Uruchom serwer:**
```bash
json-server --watch db.json --port 3000
```

**4. Integracja z kodem:**
```javascript
const API_URL = 'http://localhost:3000';

// Zapisz wiadomość
async function saveInfoCard(data) {
  try {
    const response = await fetch(`${API_URL}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      notify('Wiadomość zapisana');
      loadInfoCards();
    }
  } catch (error) {
    console.error('Error:', error);
    notify('Błąd zapisu', 'error');
  }
}

// Załaduj wiadomości
async function loadInfoCards() {
  try {
    const response = await fetch(`${API_URL}/info`);
    const data = await response.json();
    displayInfoCards(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Aktualizuj wiadomość
async function updateInfoCard(id, data) {
  try {
    const response = await fetch(`${API_URL}/info/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      notify('Wiadomość zaktualizowana');
      loadInfoCards();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usuń wiadomość
async function deleteInfoCard(id) {
  try {
    const response = await fetch(`${API_URL}/info/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      notify('Wiadomość usunięta');
      loadInfoCards();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🔴 WŁASNY BACKEND (Node.js + Express)

### Zalety:
- Pełna kontrola
- Dowolna baza danych
- Własne reguły biznesowe
- Bezpieczeństwo

### Konfiguracja:

**1. Stwórz `server.js`:**
```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    info: [],
    patients: [],
    files: [],
    xyz: {}
  }));
}

// Helper functions
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/:table', (req, res) => {
  const data = readData();
  res.json(data[req.params.table] || []);
});

app.post('/api/:table', (req, res) => {
  const data = readData();
  const table = req.params.table;
  
  if (!data[table]) data[table] = [];
  
  const newItem = {
    id: Date.now(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  data[table].push(newItem);
  writeData(data);
  
  res.json(newItem);
});

app.put('/api/:table/:id', (req, res) => {
  const data = readData();
  const table = req.params.table;
  const id = parseInt(req.params.id);
  
  if (data[table]) {
    const index = data[table].findIndex(item => item.id === id);
    if (index !== -1) {
      data[table][index] = { ...data[table][index], ...req.body };
      writeData(data);
      res.json(data[table][index]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } else {
    res.status(404).json({ error: 'Table not found' });
  }
});

app.delete('/api/:table/:id', (req, res) => {
  const data = readData();
  const table = req.params.table;
  const id = parseInt(req.params.id);
  
  if (data[table]) {
    data[table] = data[table].filter(item => item.id !== id);
    writeData(data);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Table not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

**2. Instalacja zależności:**
```bash
npm init -y
npm install express cors
node server.js
```

**3. Integracja z kodem:**
```javascript
const API_URL = 'http://localhost:3000/api';

class TabletAPI {
  async save(table, data) {
    try {
      const response = await fetch(`${API_URL}/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  }

  async load(table) {
    try {
      const response = await fetch(`${API_URL}/${table}`);
      return await response.json();
    } catch (error) {
      console.error('Load error:', error);
      throw error;
    }
  }

  async update(table, id, data) {
    try {
      const response = await fetch(`${API_URL}/${table}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }

  async delete(table, id) {
    try {
      const response = await fetch(`${API_URL}/${table}/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}

// Global API instance
window.tabletAPI = new TabletAPI();
```

---

## 🟣 MONGODB ATLAS (NoSQL w chmurze)

### Konfiguracja:

**1. Rejestracja:**
- https://www.mongodb.com/atlas
- Utwórz darmowy cluster

**2. Backend (Node.js + MongoDB):**
```javascript
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://username:password@cluster.mongodb.net/";
const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
  return client.db('tablet');
}

app.post('/api/:collection', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection(req.params.collection).insertOne({
      ...req.body,
      created_at: new Date()
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:collection', async (req, res) => {
  try {
    const db = await connectDB();
    const data = await db.collection(req.params.collection).find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('🍃 MongoDB server running on port 3000');
});
```

---

## 🎯 Która opcja wybrać?

### 🟢 **Firebase** - Jeśli chcesz:
- Szybki start
- Real-time synchronizację
- Nie martwić się o serwer
- Darmowy hosting

### 🟡 **Supabase** - Jeśli chcesz:
- Prawdziwą bazę SQL
- Więcej kontroli niż Firebase
- Dobre narzędzia developerskie

### 🔵 **JSON Server** - Jeśli chcesz:
- Szybko przetestować
- Pracować offline
- Prosty development

### 🔴 **Własny backend** - Jeśli chcesz:
- Pełną kontrolę
- Specjalne funkcje
- Integrację z istniejącymi systemami

---

**Polecam zacząć od Firebase - jest najprostszy i ma wszystko czego potrzebujesz! 🚀**