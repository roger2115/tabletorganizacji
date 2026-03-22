// ============================================
// MOBILE API FOR TABLET ORGANIZACJI
// ============================================

// Express.js server for mobile API
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();

// Firebase Admin SDK initialization
const serviceAccount = {
  // Add your Firebase service account key here
  "type": "service_account",
  "project_id": "tablet-organizacji",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tablet-organizacji.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/firebase-adminsdk-xxxxx%40tablet-organizacji.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tablet-organizacji-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // Simple token validation (in production use proper JWT)
    const accounts = await db.ref('tablet/rp_accounts').once('value');
    const accountsData = accounts.val() || [];
    
    const user = accountsData.find(acc => acc.token === token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// ============================================
// AUTH ENDPOINTS
// ============================================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password required' });
    }
    
    // Get accounts from Firebase
    const accounts = await db.ref('tablet/rp_accounts').once('value');
    const accountsData = accounts.val() || [];
    
    const user = accountsData.find(acc => acc.login === login && acc.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate simple token (in production use proper JWT)
    const token = Buffer.from(`${login}:${Date.now()}`).toString('base64');
    
    // Update user with token
    const userIndex = accountsData.findIndex(acc => acc.login === login);
    accountsData[userIndex].token = token;
    accountsData[userIndex].lastLogin = new Date().toISOString();
    
    await db.ref('tablet/rp_accounts').set(accountsData);
    
    res.json({
      success: true,
      token: token,
      user: {
        login: user.login,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticate, async (req, res) => {
  try {
    // Remove token from user
    const accounts = await db.ref('tablet/rp_accounts').once('value');
    const accountsData = accounts.val() || [];
    
    const userIndex = accountsData.findIndex(acc => acc.login === req.user.login);
    if (userIndex !== -1) {
      delete accountsData[userIndex].token;
      await db.ref('tablet/rp_accounts').set(accountsData);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ============================================
// DATA ENDPOINTS
// ============================================

// Get all info cards
app.get('/api/info', authenticate, async (req, res) => {
  try {
    const snapshot = await db.ref('tablet/rp_info').once('value');
    const data = snapshot.val() || [];
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch info cards' });
  }
});

// Add new info card (admin only)
app.post('/api/info', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }
    
    const snapshot = await db.ref('tablet/rp_info').once('value');
    const data = snapshot.val() || [];
    
    const newCard = {
      id: Date.now(),
      title: title,
      content: content,
      created: new Date().toISOString(),
      author: req.user.login
    };
    
    data.push(newCard);
    await db.ref('tablet/rp_info').set(data);
    
    res.json({
      success: true,
      data: newCard
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add info card' });
  }
});

// Get all patients
app.get('/api/patients', authenticate, async (req, res) => {
  try {
    const snapshot = await db.ref('tablet/rp_patients').once('value');
    const data = snapshot.val() || [];
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get specific patient
app.get('/api/patients/:id', authenticate, async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const snapshot = await db.ref('tablet/rp_patients').once('value');
    const data = snapshot.val() || [];
    
    const patient = data.find(p => p.id === patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Add new patient (admin only)
app.post('/api/patients', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { name, age, gender, condition, bloodType, allergies } = req.body;
    
    if (!name || !age) {
      return res.status(400).json({ error: 'Name and age required' });
    }
    
    const snapshot = await db.ref('tablet/rp_patients').once('value');
    const data = snapshot.val() || [];
    
    const newPatient = {
      id: Date.now(),
      name: name,
      age: parseInt(age),
      gender: gender || 'M',
      condition: condition || 'Stabilny',
      bloodType: bloodType || 'O+',
      allergies: allergies || 'Brak',
      created: new Date().toISOString(),
      addedBy: req.user.login
    };
    
    data.push(newPatient);
    await db.ref('tablet/rp_patients').set(data);
    
    res.json({
      success: true,
      data: newPatient
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

// Get all files
app.get('/api/files', authenticate, async (req, res) => {
  try {
    const snapshot = await db.ref('tablet/rp_files').once('value');
    const data = snapshot.val() || [];
    
    // Remove content from password-protected files for non-admin users
    const filteredData = data.map(file => {
      if (file.password && req.user.role !== 'admin') {
        return {
          ...file,
          content: '[ZASZYFROWANE - WYMAGANE HASŁO]',
          hasPassword: true
        };
      }
      return { ...file, hasPassword: !!file.password };
    });
    
    res.json({
      success: true,
      data: filteredData,
      count: filteredData.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get specific file with password
app.post('/api/files/:id/unlock', authenticate, async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const { password } = req.body;
    
    const snapshot = await db.ref('tablet/rp_files').once('value');
    const data = snapshot.val() || [];
    
    const file = data.find(f => f.id === fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (file.password && file.password !== password && req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlock file' });
  }
});

// Get XYZ project data
app.get('/api/xyz', authenticate, async (req, res) => {
  try {
    const snapshot = await db.ref('tablet/rp_xyz_project').once('value');
    const data = snapshot.val() || {};
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch XYZ project' });
  }
});

// Get system status
app.get('/api/status', authenticate, async (req, res) => {
  try {
    const info = await db.ref('tablet/rp_info').once('value');
    const patients = await db.ref('tablet/rp_patients').once('value');
    const files = await db.ref('tablet/rp_files').once('value');
    const accounts = await db.ref('tablet/rp_accounts').once('value');
    
    res.json({
      success: true,
      data: {
        info_cards: (info.val() || []).length,
        patients: (patients.val() || []).length,
        files: (files.val() || []).length,
        users: (accounts.val() || []).length,
        server_time: new Date().toISOString(),
        user: {
          login: req.user.login,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// ============================================
// REAL-TIME ENDPOINTS
// ============================================

// Server-Sent Events for real-time updates
app.get('/api/events', authenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
  
  // Listen for Firebase changes
  const infoRef = db.ref('tablet/rp_info');
  const patientsRef = db.ref('tablet/rp_patients');
  const filesRef = db.ref('tablet/rp_files');
  
  const sendUpdate = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`);
  };
  
  infoRef.on('value', (snapshot) => {
    sendUpdate('info_updated', snapshot.val());
  });
  
  patientsRef.on('value', (snapshot) => {
    sendUpdate('patients_updated', snapshot.val());
  });
  
  filesRef.on('value', (snapshot) => {
    sendUpdate('files_updated', snapshot.val());
  });
  
  // Cleanup on client disconnect
  req.on('close', () => {
    infoRef.off();
    patientsRef.off();
    filesRef.off();
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Mobile API server running on port ${PORT}`);
  console.log(`📱 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔥 Connected to Firebase: tablet-organizacji`);
});

module.exports = app;