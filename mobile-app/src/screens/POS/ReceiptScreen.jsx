import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { posService } from '../../services/api';

export function ReceiptScreen({ route, navigation }) {
  const { transactionId } = route.params;
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, []);

  const loadReceipt = async () => {
    try {
      const data = await posService.getReceipt(transactionId);
      setReceipt(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load receipt');
      console.error('Failed to load receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Receipt not found</Text>
      </View>
    );
  }

  const handlePrint = () => {
    Alert.alert('Print', 'Printing receipt...');
  };

  const handleEmail = () => {
    Alert.alert('Email', 'Email receipt feature coming soon');
  };

  const handleNewTransaction = () => {
    navigation.popToTop();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.receiptContainer}>
        <Text style={styles.receiptTitle}>RECEIPT</Text>

        <View style={styles.divider} />

        <View style={styles.transactionInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID:</Text>
            <Text style={styles.infoValue}>{receipt.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time:</Text>
            <Text style={styles.infoValue}>
              {new Date(receipt.createdAt).toLocaleString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method:</Text>
            <Text style={styles.infoValue}>
              {receipt.method.charAt(0).toUpperCase() + receipt.method.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items</Text>

          {receipt.items && receipt.items.map && receipt.items.map((item, index) => (
            <View key={index} style={styles.receiptItem}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <View style={styles.itemAmount}>
                <Text style={styles.amountLabel}>
                  AED {item.price.toFixed(2)} x {item.quantity}
                </Text>
                <Text style={styles.amountValue}>
                  AED {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              AED {receipt.subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT (5%):</Text>
            <Text style={styles.totalValue}>
              AED {receipt.vat.toFixed(2)}
            </Text>
          </View>

          {receipt.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={[styles.totalValue, { color: '#d32f2f' }]}>
                -AED {receipt.discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalLabel}>Total:</Text>
            <Text style={styles.finalAmount}>
              AED {receipt.total.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your purchase!</Text>
          <Text style={styles.footerText}>Please save this receipt for your records</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePrint}
        >
          <Text style={styles.actionButtonText}>🖨️ Print</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEmail}
        >
          <Text style={styles.actionButtonText}>📧 Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.newTransactionButton]}
          onPress={handleNewTransaction}
        >
          <Text style={styles.newTransactionButtonText}>New Sale</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
  },
  receiptContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  transactionInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 11,
    color: '#94a3b8',
  },
  itemAmount: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  totalsSection: {
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  finalTotal: {
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#3b82f6',
    marginTop: 8,
  },
  finalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  finalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  newTransactionButton: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  newTransactionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
