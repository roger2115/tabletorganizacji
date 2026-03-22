# 🔌 INTEGRACJA BAZY DANYCH - Szybki start

## 🚀 Opcja 1: Szybka integracja (5 minut)

### Krok 1: Dodaj Firebase do index.html

Wklej **przed zamknięciem `</body>`**:

```html
<!-- Firebase CDN -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>

<script>
// 🔥 FIREBASE CONFIG - WKLEJ SWOJE DANE TUTAJ
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
const db = firebase.database();

// 💾 SAVE TO DATABASE
async function saveToDatabase(key, data) {
  try {
    // Save locally first (offline support)
    localStorage.setItem(key, JSON.stringify(data));
    
    // Save to Firebase
    await db.ref(`tablet/${key}`).set(data);
    console.log(`✅ ${key} saved to database`);
    
    // Show success notification
    notify('Dane zapisane w bazie danych');
  } catch (error) {
    console.error(`❌ Failed to save ${key}:`, error);
    notify('Błąd zapisu do bazy danych', 'error');
  }
}

// 📥 LOAD FROM DATABASE  
async function loadFromDatabase(key) {
  try {
    const snapshot = await db.ref(`tablet/${key}`).once('value');
    if (snapshot.exists()) {
      const data = snapshot.val();
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.error(`❌ Failed to load ${key}:`, error);
  }
  
  // Fallback to localStorage
  const local = localStorage.getItem(key);
  return local ? JSON.parse(local) : null;
}

// 🔄 REAL-TIME SYNC
function setupRealtimeSync() {
  // Info cards sync
  db.ref('tablet/rp_info').on('value', (snapshot) => {
    if (snapshot.exists()) {
      localStorage.setItem('rp_info', JSON.stringify(snapshot.val()));
      loadInfoCards(); // Refresh UI
    }
  });
  
  // Patients sync
  db.ref('tablet/rp_patients').on('value', (snapshot) => {
    if (snapshot.exists()) {
      localStorage.setItem('rp_patients', JSON.stringify(snapshot.val()));
      loadPatients(); // Refresh UI
    }
  });
  
  // Files sync
  db.ref('tablet/rp_files').on('value', (snapshot) => {
    if (snapshot.exists()) {
      localStorage.setItem('rp_files', JSON.stringify(snapshot.val()));
      loadFiles(); // Refresh UI
    }
  });
  
  // XYZ project sync
  db.ref('tablet/rp_xyz_project').on('value', (snapshot) => {
    if (snapshot.exists()) {
      localStorage.setItem('rp_xyz_project', JSON.stringify(snapshot.val()));
      // Refresh XYZ tab if needed
    }
  });
}

// 📊 CONNECTION STATUS
db.ref('.info/connected').on('value', (snapshot) => {
  const connected = snapshot.val();
  updateConnectionStatus(connected);
});

function updateConnectionStatus(connected) {
  const statusEl = document.querySelector('.taskbar-left .status-item:first-child span');
  if (statusEl) {
    statusEl.textContent = connected ? 'DB: ONLINE' : 'DB: OFFLINE';
    statusEl.style.color = connected ? 'var(--cyan)' : 'var(--red)';
  }
}

// 🚀 INITIALIZE
setTimeout(() => {
  setupRealtimeSync();
  console.log('🔥 Firebase database connected');
}, 1000);
</script>
```

### Krok 2: Zmodyfikuj funkcje zapisywania

Znajdź te funkcje w kodzie i dodaj wywołania bazy danych:

```javascript
// PRZYKŁAD: Modyfikacja saveInfoCard
const originalSaveInfoCard = saveInfoCard;
saveInfoCard = async function() {
  // Wywołaj oryginalną funkcję
  originalSaveInfoCard.apply(this, arguments);
  
  // Zapisz do bazy danych
  const info = JSON.parse(localStorage.getItem('rp_info') || '[]');
  await saveToDatabase('rp_info', info);
};

// PRZYKŁAD: Modyfikacja savePatient  
const originalSavePatient = savePatient;
savePatient = async function() {
  originalSavePatient.apply(this, arguments);
  
  const patients = JSON.parse(localStorage.getItem('rp_patients') || '[]');
  await saveToDatabase('rp_patients', patients);
};

// PRZYKŁAD: Modyfikacja saveFile
const originalSaveFile = saveFile;
saveFile = async function() {
  originalSaveFile.apply(this, arguments);
  
  const files = JSON.parse(localStorage.getItem('rp_files') || '[]');
  await saveToDatabase('rp_files', files);
};
```

---

## 🛠️ Opcja 2: Pełna integracja

### Stwórz plik `database.js`:

```javascript
class TabletDatabase {
  constructor() {
    this.isOnline = false;
    this.db = null;
    this.init();
  }

  async init() {
    try {
      // Initialize Firebase
      const firebaseConfig = {
        // TWOJA KONFIGURACJA TUTAJ
      };
      
      firebase.initializeApp(firebaseConfig);
      this.db = firebase.database();
      this.isOnline = true;
      
      // Setup listeners
      this.setupConnectionListener();
      this.setupDataListeners();
      
      console.log('🔥 Database initialized');
    } catch (error) {
      console.error('Database init failed:', error);
      this.isOnline = false;
    }
  }

  async save(key, data) {
    // Always save locally first
    localStorage.setItem(key, JSON.stringify(data));
    
    // Save to cloud if online
    if (this.isOnline && this.db) {
      try {
        await this.db.ref(`tablet/${key}`).set(data);
        return true;
      } catch (error) {
        console.error('Cloud save failed:', error);
        return false;
      }
    }
    return false;
  }

  async load(key) {
    // Try cloud first if online
    if (this.isOnline && this.db) {
      try {
        const snapshot = await this.db.ref(`tablet/${key}`).once('value');
        if (snapshot.exists()) {
          const data = snapshot.val();
          localStorage.setItem(key, JSON.stringify(data));
          return data;
        }
      } catch (error) {
        console.error('Cloud load failed:', error);
      }
    }
    
    // Fallback to local
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  }

  setupConnectionListener() {
    this.db.ref('.info/connected').on('value', (snapshot) => {
      this.isOnline = snapshot.val();
      this.updateUI();
    });
  }

  setupDataListeners() {
    const keys = ['rp_info', 'rp_patients', 'rp_files', 'rp_xyz_project'];
    
    keys.forEach(key => {
      this.db.ref(`tablet/${key}`).on('value', (snapshot) => {
        if (snapshot.exists()) {
          localStorage.setItem(key, JSON.stringify(snapshot.val()));
          this.refreshUI(key);
        }
      });
    });
  }

  updateUI() {
    const statusEl = document.querySelector('.taskbar-left .status-item:first-child span');
    if (statusEl) {
      statusEl.textContent = this.isOnline ? 'DB: ONLINE' : 'DB: OFFLINE';
      statusEl.style.color = this.isOnline ? 'var(--cyan)' : 'var(--red)';
    }
  }

  refreshUI(key) {
    switch(key) {
      case 'rp_info':
        if (typeof loadInfoCards === 'function') loadInfoCards();
        break;
      case 'rp_patients':
        if (typeof loadPatients === 'function') loadPatients();
        break;
      case 'rp_files':
        if (typeof loadFiles === 'function') loadFiles();
        break;
    }
  }
}

// Global instance
window.tabletDB = new TabletDatabase();
```

### Użycie w kodzie:

```javascript
// Zamiast:
localStorage.setItem('rp_info', JSON.stringify(data));

// Użyj:
await tabletDB.save('rp_info', data);

// Zamiast:
const data = JSON.parse(localStorage.getItem('rp_info') || '[]');

// Użyj:
const data = await tabletDB.load('rp_info') || [];
```

---

## 🎯 Szybki test

1. **Otwórz konsolę** (F12)
2. **Sprawdź logi** - powinien być komunikat `🔥 Firebase database connected`
3. **Dodaj wiadomość** w zakładce INFORMACJE
4. **Sprawdź Firebase Console** - dane powinny się pojawić
5. **Otwórz w nowej karcie** - dane powinny się zsynchronizować

---

## 🔧 Dodatkowe funkcje

### Przycisk synchronizacji w panelu zarządzania:

```javascript
// Dodaj do zakładki ZARZĄDZANIE
function addSyncControls() {
  const manageSection = document.querySelector('.manage-section');
  const syncHtml = `
    <div class="config-editor" style="margin-bottom: 2rem;">
      <h3>SYNCHRONIZACJA BAZY DANYCH</h3>
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <button class="btn-primary" onclick="forceSyncToCloud()">📤 WYŚLIJ DO CHMURY</button>
        <button class="btn-secondary" onclick="forceSyncFromCloud()">📥 POBIERZ Z CHMURY</button>
      </div>
      <div id="sync-status" style="color: var(--cyan); font-size: 12px;">
        Status: Sprawdzanie połączenia...
      </div>
    </div>
  `;
  manageSection.insertAdjacentHTML('afterbegin', syncHtml);
}

async function forceSyncToCloud() {
  const keys = ['rp_info', 'rp_patients', 'rp_files', 'rp_xyz_project'];
  
  for (const key of keys) {
    const data = localStorage.getItem(key);
    if (data) {
      await saveToDatabase(key, JSON.parse(data));
    }
  }
  
  notify('Synchronizacja do chmury zakończona');
}

async function forceSyncFromCloud() {
  const keys = ['rp_info', 'rp_patients', 'rp_files', 'rp_xyz_project'];
  
  for (const key of keys) {
    await loadFromDatabase(key);
  }
  
  // Refresh all UI
  loadInfoCards();
  loadPatients();
  loadFiles();
  
  notify('Synchronizacja z chmury zakończona');
  location.reload(); // Full refresh
}

// Dodaj kontrolki po załadowaniu
setTimeout(addSyncControls, 2000);
```

---

## ⚠️ Ważne uwagi

1. **Bezpieczeństwo**: Zmień reguły Firebase na produkcji
2. **Limity**: Firebase ma limity w darmowym planie
3. **Offline**: Aplikacja działa offline dzięki localStorage
4. **Backup**: Regularnie rób kopie zapasowe danych

---

**Gotowe! Twoja aplikacja jest teraz podpięta do bazy danych! 🎉**