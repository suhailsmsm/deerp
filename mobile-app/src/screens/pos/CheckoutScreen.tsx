/**
 * DerpX POS - Checkout Screen
 * Payment processing with UAE payment gateways and order completion
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  Modal,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePosStore } from '../../store/posStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatCurrency } from '../../utils';
import { PAYMENT_METHODS, UAE, UAE_PAYMENT_GATEWAYS } from '../../constants';
import { darkColors, lightColors, spacing, borderRadius, typography } from '../../constants/theme';

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  discountValue: {
    color: colors.success,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
  },
  itemCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  paymentMethod: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '30%',
    flex: 1,
  },
  paymentMethodActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  paymentText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  paymentTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  gatewayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  gatewayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  gatewayText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  amountInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.xl,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAmount: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  exactAmountButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  exactAmountText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  changeContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  changeLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  changeValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
  splitPaymentContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  splitMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  splitMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  splitAmountInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.fontSize.md,
    color: colors.text,
    width: 100,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.border,
  },
  splitTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  digitalReceiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  // Success Screen Styles
  successOverlay: {
    flex: 1,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    color: '#fff',
  },
  successTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.md,
  },
  successAmount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
    marginBottom: spacing.xl,
  },
  orderSummaryBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    minWidth: 200,
  },
  orderSummaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  orderSummaryLabel: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
  orderSummaryValue: {
    fontSize: typography.fontSize.md,
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
  },
  whatsappStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37,211,102,0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  whatsappStatusText: {
    fontSize: typography.fontSize.md,
    color: '#25D366',
    fontWeight: typography.fontWeight.semibold,
  },
  successActionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    minWidth: 200,
    alignItems: 'center',
  },
  successActionText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    minWidth: 200,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { total, subtotal, discountAmount, vatAmount, itemCount, processOrder, whatsappNotificationUrl } = usePosStore();
  
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('');
  const [sendEmailReceipt, setSendEmailReceipt] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendSMSReceipt, setSendSMSReceipt] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [splitPayments, setSplitPayments] = useState<{ id: string; amount: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Auto-fill cash amount with total when cash is selected
  useEffect(() => {
    if (selectedPayment === 'cash' && total > 0 && !amountReceived) {
      setAmountReceived(total.toFixed(2));
    }
  }, [selectedPayment, total]);

  const amountReceivedNum = parseFloat(amountReceived) || 0;
  const change = amountReceivedNum - total;

  const handleQuickAmount = (amount: number) => {
    setAmountReceived(amount.toString());
  };

  const handleExactAmount = () => {
    setAmountReceived(total.toFixed(2));
  };

  const handleCheckout = async () => {
    if (selectedPayment === 'cash' && amountReceivedNum < total) {
      Alert.alert('Insufficient Amount', 'Amount received is less than total. Please enter the correct amount.');
      return;
    }

    if (selectedPayment === 'split') {
      const totalSplit = splitPayments.reduce((sum, sp) => sum + (parseFloat(sp.amount) || 0), 0);
      if (Math.abs(totalSplit - total) > 0.01) {
        Alert.alert('Split Mismatch', `Split total (${formatCurrency(totalSplit)}) doesn't match order total (${formatCurrency(total)})`);
        return;
      }
    }

    setIsProcessing(true);
    try {
      const order = await processOrder();
      setCompletedOrder(order);
      
      // Auto-open WhatsApp notification
      if (whatsappNotificationUrl) {
        try {
          const supported = await Linking.canOpenURL(whatsappNotificationUrl);
          if (supported) {
            await Linking.openURL(whatsappNotificationUrl);
            // Wait a bit for WhatsApp to open, then show success
            setTimeout(() => {
              setShowSuccess(true);
            }, 500);
          } else {
            Alert.alert('WhatsApp not available', 'Please install WhatsApp to send notifications.');
            setShowSuccess(true);
          }
        } catch {
          Alert.alert('Error', 'Could not open WhatsApp.');
          setShowSuccess(true);
        }
      } else {
        setShowSuccess(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSplitPayment = () => {
    const newId = `split_${Date.now()}`;
    setSplitPayments([...splitPayments, { id: newId, amount: '0' }]);
  };

  const handleSplitAmountChange = (id: string, amount: string) => {
    setSplitPayments(
      splitPayments.map((sp) => (sp.id === id ? { ...sp, amount } : sp))
    );
  };

  const handleRemoveSplitPayment = (id: string) => {
    setSplitPayments(splitPayments.filter((sp) => sp.id !== id));
  };

  const basicPayments = PAYMENT_METHODS.filter(m => ['cash', 'card', 'contactless', 'bank_transfer', 'credit', 'split'].includes(m.id));
  const cardPayments = PAYMENT_METHODS.filter(m => ['visa', 'mastercard', 'apple_pay', 'google_pay'].includes(m.id));

  // Order Complete Screen (after payment and WhatsApp notification)
  if (showSuccess && completedOrder) {
    return (
      <View style={styles.successOverlay}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={60} style={styles.successIcon} />
        </View>
        <Text style={styles.successTitle}>Order Complete!</Text>
        <Text style={styles.successSubtitle}>
          {selectedPayment === 'cash' && change > 0
            ? `Change: ${formatCurrency(change)}`
            : 'Payment Successful'}
        </Text>
        <Text style={styles.successAmount}>{formatCurrency(total)}</Text>

        {/* Order Summary */}
        <View style={styles.orderSummaryBox}>
          <Text style={styles.orderSummaryTitle}>Order {completedOrder.orderNumber}</Text>
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryLabel}>Items:</Text>
            <Text style={styles.orderSummaryValue}>{completedOrder.items.length}</Text>
          </View>
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryLabel}>Total:</Text>
            <Text style={styles.orderSummaryValue}>{formatCurrency(completedOrder.total)}</Text>
          </View>
        </View>

        {/* WhatsApp Status */}
        {whatsappNotificationUrl && (
          <View style={styles.whatsappStatusBox}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={styles.whatsappStatusText}>Seller notified via WhatsApp</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.successActionButton}
          onPress={() => {
            setShowSuccess(false);
            navigation.navigate('Receipt' as never);
          }}
        >
          <Ionicons name="print-outline" size={20} color="#fff" />
          <Text style={styles.successActionText}>Print Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.successActionButton}
          onPress={() => {
            setShowSuccess(false);
            navigation.reset({ index: 0, routes: [{ name: 'POSHome' as never }] });
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.successActionText}>New Order</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Order Summary - Auto-calculated */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={[styles.summaryValue, styles.discountValue]}>-{formatCurrency(discountAmount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>VAT ({(UAE.vatRate * 100).toFixed(0)}%)</Text>
          <Text style={styles.summaryValue}>{formatCurrency(vatAmount)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
        <Text style={styles.itemCount}>{itemCount} items</Text>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentGrid}>
          {basicPayments.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentMethod, selectedPayment === method.id && styles.paymentMethodActive]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
                <Ionicons name={method.icon as any} size={24} color={method.color} />
              </View>
              <Text style={[styles.paymentText, selectedPayment === method.id && styles.paymentTextActive]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Card Brand Selection */}
      {['card', 'contactless'].includes(selectedPayment) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Type</Text>
          <View style={styles.paymentGrid}>
            {cardPayments.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentMethod, selectedGateway === method.id && styles.paymentMethodActive]}
                onPress={() => setSelectedGateway(method.id)}
              >
                <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
                  <Ionicons name={method.icon as any} size={24} color={method.color} />
                </View>
                <Text style={[styles.paymentText, selectedGateway === method.id && styles.paymentTextActive]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* UAE Payment Gateways */}
      {['card', 'visa', 'mastercard', 'contactless'].includes(selectedPayment) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Gateway</Text>
          <View style={styles.gatewayGrid}>
            {UAE_PAYMENT_GATEWAYS.map((gateway) => (
              <TouchableOpacity
                key={gateway.id}
                style={[styles.gatewayChip, selectedGateway === gateway.id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                onPress={() => setSelectedGateway(gateway.id)}
              >
                <Ionicons name="globe-outline" size={16} color={selectedGateway === gateway.id ? colors.primary : colors.textMuted} />
                <Text style={[styles.gatewayText, selectedGateway === gateway.id && { color: colors.primary }]}>
                  {gateway.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Cash Payment */}
      {selectedPayment === 'cash' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cash Payment</Text>
          
          <TextInput
            style={styles.amountInput}
            placeholder="Amount Received"
            placeholderTextColor={colors.textMuted}
            value={amountReceived}
            onChangeText={setAmountReceived}
            keyboardType="decimal-pad"
          />

          <View style={styles.quickAmounts}>
            {[10, 20, 50, 100, 200, 500].map((amount) => (
              <TouchableOpacity key={amount} style={styles.quickAmount} onPress={() => handleQuickAmount(amount)}>
                <Text style={styles.quickAmountText}>AED {amount}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.exactAmountButton} onPress={handleExactAmount}>
              <Text style={styles.exactAmountText}>Exact {formatCurrency(total)}</Text>
            </TouchableOpacity>
          </View>

          {amountReceivedNum > 0 && (
            <View style={styles.changeContainer}>
              <View style={styles.changeRow}>
                <Text style={styles.changeLabel}>Amount Received:</Text>
                <Text style={styles.changeValue}>{formatCurrency(amountReceivedNum)}</Text>
              </View>
              <View style={styles.changeRow}>
                <Text style={styles.changeLabel}>Change Due:</Text>
                <Text style={[styles.changeValue, change >= 0 ? styles.changePositive : styles.changeNegative]}>
                  {formatCurrency(change)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Split Payment */}
      {selectedPayment === 'split' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split Payment</Text>
          <View style={styles.splitPaymentContainer}>
            {splitPayments.map((sp) => (
              <View key={sp.id} style={styles.splitMethodRow}>
                <View style={styles.splitMethodInfo}>
                  <Ionicons name="layers-outline" size={20} color={colors.accent} />
                  <Text style={styles.summaryLabel}>Split {splitPayments.indexOf(sp) + 1}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <TextInput
                    style={styles.splitAmountInput}
                    value={sp.amount}
                    onChangeText={(v) => handleSplitAmountChange(sp.id, v)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => handleRemoveSplitPayment(sp.id)}>
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={handleAddSplitPayment} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
              <Ionicons name="add-circle" size={20} color={colors.accent} />
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Add Split Payment</Text>
            </TouchableOpacity>
            <View style={styles.splitTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(splitPayments.reduce((sum, sp) => sum + (parseFloat(sp.amount) || 0), 0))}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Digital Receipt Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Digital Receipt</Text>
        <View style={[styles.summaryCard, { marginBottom: 0 }]}>
          <View style={styles.digitalReceiptRow}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.summaryLabel, { flex: 1, marginLeft: spacing.sm }]}>Email Receipt</Text>
            <Switch value={sendEmailReceipt} onValueChange={setSendEmailReceipt} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
          </View>
          {sendEmailReceipt && (
            <TextInput style={styles.notesInput} placeholder="customer@email.com" placeholderTextColor={colors.textMuted} value={emailAddress} onChangeText={setEmailAddress} keyboardType="email-address" />
          )}
          <View style={[styles.digitalReceiptRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm }]}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.summaryLabel, { flex: 1, marginLeft: spacing.sm }]}>SMS Receipt</Text>
            <Switch value={sendSMSReceipt} onValueChange={setSendSMSReceipt} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
          </View>
          {sendSMSReceipt && (
            <TextInput style={[styles.notesInput, { marginTop: spacing.sm }]} placeholder="+971 XX XXX XXXX" placeholderTextColor={colors.textMuted} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
          )}
        </View>
      </View>

      {/* Complete Order Button */}
      <TouchableOpacity
        style={[styles.completeButton, (change < 0 && selectedPayment === 'cash' || isProcessing) && styles.completeButtonDisabled]}
        onPress={handleCheckout}
        disabled={change < 0 && selectedPayment === 'cash' || isProcessing}
      >
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.completeButtonText}>
          {isProcessing ? 'Processing...' : `Complete Order - ${formatCurrency(total)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}