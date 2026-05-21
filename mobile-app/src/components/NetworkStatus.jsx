import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePosStore } from '../../store/posStore';
import * as sync from '../../db/syncService';

export default function NetworkStatus() {
  const { syncStatus, triggerSync } = usePosStore();
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Update sync status every 10 seconds
    const interval = setInterval(() => {
      usePosStore.getState().updateSyncStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleManualSync = async () => {
    if (isSyncing || syncStatus.online) return;
    
    setIsSyncing(true);
    try {
      await triggerSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (syncStatus.online) return '#10b981'; // emerald
    if (syncStatus.unsynced > 0) return '#f59e0b'; // amber
    return '#64748b'; // slate
  };

  const getStatusIcon = () => {
    if (syncStatus.online) return 'wifi';
    if (syncStatus.unsynced > 0) return 'cloud-offline';
    return 'wifi-off';
  };

  const getStatusText = () => {
    if (syncStatus.online) {
      if (syncStatus.unsynced > 0) {
        return `${syncStatus.unsynced} pending sync`;
      }
      return 'Online';
    }
    if (syncStatus.unsynced > 0) {
      return `Offline (${syncStatus.unsynced} pending)`;
    }
    return 'Offline';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={[styles.statusBar, { borderColor: getStatusColor() }]}
        onPress={() => setShowDetails(!showDetails)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={getStatusIcon()}
          size={18}
          color={getStatusColor()}
          style={styles.icon}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {!syncStatus.online && syncStatus.unsynced > 0 && (
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            <Ionicons
              name={isSyncing ? 'hourglass' : 'refresh'}
              size={16}
              color="#fff"
            />
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        )}
        <Ionicons
          name={showDetails ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#94a3b8"
        />
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.detailsPanel}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons name="cloud-done" size={20} color="#10b981" />
              <Text style={styles.statLabel}>Synced</Text>
              <Text style={styles.statValue}>
                {syncStatus.unsynced === 0 ? '✓' : '-'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cloud-upload" size={20} color="#f59e0b" />
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                {syncStatus.unsynced}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cloud-offline" size={20} color="#64748b" />
              <Text style={styles.statLabel}>Queue</Text>
              <Text style={[styles.statValue, { color: '#64748b' }]}>
                {syncStatus.pending}
              </Text>
            </View>
          </View>

          {!syncStatus.online && (
            <View style={styles.offlineNotice}>
              <Ionicons name="warning" size={16} color="#f59e0b" />
              <Text style={styles.offlineText}>
                Transactions are saved locally and will sync when online
              </Text>
            </View>
          )}

          {syncStatus.failed > 0 && (
            <View style={styles.failedNotice}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.failedText}>
                {syncStatus.failed} sync failed (max retries)
              </Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  icon: {
    marginRight: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#64748b',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsPanel: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  offlineText: {
    flex: 1,
    fontSize: 11,
    color: '#fbbf24',
    lineHeight: 16,
  },
  failedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    marginTop: 8,
  },
  failedText: {
    flex: 1,
    fontSize: 11,
    color: '#f87171',
    lineHeight: 16,
  },
});
