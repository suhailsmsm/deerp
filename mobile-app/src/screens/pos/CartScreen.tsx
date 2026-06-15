/**
 * DerpX POS - Cart Screen
 * View and manage cart items, apply discounts, proceed to checkout
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePosStore } from '../../store/posStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatCurrency } from '../../utils';
import { darkColors, lightColors, spacing, borderRadius, typography } from '../../constants/theme';
import { UAE } from '../../constants';

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  cartList: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    marginLeft: spacing.md,
  },
  itemTotalText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  removeButton: {
    marginLeft: spacing.md,
    padding: spacing.sm,
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  discountLabel: {
    color: colors.primary,
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
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  holdButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  holdButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  checkoutButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  checkoutButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  discountTypeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  discountTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  discountTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  discountTypeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  discountTypeTextActive: {
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
  },
  discountInput: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: spacing.md,
  },
  currentDiscount: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  modalApplyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalApplyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
});

export default function CartScreen() {
  const navigation = useNavigation();
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const store = usePosStore();
  const cart = store.cart;
  const items = cart?.items ?? [];
  const {
    subtotal,
    discountAmount,
    vatAmount,
    total,
    itemCount,
    removeFromCart,
    updateQuantity,
    clearCart,
    setDiscount,
    holdCart,
  } = store;

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(itemId),
        },
      ]
    );
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearCart();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleHoldOrder = () => {
    if (holdCart) {
      holdCart();
      Alert.alert('Order Held', 'Your order has been saved. You can resume it later.');
      navigation.goBack();
    }
  };

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Discount', 'Please enter a valid amount');
      return;
    }

    if (discountType === 'percentage' && value > 100) {
      Alert.alert('Invalid Discount', 'Percentage cannot exceed 100%');
      return;
    }

    setDiscount(value, discountType);
    setShowDiscountModal(false);
    setDiscountValue('');
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout' as never);
  };

  const renderCartItem = ({ item }: { item: { id: string; name: string; price: number; quantity: number; image?: string } }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImage}>
        <Ionicons name="image-outline" size={32} color={colors.textMuted} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          {formatCurrency(item.price * item.quantity)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (!cart || items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Cart is Empty</Text>
          <Text style={styles.emptyText}>
            Add products from the POS screen to start billing
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart ({itemCount})</Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* Order Summary - Auto-calculated */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <TouchableOpacity
          style={styles.summaryRow}
          onPress={() => setShowDiscountModal(true)}
        >
          <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount</Text>
          <Text style={[styles.summaryValue, styles.discountValue]}>
            -{formatCurrency(discountAmount)}
          </Text>
        </TouchableOpacity>
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

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.holdButton}
          onPress={handleHoldOrder}
        >
          <Ionicons name="pause" size={20} color={colors.text} />
          <Text style={styles.holdButtonText}>Hold</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutButtonText}>Checkout - {formatCurrency(total)}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Discount Modal */}
      <Modal
        visible={showDiscountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDiscountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply Discount</Text>
            <View style={styles.discountTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.discountTypeButton,
                  discountType === 'fixed' && styles.discountTypeButtonActive,
                ]}
                onPress={() => setDiscountType('fixed')}
              >
                <Text style={[styles.discountTypeText, discountType === 'fixed' && styles.discountTypeTextActive]}>
                  Fixed (AED)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.discountTypeButton,
                  discountType === 'percentage' && styles.discountTypeButtonActive,
                ]}
                onPress={() => setDiscountType('percentage')}
              >
                <Text style={[styles.discountTypeText, discountType === 'percentage' && styles.discountTypeTextActive]}>
                  Percentage (%)
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.discountInput}
              placeholder={`Enter ${discountType === 'fixed' ? 'amount' : 'percentage'}`}
              placeholderTextColor={colors.textMuted}
              value={discountValue}
              onChangeText={setDiscountValue}
              keyboardType="decimal-pad"
            />
            {discountAmount > 0 && (
              <Text style={styles.currentDiscount}>
                Current discount: {formatCurrency(discountAmount)}
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDiscountModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={handleApplyDiscount}
              >
                <Text style={styles.modalApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}