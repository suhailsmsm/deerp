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
    if (!cart || cart.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to cart before checkout');
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = await createTransaction();

      const isLocal = transaction.id?.startsWith('local-');
      
      Alert.alert(
        '✅ Payment Successful',
        isLocal
          ? `Transaction saved locally\nID: ${transaction.id}\nAmount: AED ${transaction.total.toFixed(2)}\n\n⚠️ Will sync when online`
          : `Transaction ID: ${transaction.id}\nAmount: AED ${transaction.total.toFixed(2)}`,
        [
          {
            text: 'View Receipt',
            onPress: () => {
              navigation.navigate('Receipt', { transactionId: transaction.id });
            },
          },
          {
            text: 'New Order',
            onPress: () => {
              navigation.navigate('Products');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        '❌ Payment Failed',
        error.message || 'Failed to process payment. Please try again.'
      );
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
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  methodCard: {
    flex: 0.48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  methodCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(37,99,235,0.15)',
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  methodLabelSelected: {
    color: '#3b82f6',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    margin: 12,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  itemsList: {
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    color: '#94a3b8',
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: '#94a3b8',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  totalFinal: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#3b82f6',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginTop: 12,
  },
  cancelButton: {
    flex: 0.3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  payButton: {
    flex: 0.7,
    backgroundColor: '#16a34a',
    borderRadius: 10,
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
