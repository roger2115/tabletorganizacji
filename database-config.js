// ============================================
// FIREBASE DATABASE CONFIGURATION
// ============================================

// Firebase config - ZASTĄP SWOIMI DANYMI
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
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, remove, onValue } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// ============================================
// DATABASE OPERATIONS
// ============================================

class TabletDatabase {
  constructor() {
    this.isOnline = false;
    this.currentUser = null;
    this.init();
  }

  async init() {
    try {
      // Anonymous authentication
      await signInAnonymously(auth);
      this.isOnline = true;
      this.currentUser = auth.currentUser;
      console.log('🔥 Firebase connected');
      
      // Sync localStorage data to Firebase on first connection
      await this.syncLocalToFirebase();
      
      // Setup real-time listeners
      this.setupRealtimeListeners();
      
    } catch (error) {
      console.error('Firebase connection failed:', error);
      this.isOnline = false;
    }
  }

  // ============================================
  // SYNC OPERATIONS
  // ============================================
  
  async syncLocalToFirebase() {
    if (!this.isOnline) return;
    
    try {
      // Get all localStorage data with rp_ prefix
      const localData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('rp_')) {
          const value = localStorage.getItem(key);
          try {
            localData[key] = JSON.parse(value);
          } catch {
            localData[key] = value;
          }
        }
      }
      
      // Upload to Firebase
      if (Object.keys(localData).length > 0) {
        await set(ref(database, 'tablet_data'), localData);
        console.log('📤 Local data synced to Firebase');
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  async syncFirebaseToLocal() {
    if (!this.isOnline) return;
    
    try {
      const snapshot = await get(ref(database, 'tablet_data'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Update localStorage
        Object.keys(data).forEach(key => {
          const value = typeof data[key] === 'object' 
            ? JSON.stringify(data[key]) 
            : data[key];
          localStorage.setItem(key, value);
        });
        
        console.log('📥 Firebase data synced to local');
        
        // Refresh UI
        location.reload();
      }
    } catch (error) {
      console.error('Firebase sync failed:', error);
    }
  }

  // ============================================
  // REAL-TIME LISTENERS
  // ============================================
  
  setupRealtimeListeners() {
    if (!this.isOnline) return;

    // Listen for info cards changes
    onValue(ref(database, 'tablet_data/rp_info'), (snapshot) => {
      if (snapshot.exists()) {
        localStorage.setItem('rp_info', JSON.stringify(snapshot.val()));
        loadInfoCards(); // Refresh UI
      }
    });

    // Listen for patients changes
    onValue(ref(database, 'tablet_data/rp_patients'), (snapshot) => {
      if (snapshot.exists()) {
        localStorage.setItem('rp_patients', JSON.stringify(snapshot.val()));
        loadPatients(); // Refresh UI
      }
    });

    // Listen for files changes
    onValue(ref(database, 'tablet_data/rp_files'), (snapshot) => {
      if (snapshot.exists()) {
        localStorage.setItem('rp_files', JSON.stringify(snapshot.val()));
        loadFiles(); // Refresh UI
      }
    });

    // Listen for XYZ project changes
    onValue(ref(database, 'tablet_data/rp_xyz_project'), (snapshot) => {
      if (snapshot.exists()) {
        localStorage.setItem('rp_xyz_project', JSON.stringify(snapshot.val()));
        // Refresh XYZ tab
      }
    });
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  
  async saveData(key, data) {
    // Save locally first
    localStorage.setItem(key, JSON.stringify(data));
    
    // Save to Firebase if online
    if (this.isOnline) {
      try {
        await set(ref(database, `tablet_data/${key}`), data);
        console.log(`💾 ${key} saved to Firebase`);
      } catch (error) {
        console.error(`Failed to save ${key} to Firebase:`, error);
      }
    }
  }

  async getData(key) {
    // Try Firebase first if online
    if (this.isOnline) {
      try {
        const snapshot = await get(ref(database, `tablet_data/${key}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Update local cache
          localStorage.setItem(key, JSON.stringify(data));
          return data;
        }
      } catch (error) {
        console.error(`Failed to get ${key} from Firebase:`, error);
      }
    }
    
    // Fallback to localStorage
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  }

  async deleteData(key) {
    // Remove locally
    localStorage.removeItem(key);
    
    // Remove from Firebase if online
    if (this.isOnline) {
      try {
        await remove(ref(database, `tablet_data/${key}`));
        console.log(`🗑️ ${key} deleted from Firebase`);
      } catch (error) {
        console.error(`Failed to delete ${key} from Firebase:`, error);
      }
    }
  }

  // ============================================
  // STATUS METHODS
  // ============================================
  
  getStatus() {
    return {
      online: this.isOnline,
      user: this.currentUser?.uid || null,
      lastSync: new Date().toISOString()
    };
  }

  async forceSync() {
    if (this.isOnline) {
      await this.syncLocalToFirebase();
      await this.syncFirebaseToLocal();
      notify('Synchronizacja zakończona');
    } else {
      notify('Brak połączenia z bazą danych', 'error');
    }
  }
}

// Global database instance
window.tabletDB = new TabletDatabase();

// ============================================
// INTEGRATION WITH EXISTING CODE
// ============================================

// Override existing save functions to use database
const originalSaveInfoCard = window.saveInfoCard;
window.saveInfoCard = async function() {
  const result = originalSaveInfoCard?.apply(this, arguments);
  
  // Save to database
  const info = JSON.parse(localStorage.getItem('rp_info') || '[]');
  await tabletDB.saveData('rp_info', info);
  
  return result;
};

// Add database status to taskbar
function updateDatabaseStatus() {
  const status = tabletDB.getStatus();
  const statusElement = document.querySelector('.taskbar-left .status-item:first-child span');
  if (statusElement) {
    statusElement.textContent = status.online ? 'DB: ONLINE' : 'DB: OFFLINE';
    statusElement.style.color = status.online ? 'var(--cyan)' : 'var(--red)';
  }
}

// Update status every 5 seconds
setInterval(updateDatabaseStatus, 5000);

// Add sync button to management tab
function addSyncButton() {
  const manageSection = document.querySelector('.manage-section');
  if (manageSection && !document.getElementById('sync-section')) {
    const syncHtml = `
      <div id="sync-section" class="config-editor" style="margin-bottom: 2rem;">
        <h3>SYNCHRONIZACJA BAZY DANYCH</h3>
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <span id="db-status">Status: Sprawdzanie...</span>
          <button class="btn-primary" onclick="tabletDB.forceSync()">SYNCHRONIZUJ</button>
        </div>
        <p style="color: #888; font-size: 12px;">
          Dane są automatycznie synchronizowane. Użyj przycisku tylko w przypadku problemów.
        </p>
      </div>
    `;
    manageSection.insertAdjacentHTML('afterbegin', syncHtml);
    
    // Update status
    const statusEl = document.getElementById('db-status');
    const status = tabletDB.getStatus();
    statusEl.textContent = `Status: ${status.online ? 'ONLINE' : 'OFFLINE'}`;
    statusEl.style.color = status.online ? 'var(--cyan)' : 'var(--red)';
  }
}

// Initialize sync button when management tab loads
setTimeout(addSyncButton, 2000);