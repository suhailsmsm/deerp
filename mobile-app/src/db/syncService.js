import * as Network from 'expo-network';
import * as BackgroundFetch from 'expo-background-fetch';
import { posService } from '../services/api';
import {
  getUnsyncedTransactions,
  markTransactionSynced,
  incrementSyncAttempts,
  getSyncQueueItems,
  removeSyncQueueItem,
  incrementQueueAttempts,
  getSyncStats,
  updateProductStock,
} from './database';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Check network connectivity
export const checkConnectivity = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected;
  } catch (error) {
    console.error('Network check failed:', error);
    return false;
  }
};

// Sync a single transaction to server
const syncTransaction = async (transaction) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pos/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: transaction.items,
        subtotal: transaction.subtotal,
        vat: transaction.vat,
        total: transaction.total,
        discount: transaction.discount,
        method: transaction.method,
        customerId: transaction.customerId,
        customerName: transaction.customerName,
        branchId: transaction.branchId,
        staffId: transaction.staffId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const serverData = await response.json();
    
    // Mark as synced in local DB
    await markTransactionSynced(transaction.transactionId, serverData);
    
    // Update local stock
    for (const item of transaction.items) {
      await updateProductStock(item.productId, item.quantity);
    }

    console.log(`✅ Synced transaction ${transaction.transactionId}`);
    return { success: true, data: serverData };
  } catch (error) {
    console.error(`❌ Failed to sync transaction ${transaction.transactionId}:`, error.message);
    await incrementSyncAttempts(transaction.transactionId);
    return { success: false, error: error.message };
  }
};

// Sync all pending transactions
export const syncPendingTransactions = async () => {
  const isConnected = await checkConnectivity();
  
  if (!isConnected) {
    console.log('📡 No network connection, skipping sync');
    return { synced: 0, failed: 0, reason: 'offline' };
  }

  const unsynced = await getUnsyncedTransactions();
  
  if (unsynced.length === 0) {
    console.log('✅ No pending transactions to sync');
    return { synced: 0, failed: 0 };
  }

  console.log(`🔄 Syncing ${unsynced.length} transactions...`);
  
  let synced = 0;
  let failed = 0;

  for (const transaction of unsynced) {
    // Skip if too many attempts (prevent infinite retry)
    if (transaction.syncAttempts >= 5) {
      console.warn(`⚠️ Skipping ${transaction.transactionId}: too many attempts (${transaction.syncAttempts})`);
      failed++;
      continue;
    }

    const result = await syncTransaction(transaction);
    
    if (result.success) {
      synced++;
    } else {
      failed++;
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`✅ Sync complete: ${synced} succeeded, ${failed} failed`);
  return { synced, failed };
};

// Process sync queue (for other entity types)
export const processSyncQueue = async () => {
  const isConnected = await checkConnectivity();
  
  if (!isConnected) {
    return { processed: 0, failed: 0, reason: 'offline' };
  }

  const queueItems = await getSyncQueueItems(50);
  
  if (queueItems.length === 0) {
    return { processed: 0, failed: 0 };
  }

  console.log(`🔄 Processing ${queueItems.length} sync queue items...`);
  
  let processed = 0;
  let failed = 0;

  for (const item of queueItems) {
    try {
      // Skip if too many attempts
      if (item.attempts >= 5) {
        console.warn(`⚠️ Skipping queue item ${item.id}: too many attempts`);
        failed++;
        continue;
      }

      const payload = JSON.parse(item.payload);
      
      // Route based on entity type
      switch (item.entityType) {
        case 'transaction':
          await syncTransaction(payload);
          break;
        
        case 'product':
          // Handle product sync
          await posService.saveProduct(payload);
          break;
        
        case 'customer':
          // Handle customer sync
          await posService.saveCustomer(payload);
          break;
        
        default:
          console.warn(`Unknown entity type: ${item.entityType}`);
      }

      await removeSyncQueueItem(item.id);
      processed++;
    } catch (error) {
      console.error(`❌ Failed to process queue item ${item.id}:`, error.message);
      await incrementQueueAttempts(item.id);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`✅ Queue processing complete: ${processed} processed, ${failed} failed`);
  return { processed, failed };
};

// Background sync task
export const setupBackgroundSync = async () => {
  try {
    BackgroundFetch.registerBackgroundTaskAsync(async () => {
      console.log('🔄 Background sync triggered');
      
      const result = await syncPendingTransactions();
      const queueResult = await processSyncQueue();
      const stats = await getSyncStats();
      
      console.log('📊 Sync stats:', stats);
      
      BackgroundFetch.finish();
    });

    console.log('✅ Background sync configured');
  } catch (error) {
    console.error('❌ Failed to setup background sync:', error);
  }
};

// Manual sync trigger (for user action)
export const triggerManualSync = async () => {
  console.log('🔄 Manual sync triggered by user');
  
  const txResult = await syncPendingTransactions();
  const queueResult = await processSyncQueue();
  const stats = await getSyncStats();
  
  return {
    transactions: txResult,
    queue: queueResult,
    stats,
  };
};

// Initialize sync system
export const initSyncSystem = async () => {
  console.log('🚀 Initializing sync system...');
  
  await setupBackgroundSync();
  
  // Initial sync check
  const isConnected = await checkConnectivity();
  if (isConnected) {
    const stats = await getSyncStats();
    console.log('📊 Current sync status:', stats);
    
    if (stats.unsynced > 0 || stats.pending > 0) {
      console.log('🔄 Found pending items, starting sync...');
      await syncPendingTransactions();
      await processSyncQueue();
    }
  } else {
    console.log('📡 Offline mode active');
  }
};

// Get sync status for UI
export const getSyncStatus = async () => {
  const isConnected = await checkConnectivity();
  const stats = await getSyncStats();
  
  return {
    online: isConnected,
    ...stats,
    hasPendingWork: stats.unsynced > 0 || stats.pending > 0,
  };
};
