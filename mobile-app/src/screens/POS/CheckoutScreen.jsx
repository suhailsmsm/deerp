import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { usePosStore } from '../../store/posStore';

export function CheckoutScreen({ navigation }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    cart,
    subtotal,
    vat,
    total,
    paymentMethod,
    setPaymentMethod,
    createTransaction,
  } = usePosStore();

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'online', label: 'Online', icon: '📱' },
    { id: 'cheque', label: 'Cheque', icon: '📋' },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const transaction = await createTransaction();

      Alert.alert(
        'Payment Successful',
        `Transaction ID: ${transaction.id}\nAmount: AED ${transaction.total.toFixed(2)}`,
        [
          {
            text: 'View Receipt',
            onPress: () => {
              navigation.navigate('Receipt', { transactionId: transaction.id });
            },
          },
          {
            text: 'New Transaction',
            onPress: () => {
              navigation.navigate('Products');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Payment Failed', error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Method</Text>
      </View>

      <View style={styles.paymentMethods}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              paymentMethod === method.id && styles.methodCardSelected,
            ]}
            onPress={() => setPaymentMethod(method.id)}
          >
            <Text style={styles.methodIcon}>{method.icon}</Text>
            <Text style={[
              styles.methodLabel,
              paymentMethod === method.id && styles.methodLabelSelected,
            ]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.itemsList}>
          {cart.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemAmount}>
                AED {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text style={styles.value}>AED {subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.label}>VAT (5%):</Text>
            <Text style={styles.value}>AED {vat.toFixed(2)}</Text>
          </View>

          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>AED {total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Complete Payment</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  methodCard: {
    flex: 0.48,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  methodCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  methodLabelSelected: {
    color: '#007AFF',
  },
  section: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  itemsList: {
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    color: '#666',
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  totalsSection: {
    marginTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalFinal: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 12,
  },
  cancelButton: {
    flex: 0.3,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  payButton: {
    flex: 0.7,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
