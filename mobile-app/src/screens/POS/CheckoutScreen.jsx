import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { usePosStore } from '../../store/posStore';

export function CheckoutScreen({ navigation }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, subtotal, vat, total, paymentMethod, setPaymentMethod, clearCart } = usePosStore();

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'online', label: 'Online', icon: '📱' },
    { id: 'cheque', label: 'Cheque', icon: '📋' },
  ];

  const handlePayment = async () => {
    console.log('🔵 [PAYMENT] Button pressed');
    console.log('🛒 Cart items:', cart.length);
    console.log('💰 Total:', total);
    console.log('💳 Method:', paymentMethod);

    if (!cart || cart.length === 0) {
      Alert.alert('⚠️ Cart Empty', 'Please add items to cart before checkout');
      return;
    }

    setIsProcessing(true);

    try {
      const now = new Date().toISOString();
      const txnId = `TXN-${Date.now()}`;

      const transaction = {
        id: txnId,
        transactionId: txnId,
        items: cart.map((item) => ({
          productId: item.id || item.productId,
          name: item.name,
          quantity: item.quantity || item.qty,
          price: item.price,
        })),
        subtotal: subtotal || 0,
        vat: vat || 0,
        total: total || 0,
        discount: 0,
        method: paymentMethod || 'cash',
        createdAt: now,
      };

      console.log('💾 Saving transaction:', transaction);

      // Save to localStorage (works on web and native)
      if (typeof localStorage !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('pos_transactions') || '[]');
        localStorage.setItem('pos_transactions', JSON.stringify([transaction, ...existing]));
        console.log('✅ Saved to localStorage');
      }

      // Also save using posStore (for native SQLite)
      try {
        const { createTransaction } = usePosStore.getState();
        await createTransaction();
        console.log('✅ Saved via posStore');
      } catch (storeError) {
        console.log('⚠️ posStore save skipped (web mode)');
      }

      // Clear cart
      clearCart();
      console.log('🗑️ Cart cleared');

      // Show success
      setTimeout(() => {
        Alert.alert(
          '✅ Payment Successful!',
          `Order ID: ${txnId}\nAmount: AED ${total.toFixed(2)}\nMethod: ${(paymentMethod || 'cash').toUpperCase()}`,
          [
            {
              text: 'View Receipt',
              onPress: () => {
                console.log('📄 Navigating to Receipt');
                navigation.navigate('Receipt', { transactionId: txnId });
              },
            },
            {
              text: 'New Order',
              onPress: () => {
                console.log('🔄 Navigating to Products');
                navigation.navigate('Products');
              },
            },
          ]
        );
        setIsProcessing(false);
      }, 500);

    } catch (error) {
      console.error('❌ Payment error:', error);
      console.error('Stack:', error.stack);
      setIsProcessing(false);
      Alert.alert(
        '❌ Payment Failed',
        error.message || 'An error occurred. Please try again.'
      );
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.emptyButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💳 Payment</Text>
          <Text style={styles.headerSubtitle}>Select payment method</Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethods}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                paymentMethod === method.id && styles.methodCardSelected,
              ]}
              onPress={() => setPaymentMethod(method.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <Text style={styles.methodLabel}>{method.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>📋 Order Summary</Text>
          
          {cart.map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity || item.qty}</Text>
              </View>
              <Text style={styles.itemAmount}>
                AED {((item.price || 0) * (item.quantity || item.qty || 1)).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.label}>Subtotal:</Text>
              <Text style={styles.value}>AED {(subtotal || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.label}>VAT (5%):</Text>
              <Text style={styles.value}>AED {(vat || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>AED {(total || 0).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.payButtonText}>Complete Payment</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  methodCard: {
    flex: '48%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  methodCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(37,99,235,0.2)',
  },
  methodIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  summary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  itemQty: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
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
  totals: {
    marginTop: 8,
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
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    flex: 0.35,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  payButton: {
    flex: 0.65,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
