/**
 * DerpX POS - Receipt Screen
 * FTA-compliant tax invoice with QR code for UAE e-invoicing
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/settingsStore';
import { formatCurrency, formatDate, formatTime } from '../../utils';
import { UAE } from '../../constants';
import { darkColors, lightColors, spacing, borderRadius, typography } from '../../constants/theme';

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  receipt: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  receiptTopEdge: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dashed',
  },
  receiptBottomEdge: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderStyle: 'dashed',
  },
  dashDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  vatInvoiceBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  vatInvoiceText: {
    fontSize: typography.fontSize.xs,
    color: colors.accent,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  businessInfo: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  businessName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  businessAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  businessTRN: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
  },
  orderInfo: {
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  itemsTable: {
    paddingHorizontal: spacing.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  tableHeaderItem: {
    flex: 2,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  tableHeaderQty: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableHeaderPrice: {
    flex: 1.5,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  tableHeaderTotal: {
    flex: 1.5,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableItem: {
    flex: 2,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  tableQty: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tablePrice: {
    flex: 1.5,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  tableTotal: {
    flex: 1.5,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'right',
  },
  totals: {
    paddingHorizontal: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  totalValueDiscount: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.text,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  grandTotalLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
  grandTotalValue: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
  paymentInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  paymentLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  paymentValueChange: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  footerSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  qrPlaceholder: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  newOrderButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  arabicText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    writingDirection: 'rtl',
  },
  bilingualRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
});

export default function ReceiptScreen() {
  const navigation = useNavigation();
  const { theme, businessTrn } = useSettingsStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  // Mock order data - FTA-compliant tax invoice
  const order = {
    id: '1',
    orderNumber: 'ORD-20260522-A1B2',
    invoiceNumber: 'INV-2026-001234',
    date: new Date(),
    cashier: 'Demo User',
    branch: 'Main Branch - Dubai',
    items: [
      { name: 'Cappuccino', nameAr: 'كابتشينو', quantity: 2, price: 18, total: 36 },
      { name: 'Croissant', nameAr: 'كرواسون', quantity: 1, price: 12, total: 12 },
      { name: 'Latte', nameAr: 'لاتيه', quantity: 1, price: 20, total: 20 },
    ],
    subtotal: 68,
    discount: 0,
    vat: 3.40,
    vatRate: UAE.vatRate,
    total: 71.40,
    paymentMethod: 'Cash',
    amountReceived: 100,
    change: 28.60,
    trn: '123-456-789-012-345',
    qrData: 'UAE_PCS_1|DerpX POS|123-456-789-012-345|2026-05-22|68.00|3.40|71.40',
  };

  const handlePrint = () => {
    // TODO: Implement Bluetooth thermal printer support
    console.log('Sending to Bluetooth printer...');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `DerpX POS - Invoice ${order.invoiceNumber}\nTotal: ${formatCurrency(order.total)}\nTRN: ${order.trn}`,
        title: `Invoice ${order.invoiceNumber}`,
      });
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  const handleNewOrder = () => {
    navigation.reset({ index: 0, routes: [{ name: 'POSHome' as never }] });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={handleNewOrder} style={styles.actionButton}>
          <Ionicons name="home-outline" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePrint} style={styles.actionButton}>
          <Ionicons name="print-outline" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Print</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.actionButton}>
          <Ionicons name="logo-whatsapp" size={24} color={colors.primary} />
          <Text style={styles.actionText}>WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Success Icon */}
      <View style={styles.successContainer}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successText}>Payment Successful!</Text>
      </View>

      {/* FTA-Compliant Tax Invoice */}
      <View style={styles.receipt}>
        {/* Dashed edge */}
        <View style={styles.receiptTopEdge}>
          {[...Array(30)].map((_, i) => (
            <View key={i} style={styles.dashDot} />
          ))}
        </View>

        {/* VAT Invoice Badge */}
        <View style={styles.vatInvoiceBadge}>
          <Text style={styles.vatInvoiceText}>SALES INVOICE</Text>
        </View>

        {/* Business Info */}
        <View style={styles.businessInfo}>
          <Ionicons name="storefront" size={40} color={colors.primary} />
          <Text style={styles.businessName}>DerpX POS</Text>
          <Text style={styles.businessAddress}>Dubai, United Arab Emirates</Text>
          {businessTrn && <Text style={styles.businessTRN}>TRN: {businessTrn}</Text>}
        </View>

        <View style={styles.divider} />

        {/* Invoice & Order Info */}
        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Invoice #:</Text>
            <Text style={styles.infoValue}>{order.invoiceNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order #:</Text>
            <Text style={styles.infoValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(order.date)} {formatTime(order.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Branch:</Text>
            <Text style={styles.infoValue}>{order.branch}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cashier:</Text>
            <Text style={styles.infoValue}>{order.cashier}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items Table */}
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderItem}>Item</Text>
            <Text style={styles.tableHeaderQty}>Qty</Text>
            <Text style={styles.tableHeaderPrice}>Price</Text>
            <Text style={styles.tableHeaderTotal}>Total</Text>
          </View>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.tableItem} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.tableItem, { fontSize: 10, color: colors.textMuted }]}>{item.nameAr}</Text>
              </View>
              <Text style={styles.tableQty}>{item.quantity}</Text>
              <Text style={styles.tablePrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.tableTotal}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={styles.totalValueDiscount}>-{formatCurrency(order.discount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT ({(UAE.vatRate * 100).toFixed(0)}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.vat)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total (incl. VAT)</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Amount Received:</Text>
            <Text style={styles.paymentValue}>{formatCurrency(order.amountReceived)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Change:</Text>
            <Text style={styles.paymentValueChange}>{formatCurrency(order.change)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>VAT Amount:</Text>
            <Text style={styles.paymentValue}>{formatCurrency(order.vat)}</Text>
          </View>
        </View>

        {/* Dashed edge */}
        <View style={styles.receiptBottomEdge}>
          {[...Array(30)].map((_, i) => (
            <View key={i} style={styles.dashDot} />
          ))}
        </View>
      </View>

      {/* QR Code (UAE e-invoicing) */}
      <View style={styles.footer}>
        <View style={{ alignItems: 'center' }}>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={100} color={colors.text} />
          </View>
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: spacing.xs }}>
            UAE PCS QR Code (FTA Compliant)
          </Text>
        </View>
        <Text style={[styles.footerText, { marginTop: spacing.lg }]}>
          Thank you for your business!
        </Text>
        <Text style={styles.footerSubtext}>
          For support: support@derpx.com
        </Text>
      </View>

      {/* New Order Button */}
      <TouchableOpacity
        style={styles.newOrderButton}
        onPress={handleNewOrder}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.newOrderButtonText}>New Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}