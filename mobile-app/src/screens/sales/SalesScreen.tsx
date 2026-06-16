/**
 * DerpX POS - Sales Screen
 * Full sales management with order viewing, filtering, invoicing, reports
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Share, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/settingsStore';
import { usePosStore } from '../../store/posStore';
import { useCRMStore } from '../../store/crmStore';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../../utils';
import { UAE } from '../../constants';
import { darkColors, lightColors, spacing, borderRadius, typography } from '../../constants/theme';

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogoContainer: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: { width: 55, height: 55, borderRadius: 10 },
  headerBranding: { flexDirection: 'column', marginLeft: spacing.md },
  brandingRow1: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.accent },
  brandingRow2: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  exportButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, backgroundColor: colors.accent },
  exportText: { color: '#fff', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  filterButtonText: { color: colors.text, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  filterBar: { flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.sm },
  searchInput: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, height: 44, fontSize: typography.fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.border },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg, gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterChipText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  filterOptionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterOption: { flex: 1, minWidth: '30%', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  filterOptionActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterOptionText: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.medium },
  filterOptionTextActive: { color: '#fff' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { width: '48%', borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  statValue: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  statLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  statChange: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.success },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  quickAction: { alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flex: 1, marginHorizontal: spacing.xs },
  quickActionText: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: spacing.sm },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text },
  viewAll: { color: colors.accent, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  orderItem: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  orderNumber: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.text },
  orderCustomer: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  orderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.md },
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold },
  orderTotal: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.text },
  orderMeta: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  orderMetaText: { fontSize: typography.fontSize.xs, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%' },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  modalApplyButton: { backgroundColor: colors.accent, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  modalApplyText: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  detailValue: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.semibold },
  detailActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  detailButton: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  detailButtonText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: '#fff' },
  invoiceCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  invoiceLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  invoiceValue: { fontSize: typography.fontSize.md, color: colors.text, fontWeight: typography.fontWeight.bold },
  sectionLabel: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  lineItemName: { fontSize: typography.fontSize.sm, color: colors.text, flex: 2 },
  lineItemQty: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', flex: 1 },
  lineItemTotal: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: '600', textAlign: 'right', flex: 1 },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.md, backgroundColor: colors.backgroundSecondary },
  paymentBadgeActive: { backgroundColor: colors.success + '20' },
  paymentBadgeText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  paymentBadgeTextActive: { color: colors.success, fontWeight: typography.fontWeight.semibold },
  invoiceHeader: { alignItems: 'center', marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  invoiceLogo: { width: 64, height: 64, borderRadius: borderRadius.md, backgroundColor: colors.accent + '20', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  invoiceTitle: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.accent, marginBottom: spacing.xs },
  invoiceSubtitle: { fontSize: typography.fontSize.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  infoBlock: { flexDirection: 'row', marginBottom: spacing.md },
  infoBlockLeft: { flex: 1 },
  infoBlockRight: { flex: 1, alignItems: 'flex-end' },
  infoLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
  infoValue: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.semibold },
  tableHeader: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 2, borderBottomColor: colors.border, marginTop: spacing.md },
  tableHeaderText: { fontSize: typography.fontSize.xs, color: colors.textSecondary, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableCellName: { flex: 2, fontSize: typography.fontSize.sm, color: colors.text },
  tableCellQty: { flex: 1, fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  tableCellPrice: { flex: 1.5, fontSize: typography.fontSize.sm, color: colors.text, textAlign: 'right' },
  tableCellTotal: { flex: 1.5, fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.semibold, textAlign: 'right' },
  totalsSection: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  totalLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  totalValue: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: '600' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  grandTotalLabel: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.text },
  grandTotalValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.accent },
  statusActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  statusActionButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusActionText: { fontSize: typography.fontSize.xs, color: colors.text, fontWeight: typography.fontWeight.medium },
});

const STATUS_FILTERS = ['all', 'completed', 'pending', 'processing', 'cancelled', 'refunded'];
const PAYMENT_FILTERS = ['all', 'cash', 'card', 'bank_transfer', 'credit'];

const allOrders = [
  { id: '1', orderNumber: 'ORD-001', customer: 'Ahmed Ali', phone: '+971501234567', total: 245.00, subtotal: 233.33, vat: 11.67, status: 'completed', payment: 'cash', date: '2026-05-22', time: '14:32', items: [{ name: 'Cappuccino', qty: 2, price: 18.00 }, { name: 'Croissant', qty: 1, price: 12.00 }, { name: 'Club Sandwich', qty: 1, price: 35.00 }] },
  { id: '2', orderNumber: 'ORD-002', customer: 'Fatima Hassan', phone: '+971559876543', total: 189.50, subtotal: 180.48, vat: 9.02, status: 'pending', payment: 'card', date: '2026-05-22', time: '15:10', items: [{ name: 'Latte', qty: 1, price: 20.00 }, { name: 'Club Sandwich', qty: 1, price: 35.00 }, { name: 'Tiramisu', qty: 1, price: 32.00 }] },
  { id: '3', orderNumber: 'ORD-003', customer: 'Mohammed Omar', phone: '+971524567890', total: 567.00, subtotal: 540.00, vat: 27.00, status: 'completed', payment: 'card', date: '2026-05-21', time: '12:45', items: [{ name: 'Mixed Grill Platter', qty: 3, price: 145.00 }, { name: 'Fresh Juice', qty: 3, price: 18.00 }, { name: 'Hummus', qty: 2, price: 25.00 }] },
  { id: '4', orderNumber: 'ORD-004', customer: 'Layla Ahmed', phone: '+971563210987', total: 123.00, subtotal: 117.14, vat: 5.86, status: 'processing', payment: 'bank_transfer', date: '2026-05-21', time: '18:20', items: [{ name: 'Caesar Salad', qty: 1, price: 45.00 }, { name: 'Mango Smoothie', qty: 2, price: 22.00 }] },
  { id: '5', orderNumber: 'ORD-005', customer: 'Saeed Khalid', phone: '+971507890123', total: 890.00, subtotal: 847.62, vat: 42.38, status: 'completed', payment: 'credit', date: '2026-05-20', time: '20:15', items: [{ name: 'Seafood Platter', qty: 2, price: 200.00 }, { name: 'Grilled Lobster', qty: 1, price: 295.00 }, { name: 'Dessert Platter', qty: 3, price: 45.00 }] },
  { id: '6', orderNumber: 'ORD-006', customer: 'Noor Al Suwaidi', phone: '+971504567890', total: 345.00, subtotal: 328.57, vat: 16.43, status: 'cancelled', payment: 'cash', date: '2026-05-20', time: '11:30', items: [{ name: 'Burger Deluxe', qty: 2, price: 55.00 }, { name: 'Truffle Fries', qty: 2, price: 25.00 }, { name: 'Soft Drink', qty: 2, price: 8.00 }] },
  { id: '7', orderNumber: 'ORD-007', customer: 'Walk-in Customer', phone: '', total: 78.00, subtotal: 74.29, vat: 3.71, status: 'completed', payment: 'card', date: '2026-05-22', time: '09:15', items: [{ name: 'Espresso', qty: 2, price: 15.00 }, { name: 'Blueberry Muffin', qty: 2, price: 18.00 }] },
  { id: '8', orderNumber: 'ORD-008', customer: 'Khalid Al Mansouri', phone: '+971508765432', total: 456.00, subtotal: 434.29, vat: 21.71, status: 'completed', payment: 'credit', date: '2026-05-22', time: '16:45', items: [{ name: 'Steak', qty: 2, price: 150.00 }, { name: 'Red Wine', qty: 2, price: 48.00 }, { name: 'Caesar Salad', qty: 1, price: 45.00 }] },
  { id: '9', orderNumber: 'ORD-009', customer: 'Mariam Al Suwaidi', phone: '+971555555555', total: 210.00, subtotal: 200.00, vat: 10.00, status: 'refunded', payment: 'card', date: '2026-05-19', time: '13:00', items: [{ name: 'Pasta Carbonara', qty: 2, price: 65.00 }, { name: 'Garlic Bread', qty: 2, price: 15.00 }] },
];

export default function SalesScreen() {
  const { theme, businessTrn, businessLogo } = useSettingsStore();
  const { orders, getOrders } = usePosStore();
  const { customers } = useCRMStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // Convert orders to the format expected by the UI
  const allOrders = useMemo(() => {
    return orders.map((order) => {
      const customer = customers.find((c) => c.id === order.customerId);
      const createdAt = new Date(order.createdAt);
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: customer?.name || 'Walk-in Customer',
        customerPhone: customer?.phone || '',
        status: order.status,
        payment: 'paid',
        total: order.total,
        subtotal: order.subtotal,
        vat: order.vatAmount,
        date: createdAt.toISOString().split('T')[0],
        time: createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dateTime: createdAt.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: order.items.map((item) => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
          total: item.total,
        })),
      };
    });
  }, [orders, customers]);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((o: any) => {
      const ms = searchQuery ? (o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase())) : true;
      const ss = statusFilter !== 'all' ? o.status === statusFilter : true;
      const ps = paymentFilter !== 'all' ? o.payment === paymentFilter : true;
      const cs = customerFilter ? o.customer.toLowerCase().includes(customerFilter.toLowerCase()) : true;
      const df = dateFrom ? o.date >= dateFrom : true;
      const dt = dateTo ? o.date <= dateTo : true;
      const ds = df && dt;
      return ms && ss && ps && cs && ds;
    });
  }, [searchQuery, statusFilter, paymentFilter, customerFilter, dateFrom, dateTo, allOrders]);

  const getStatusColor = (status: string) => {
    switch (status) { case 'completed': return colors.success; case 'pending': return colors.warning; case 'processing': return colors.primary; case 'cancelled': return colors.error; case 'refunded': return colors.purple; default: return colors.textSecondary; }
  };

  const generateInvoice = (order: any) => {
    setInvoiceData(order);
    setShowOrderDetail(null);
    setShowInvoice(true);
  };

  const shareInvoice = async () => {
    if (!invoiceData) return;
    const msg = `[FTA TAX INVOICE]\nDerpX POS - Dubai, UAE\nTRN: 123-456-789-012-345\nInvoice: INV-${invoiceData.orderNumber}\nDate: ${invoiceData.date}\nCustomer: ${invoiceData.customer}\n\nItems:\n${invoiceData.items.map((i: any) => `${i.name} x${i.qty} - ${formatCurrency(i.price * i.qty)}`).join('\n')}\n\nSubtotal: ${formatCurrency(invoiceData.subtotal)}\nVAT (5%): ${formatCurrency(invoiceData.vat)}\nTotal: ${formatCurrency(invoiceData.total)}\n\nThank you for your business!`;
    await Share.share({ message: msg, title: `Invoice - ${invoiceData.orderNumber}` });
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    Alert.alert(`Update Status`, `Change order status to "${newStatus}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => Alert.alert('Updated', `Order status changed to "${newStatus}"`) },
    ]);
  };

  const activeFilters = [...(statusFilter !== 'all' ? [statusFilter] : []), ...(paymentFilter !== 'all' ? [paymentFilter] : [])];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoContainer}>
            {businessLogo ? (
              <Image source={{ uri: businessLogo }} style={styles.headerLogo} resizeMode="contain" />
            ) : (
              <Ionicons name="cube" size={28} color={colors.accent} />
            )}
          </View>
          <View style={styles.headerBranding}>
            <Text style={styles.brandingRow1}>DerpX Ai</Text>
            <Text style={styles.brandingRow2}>MOBILE</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="funnel-outline" size={16} color={colors.text} />
            <Text style={styles.filterButtonText}>Filter{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton}><Ionicons name="download-outline" size={18} color="#fff" /><Text style={styles.exportText}>Export</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterBar}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
        <TextInput style={[styles.searchInput, { paddingLeft: 40 }]} placeholder="Search orders or customers..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {activeFilters.length > 0 && (
        <View style={styles.filterChips}>
          {statusFilter !== 'all' && <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]} onPress={() => setStatusFilter('all')}><Text style={[styles.filterChipText, styles.filterChipTextActive]}>Status: {statusFilter}</Text></TouchableOpacity>}
          {paymentFilter !== 'all' && <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]} onPress={() => setPaymentFilter('all')}><Text style={[styles.filterChipText, styles.filterChipTextActive]}>Payment: {paymentFilter}</Text></TouchableOpacity>}
          <TouchableOpacity onPress={() => { setStatusFilter('all'); setPaymentFilter('all'); }}><Text style={{ color: colors.accent, fontSize: typography.fontSize.xs, paddingVertical: spacing.xs }}>Clear</Text></TouchableOpacity>
        </View>
      )}

      <View style={styles.statsGrid}>
        {[
          { label: 'Today', value: formatCurrency(2450), change: '+12%', icon: 'calendar' as const },
          { label: 'This Week', value: formatCurrency(15280), change: '+8%', icon: 'calendar' as const },
          { label: 'This Month', value: formatCurrency(68500), change: '+15%', icon: 'calendar' as const },
          { label: 'Total Orders', value: '1,234', change: '+5%', icon: 'cart' as const },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <View style={styles.statHeader}><Ionicons name={stat.icon} size={24} color={colors.accent} /><Text style={[styles.statChange, { color: colors.success }]}>{stat.change}</Text></View>
            <Text style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        {[{ icon: 'receipt' as const, label: 'Invoices' }, { icon: 'people' as const, label: 'Customers' }, { icon: 'trending-up' as const, label: 'Reports' }].map((a, i) => (
          <TouchableOpacity key={i} style={styles.quickAction} onPress={() => {
            if (a.label === 'Invoices') {
              const lastCompleted = allOrders.find(o => o.status === 'completed');
              if (lastCompleted) { setInvoiceData(lastCompleted); setShowInvoice(true); }
              else { Alert.alert('No Orders', 'No completed orders to invoice.'); }
            }
            if (a.label === 'Customers') navigation.navigate('CRM' as never);
            if (a.label === 'Reports') Alert.alert('Reports', 'Coming soon: PDF/Excel export of sales reports');
          }}>
            <Ionicons name={a.icon} size={24} color={colors.accent} /><Text style={styles.quickActionText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Text style={[styles.viewAll, { color: colors.textMuted }]}>{filteredOrders.length} orders</Text>
        </View>
        {filteredOrders.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing['3xl'] }}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: spacing.md, fontSize: typography.fontSize.md }}>No orders match your filters</Text>
            {(statusFilter !== 'all' || paymentFilter !== 'all') && (
              <TouchableOpacity onPress={() => { setStatusFilter('all'); setPaymentFilter('all'); }} style={{ marginTop: spacing.md }}>
                <Text style={{ color: colors.accent, fontSize: typography.fontSize.sm }}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : filteredOrders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderItem} onPress={() => setShowOrderDetail(order)} activeOpacity={0.7}>
            <View style={styles.orderTop}>
              <View>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.orderCustomer}>{order.customer}</Text>
              </View>
              <View style={styles.orderRight}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                </View>
                <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </View>
            <View style={styles.orderMeta}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <Text style={styles.orderMetaText}>{order.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={styles.orderMetaText}>{order.time}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name="cube-outline" size={12} color={colors.textMuted} />
                <Text style={styles.orderMetaText}>{order.items.length} items</Text>
              </View>
              <View style={[styles.paymentBadge, order.payment === 'cash' && styles.paymentBadgeActive]}>
                <Ionicons name={order.payment === 'cash' ? 'cash-outline' : order.payment === 'card' ? 'card-outline' : 'business-outline'} size={12} color={order.payment === 'cash' ? colors.success : colors.textMuted} />
                <Text style={[styles.paymentBadgeText, order.payment === 'cash' && styles.paymentBadgeTextActive]}>{order.payment === 'bank_transfer' ? 'Bank Transfer' : order.payment}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Orders</Text>
            <Text style={[styles.sectionTitle, { marginTop: spacing.md, marginBottom: spacing.sm }]}>Status</Text>
            <View style={styles.filterOptionsGrid}>{STATUS_FILTERS.map(s => (
              <TouchableOpacity key={s} style={[styles.filterOption, statusFilter === s && styles.filterOptionActive]} onPress={() => setStatusFilter(s)}>
                <Text style={[styles.filterOptionText, statusFilter === s && styles.filterOptionTextActive]}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </TouchableOpacity>
            ))}</View>
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>Payment</Text>
            <View style={styles.filterOptionsGrid}>{PAYMENT_FILTERS.map(m => (
              <TouchableOpacity key={m} style={[styles.filterOption, paymentFilter === m && styles.filterOptionActive]} onPress={() => setPaymentFilter(m)}>
                <Text style={[styles.filterOptionText, paymentFilter === m && styles.filterOptionTextActive]}>{m === 'all' ? 'All' : m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
              </TouchableOpacity>
            ))}</View>
            <TouchableOpacity style={styles.modalApplyButton} onPress={() => setShowFilterModal(false)}><Text style={styles.modalApplyText}>Apply</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Order Detail Modal - Enhanced */}
      <Modal visible={!!showOrderDetail} transparent animationType="slide" onRequestClose={() => setShowOrderDetail(null)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            {showOrderDetail && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                  <View>
                    <Text style={styles.modalTitle}>{showOrderDetail.orderNumber}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>{showOrderDetail.date} at {showOrderDetail.time}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowOrderDetail(null)} style={{ padding: spacing.sm }}>
                    <Ionicons name="close" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Customer Info */}
                <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md }}>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Customer</Text><Text style={styles.detailValue}>{showOrderDetail.customer}</Text></View>
                  {showOrderDetail.phone && <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone</Text><Text style={styles.detailValue}>{showOrderDetail.phone}</Text></View>}
                </View>

                {/* Status & Payment */}
                <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
                  <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md }}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(showOrderDetail.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(showOrderDetail.status) }]}>{showOrderDetail.status}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md }}>
                    <Text style={styles.detailLabel}>Payment</Text>
                    <Text style={[styles.detailValue, { marginTop: spacing.xs, textTransform: 'capitalize' }]}>{showOrderDetail.payment === 'bank_transfer' ? 'Bank Transfer' : showOrderDetail.payment}</Text>
                  </View>
                </View>

                {/* Order Items */}
                <Text style={[styles.sectionTitle, { fontSize: typography.fontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm }]}>Order Items</Text>
                {showOrderDetail.items.map((item: any, i: number) => (
                  <View key={i} style={[styles.lineItem, { paddingVertical: spacing.sm }]}>
                    <View style={{ flex: 2 }}>
                      <Text style={[styles.lineItemName, { fontSize: typography.fontSize.sm }]}>{item.name}</Text>
                      <Text style={{ fontSize: typography.fontSize.xs, color: colors.textMuted }}>{formatCurrency(item.price)} each</Text>
                    </View>
                    <Text style={[styles.lineItemQty, { fontSize: typography.fontSize.sm }]}>x{item.qty}</Text>
                    <Text style={[styles.lineItemTotal, { fontSize: typography.fontSize.sm }]}>{formatCurrency(item.price * item.qty)}</Text>
                  </View>
                ))}

                {/* Totals */}
                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md }}>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Subtotal</Text><Text style={styles.detailValue}>{formatCurrency(showOrderDetail.subtotal)}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>VAT (5%)</Text><Text style={styles.detailValue}>{formatCurrency(showOrderDetail.vat)}</Text></View>
                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}><Text style={[styles.detailLabel, { fontWeight: 'bold', fontSize: typography.fontSize.md }]}>Total</Text><Text style={[styles.detailValue, { fontWeight: 'bold', fontSize: typography.fontSize.lg, color: colors.accent }]}>{formatCurrency(showOrderDetail.total)}</Text></View>
                </View>

                {/* Status Management Actions */}
                <Text style={[styles.sectionTitle, { fontSize: typography.fontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm }]}>Manage Order</Text>
                <View style={styles.statusActions}>
                  {showOrderDetail.status !== 'completed' && showOrderDetail.status !== 'cancelled' && (
                    <TouchableOpacity style={[styles.statusActionButton, { borderColor: colors.success }]} onPress={() => handleStatusUpdate(showOrderDetail.id, 'completed')}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={[styles.statusActionText, { color: colors.success }]}>Mark Complete</Text>
                    </TouchableOpacity>
                  )}
                  {showOrderDetail.status !== 'cancelled' && showOrderDetail.status !== 'completed' && (
                    <TouchableOpacity style={[styles.statusActionButton, { borderColor: colors.error }]} onPress={() => handleStatusUpdate(showOrderDetail.id, 'cancelled')}>
                      <Ionicons name="close-circle" size={16} color={colors.error} />
                      <Text style={[styles.statusActionText, { color: colors.error }]}>Cancel Order</Text>
                    </TouchableOpacity>
                  )}
                  {showOrderDetail.status === 'completed' && (
                    <TouchableOpacity style={[styles.statusActionButton, { borderColor: colors.purple }]} onPress={() => handleStatusUpdate(showOrderDetail.id, 'refunded')}>
                      <Ionicons name="refresh-circle" size={16} color={colors.purple} />
                      <Text style={[styles.statusActionText, { color: colors.purple }]}>Refund</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={[styles.detailActions, { marginTop: spacing.lg }]}>
                  <TouchableOpacity style={[styles.detailButton, { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border }]} onPress={() => setShowOrderDetail(null)}>
                    <Text style={[styles.detailButtonText, { color: colors.text }]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.detailButton, { backgroundColor: colors.accent }]} onPress={() => generateInvoice(showOrderDetail)}>
                    <Ionicons name="receipt-outline" size={18} color="#fff" style={{ marginRight: spacing.xs }} />
                    <Text style={styles.detailButtonText}>Invoice</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.detailButton, { backgroundColor: colors.primary }]} onPress={() => Alert.alert('Email Invoice', `Invoice for ${showOrderDetail.orderNumber} will be sent.`)}>
                    <Ionicons name="mail-outline" size={18} color="#fff" style={{ marginRight: spacing.xs }} />
                    <Text style={styles.detailButtonText}>Email</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Invoice Modal - FTA Compliant */}
      <Modal visible={showInvoice} transparent animationType="slide" onRequestClose={() => setShowInvoice(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            {invoiceData && (
              <>
                {/* Invoice Header */}
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceLogo}>
                    <Ionicons name="receipt" size={32} color={colors.accent} />
                  </View>
                  <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
                  <Text style={styles.invoiceSubtitle}>FTA Compliant • UAE VAT</Text>
                </View>

                {/* Business Info */}
                <View style={styles.infoBlock}>
                  <View style={styles.infoBlockLeft}>
                    <Text style={[styles.infoLabel, { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.text }]}>DerpX POS</Text>
                    <Text style={styles.infoLabel}>Dubai, United Arab Emirates</Text>
                    <Text style={styles.infoLabel}>TRN: 123-456-789-012-345</Text>
                  </View>
                  <View style={styles.infoBlockRight}>
                    <Text style={styles.infoLabel}>Invoice #</Text>
                    <Text style={styles.infoValue}>INV-{invoiceData.orderNumber}</Text>
                    <Text style={[styles.infoLabel, { marginTop: spacing.sm }]}>Date</Text>
                    <Text style={styles.infoValue}>{invoiceData.date}</Text>
                  </View>
                </View>

                {/* Customer Info */}
                <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md }}>
                  <Text style={[styles.infoLabel, { fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.xs }]}>Bill To:</Text>
                  <Text style={styles.infoValue}>{invoiceData.customer}</Text>
                  {invoiceData.phone && <Text style={styles.infoLabel}>{invoiceData.phone}</Text>}
                </View>

                {/* Items Table */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Price</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Total</Text>
                </View>
                {invoiceData.items?.map((item: any, i: number) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.tableCellName, { flex: 2 }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[styles.tableCellQty, { flex: 1 }]}>{item.qty}</Text>
                    <Text style={[styles.tableCellPrice, { flex: 1.5 }]}>{formatCurrency(item.price)}</Text>
                    <Text style={[styles.tableCellTotal, { flex: 1.5 }]}>{formatCurrency(item.price * item.qty)}</Text>
                  </View>
                ))}

                {/* Totals */}
                <View style={styles.totalsSection}>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{formatCurrency(invoiceData.subtotal)}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>VAT (5%)</Text><Text style={styles.totalValue}>{formatCurrency(invoiceData.vat)}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>VAT Registration</Text><Text style={[styles.totalValue, { fontSize: typography.fontSize.xs, color: colors.textMuted }]}>123-456-789-012-345</Text></View>
                  <View style={styles.grandTotalRow}><Text style={styles.grandTotalLabel}>Total Due</Text><Text style={styles.grandTotalValue}>{formatCurrency(invoiceData.total)}</Text></View>
                </View>

                {/* Payment Info */}
                <View style={{ marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>Payment Method</Text><Text style={[styles.totalValue, { textTransform: 'capitalize' }]}>{invoiceData.payment === 'bank_transfer' ? 'Bank Transfer' : invoiceData.payment}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>Payment Status</Text><Text style={[styles.totalValue, { color: invoiceData.status === 'completed' ? colors.success : colors.warning }]}>{invoiceData.status === 'completed' ? 'Paid' : invoiceData.status}</Text></View>
                </View>

                {/* Footer */}
                <View style={{ alignItems: 'center', marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ fontSize: typography.fontSize.xs, color: colors.textMuted, textAlign: 'center' }}>Thank you for your business!</Text>
                  <Text style={{ fontSize: typography.fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }}>This is a computer-generated invoice. No signature required.</Text>
                </View>

                {/* Actions */}
                <View style={[styles.detailActions, { marginTop: spacing.xl }]}>
                  <TouchableOpacity style={[styles.detailButton, { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border }]} onPress={() => setShowInvoice(false)}>
                    <Text style={[styles.detailButtonText, { color: colors.text }]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.detailButton, { backgroundColor: colors.accent }]} onPress={shareInvoice}>
                    <Ionicons name="share-outline" size={18} color="#fff" style={{ marginRight: spacing.xs }} />
                    <Text style={styles.detailButtonText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.detailButton, { backgroundColor: colors.primary }]} onPress={() => Alert.alert('Download', 'Invoice PDF download coming soon.')}>
                    <Ionicons name="download-outline" size={18} color="#fff" style={{ marginRight: spacing.xs }} />
                    <Text style={styles.detailButtonText}>PDF</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}