import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

export default function SettingsScreen({ navigation }) {
  const { logout, user, isLoading: authLoading } = useAuthStore();
  const { profile, settings, fetchProfile, updateSettings, isLoading: settingsLoading } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      await fetchProfile();
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSetting = (key) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isLoading = authLoading || settingsLoading;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Profile</Text>
        {user && (
          <>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Email</Text>
              <Text style={styles.profileValue}>{user.email}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Role</Text>
              <Text style={styles.profileValue}>{user.role}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Tenant</Text>
              <Text style={styles.profileValue}>{user.tenantName}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sound Enabled</Text>
          <Switch
            value={localSettings.soundEnabled}
            onValueChange={() => toggleSetting('soundEnabled')}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Vibration Enabled</Text>
          <Switch
            value={localSettings.vibrateEnabled}
            onValueChange={() => toggleSetting('vibrateEnabled')}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Print Receipt</Text>
          <Switch
            value={localSettings.printReceipt}
            onValueChange={() => toggleSetting('printReceipt')}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email Receipt</Text>
          <Switch
            value={localSettings.emailReceipt}
            onValueChange={() => toggleSetting('emailReceipt')}
          />
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Language</Text>
          <Text style={styles.infoValue}>{localSettings.language === 'en' ? 'English' : 'العربية'}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Currency</Text>
          <Text style={styles.infoValue}>{localSettings.currency}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>VAT Rate</Text>
          <Text style={styles.infoValue}>{localSettings.vatRate}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>DERPX Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  profileItem: {
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  infoLabel: {
    fontSize: 16,
    color: '#fff',
  },
  infoValue: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    color: '#64748b',
    fontSize: 12,
  },
});
