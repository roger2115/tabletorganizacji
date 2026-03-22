// ============================================
// REACT NATIVE APP EXAMPLE
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
} from 'react-native';

// API Class
class TabletAPI {
  constructor() {
    this.baseURL = 'http://localhost:3001/api'; // Change to your server URL
    this.token = null;
  }

  async login(login, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  async getInfo() { return this.request('/info'); }
  async getPatients() { return this.request('/patients'); }
  async getPatient(id) { return this.request(`/patients/${id}`); }
  async getFiles() { return this.request('/files'); }
  async getStatus() { return this.request('/status'); }
  async addPatient(data) { return this.request('/patients', 'POST', data); }
  async addInfo(data) { return this.request('/info', 'POST', data); }
}

const api = new TabletAPI();

// Colors (Cyberpunk theme)
const colors = {
  dark: '#0a0c0e',
  darkPanel: '#151820',
  red: '#e8003d',
  cyan: '#00e5cc',
  yellow: '#ffd200',
  border: '#2a2e38',
  white: '#ffffff',
  gray: '#888888',
};

// Login Screen
const LoginScreen = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Błąd', 'Wprowadź login i hasło');
      return;
    }

    setLoading(true);
    try {
      const user = await api.login(login, password);
      onLogin(user);
    } catch (error) {
      Alert.alert('Błąd logowania', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark} />
      <View style={styles.loginContainer}>
        <Text style={styles.title}>TABLET ORGANIZACJI</Text>
        <Text style={styles.subtitle}>SYSTEM MOBILNY v1.0</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>LOGIN</Text>
          <TextInput
            style={styles.input}
            value={login}
            onChangeText={setLogin}
            placeholder="Wprowadź login"
            placeholderTextColor={colors.gray}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>HASŁO</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Wprowadź hasło"
            placeholderTextColor={colors.gray}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'LOGOWANIE...' : 'ZALOGUJ'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Main App Screen
const MainScreen = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      switch (activeTab) {
        case 'info':
          result = await api.getInfo();
          break;
        case 'patients':
          result = await api.getPatients();
          break;
        case 'files':
          result = await api.getFiles();
          break;
        case 'status':
          result = await api.getStatus();
          break;
      }
      setData({ ...data, [activeTab]: result.data });
    } catch (error) {
      Alert.alert('Błąd', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderInfoCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent}>{item.content}</Text>
      <Text style={styles.cardDate}>
        {new Date(item.created).toLocaleDateString('pl-PL')}
      </Text>
    </View>
  );

  const renderPatient = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardContent}>
        Wiek: {item.age} | Płeć: {item.gender} | Stan: {item.condition}
      </Text>
      <Text style={styles.cardContent}>
        Grupa krwi: {item.bloodType} | Alergie: {item.allergies}
      </Text>
    </View>
  );

  const renderFile = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {item.title} {item.hasPassword && '🔒'}
      </Text>
      <Text style={styles.cardContent}>
        {item.hasPassword && !user.role === 'admin' 
          ? '[ZASZYFROWANE - WYMAGANE HASŁO]' 
          : item.content.substring(0, 100) + '...'}
      </Text>
      <Text style={styles.cardDate}>
        {new Date(item.created).toLocaleDateString('pl-PL')}
      </Text>
    </View>
  );

  const renderStatus = () => {
    const statusData = data.status || {};
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>STATUS SYSTEMU</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{statusData.info_cards || 0}</Text>
            <Text style={styles.statusLabel}>WIADOMOŚCI</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{statusData.patients || 0}</Text>
            <Text style={styles.statusLabel}>PACJENCI</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{statusData.files || 0}</Text>
            <Text style={styles.statusLabel}>PLIKI</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{statusData.users || 0}</Text>
            <Text style={styles.statusLabel}>UŻYTKOWNICY</Text>
          </View>
        </View>
        <Text style={styles.userInfo}>
          Zalogowany jako: {user.login} ({user.role})
        </Text>
      </View>
    );
  };

  const renderContent = () => {
    const currentData = data[activeTab] || [];
    
    if (activeTab === 'status') {
      return renderStatus();
    }

    return (
      <FlatList
        data={currentData}
        renderItem={
          activeTab === 'info' ? renderInfoCard :
          activeTab === 'patients' ? renderPatient :
          renderFile
        }
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.cyan}
          />
        }
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TABLET ORGANIZACJI</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>WYLOGUJ</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'info', label: 'INFO' },
          { key: 'patients', label: 'PACJENCI' },
          { key: 'files', label: 'PLIKI' },
          { key: 'status', label: 'STATUS' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>ŁADOWANIE...</Text>
          </View>
        ) : (
          renderContent()
        )}
      </View>
    </SafeAreaView>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    api.token = null;
  };

  return user ? (
    <MainScreen user={user} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.red,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.cyan,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'monospace',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: colors.cyan,
    marginBottom: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.darkPanel,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.white,
    padding: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.red,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.red,
    backgroundColor: colors.darkPanel,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.red,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  logoutButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    color: colors.white,
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.darkPanel,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.red,
  },
  tabText: {
    color: colors.gray,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: colors.red,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.cyan,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.darkPanel,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    color: colors.red,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: 'monospace',
  },
  statusContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.cyan,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statusItem: {
    width: '48%',
    backgroundColor: colors.darkPanel,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  statusValue: {
    fontSize: 32,
    color: colors.red,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.cyan,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userInfo: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});

export default App;