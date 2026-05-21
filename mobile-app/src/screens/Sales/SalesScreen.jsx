import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { posService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export function SalesScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await posService.getTransactions(50, 0, methodFilter);
      const list = Array.isArray(response) ? response : (response?.data || []);
      setTransactions(list);
      setDebugInfo(`loaded ${list.length} orders`);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to load sales history';
      setDebugInfo(`error: ${errorMessage}`);
      Alert.alert('Error', errorMessage);
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [methodFilter])
  );

  const filterOptions = [
    { id: '', label: 'All' },
    { id: 'cash', label: 'Cash' },
    { id: 'card', label: 'Card' },
    { id: 'online', label: 'Online' },
    { id: 'cheque', label: 'Cheque' },
  ];

  const generateSalesReportHtml = () => {
    const rows = transactions.map((tx) => `
      <tr>
        <td>${tx.id}</td>
        <td>${tx.method || '-'}</td>
        <td>${tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}</td>
        <td style="text-align:right;">AED ${Number(tx.total || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const grandTotal = transactions.reduce((sum, tx) => sum + Number(tx.total || 0), 0);

    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>DERPX Sales Report</h2>
          <p>Filter: <b>${methodFilter || 'All'}</b></p>
          <p>Total Orders: <b>${transactions.length}</b></p>
          <table width="100%" cellspacing="0" cellpadding="8" border="1" style="border-collapse: collapse;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th align="left">ID</th>
                <th align="left">Method</th>
                <th align="left">Date</th>
                <th align="right">Amount</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="4">No data</td></tr>'}</tbody>
          </table>
          <h3 style="text-align:right; margin-top:16px;">Grand Total: AED ${grandTotal.toFixed(2)}</h3>
        </body>
      </html>
    `;
  };

  const shareSalesReportPdf = async () => {
    try {
      const html = generateSalesReportHtml();
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Sales Report' });
      } else {
        await Share.share({ message: uri });
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create sales report PDF');
    }
  };

  const shareInvoicePdf = async (transactionId) => {
    try {
      const receipt = await posService.getReceipt(transactionId);
      const itemsRows = (receipt.items || []).map((item) => `
        <tr>
          <td>${item.name || '-'}</td>
          <td>${item.quantity || 0}</td>
          <td style="text-align:right;">AED ${Number(item.price || 0).toFixed(2)}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Invoice #${receipt.id}</h2>
            <p>Date: ${receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : '-'}</p>
            <p>Method: ${receipt.method || '-'}</p>
            <table width="100%" cellspacing="0" cellpadding="8" border="1" style="border-collapse: collapse;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th align="left">Item</th>
                  <th align="left">Qty</th>
                  <th align="right">Price</th>
                </tr>
              </thead>
              <tbody>${itemsRows || '<tr><td colspan="3">No items</td></tr>'}</tbody>
            </table>
            <h3 style="text-align:right; margin-top:16px;">Total: AED ${Number(receipt.total || 0).toFixed(2)}</h3>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Invoice PDF' });
      } else {
        await Share.share({ message: uri });
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to generate invoice PDF');
    }
  };

  const printToBluetooth = async (transactionId) => {
    Alert.alert(
      'Bluetooth Printing',
      `Bluetooth direct printing requires a native printer SDK integration.\nFor now, sharing invoice PDF for transaction ${transactionId}.`
    );
    await shareInvoicePdf(transactionId);
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'card': return 'card-outline';
      case 'cash': return 'cash-outline';
      case 'online': return 'phone-portrait-outline';
      case 'cheque': return 'document-text-outline';
      default: return 'wallet-outline';
    }
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Receipt', { transactionId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.methodBadge}>
          <Ionicons name={getMethodIcon(item.method)} size={16} color="#3b82f6" />
          <Text style={styles.methodText}>{item.method || 'Unknown'}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      <View style={styles.cardBody}>
        <View>
          <Text style={styles.transactionId}>#{String(item.id).toUpperCase()}</Text>
          <Text style={styles.itemCount}>{Array.isArray(item.items) ? item.items.length : 0} items</Text>
        </View>
        <Text style={styles.totalAmount}>AED {Number(item.total || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => shareInvoicePdf(item.id)}>
          <Ionicons name="document-outline" size={14} color="#fff" />
          <Text style={styles.actionBtnText}>Invoice PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => printToBluetooth(item.id)}>
          <Ionicons name="print-outline" size={14} color="#fff" />
          <Text style={styles.actionBtnText}>Bluetooth Print</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.debugText}>{debugInfo}</Text>
      <View style={styles.toolbar}>
        <FlatList
          horizontal
          data={filterOptions}
          keyExtractor={(item) => item.id || 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, methodFilter === item.id && styles.filterChipActive]}
              onPress={() => setMethodFilter(item.id)}
            >
              <Text style={[styles.filterChipText, methodFilter === item.id && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.reportBtn} onPress={shareSalesReportPdf}>
          <Ionicons name="share-social-outline" size={16} color="#fff" />
          <Text style={styles.reportBtnText}>Sales PDF</Text>
        </TouchableOpacity>
      </View>
      {isLoading && transactions.length === 0 ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#475569" />
              <Text style={styles.emptyText}>No sales found</Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={loadTransactions}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  methodText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionId: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemCount: {
    color: '#64748b',
    fontSize: 13,
  },
  cardActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f766e',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  totalAmount: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '800',
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  reportBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7c3aed',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  reportBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 12,
  },
  debugText: {
    color: '#f59e0b',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});