/**
 * DerpX POS - CRM Screen
 * Full customer management with CRUD, import/export, detail view
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Share,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/settingsStore';
import { useCRMStore } from '../../store/crmStore';
import { usePosStore } from '../../store/posStore';
import { Customer } from '@/types';
import { formatCurrency, formatPhoneNumber } from '../../utils';
import { darkColors, lightColors, spacing, borderRadius, typography } from '../../constants/theme';

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
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
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, gap: spacing.xs },
  addButtonText: { color: '#fff', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, marginHorizontal: spacing.lg, marginBottom: spacing.md, paddingHorizontal: spacing.md, height: 48, borderWidth: 1, borderColor: colors.border },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.fontSize.md, color: colors.text },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text },
  statLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  listContent: { padding: spacing.lg },
  customerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  customerAvatar: { width: 50, height: 50, borderRadius: borderRadius.full, backgroundColor: colors.accent + '20', justifyContent: 'center', alignItems: 'center' },
  customerInitials: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.accent },
  customerInfo: { flex: 1, marginLeft: spacing.md },
  customerName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text },
  customerPhone: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  customerStats: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyText: { color: colors.textMuted, fontSize: typography.fontSize.md, marginTop: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%' },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  input: { backgroundColor: colors.input, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typography.fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder, marginBottom: spacing.md },
  textArea: { backgroundColor: colors.input, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typography.fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder, marginBottom: spacing.md, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalButton: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  modalCancel: { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text },
  modalSave: { backgroundColor: colors.accent },
  modalSaveText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: '#fff' },
  modalDelete: { backgroundColor: colors.error },
  modalDeleteText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: '#fff' },
  detailRow: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary, width: 100 },
  detailValue: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.semibold, flex: 1 },
  detailActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  locationPickerButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent + '15', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.accent + '30' },
  locationPickerText: { fontSize: typography.fontSize.sm, color: colors.accent, fontWeight: typography.fontWeight.medium, flex: 1 },
});

export default function CRMScreen() {
  const { theme, businessLogo } = useSettingsStore();
  const { orders, getOrdersByCustomer } = usePosStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);
  const { customers, addCustomer, updateCustomer, deleteCustomer, exportCustomers } = useCRMStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({ name: '', phone: '', whatsappNumber: '', email: '', trn: '', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.whatsappNumber?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => setFormData({ name: '', phone: '', whatsappNumber: '', email: '', trn: '', notes: '' });

  const handleAdd = () => { resetForm(); setEditingId(null); setShowModal(true); };

  const handleEdit = (c: Customer) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      phone: c.phone || '',
      whatsappNumber: c.whatsappNumber || '',
      email: c.email || '',
      trn: c.trn || '',
      notes: c.notes || ''
    });
    setShowModal(true);
  };

  const handlePickLocation = async () => {
    try {
      Alert.prompt(
        'Enter Coordinates',
        'Enter latitude and longitude (e.g., 25.2048,55.2708)',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: (coords) => {
              if (coords) {
                const [lat, lng] = coords.split(',').map((n: string) => parseFloat(n.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                  setFormData({ ...formData, latitude: lat, longitude: lng });
                  Alert.alert('Success', `Location set: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                } else {
                  Alert.alert('Error', 'Invalid coordinates format');
                }
              }
            }
          }
        ],
        formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : '',
      );
    } catch (error) {
      Alert.alert('Error', 'Could not pick location');
    }
  };

  const handleSave = () => {
    if (!formData.name?.trim()) { Alert.alert('Error', 'Name is required'); return; }
    if (editingId) {
      updateCustomer(editingId, formData);
      Alert.alert('Updated', 'Customer updated successfully');
    } else {
      addCustomer({
        name: formData.name,
        phone: formData.phone || '',
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        trn: formData.trn,
        notes: formData.notes,
        type: 'individual',
        loyaltyPoints: 0,
        totalSpent: 0,
        totalOrders: 0,
        outstandingBalance: 0,
        isActive: true
      });
      Alert.alert('Added', 'Customer added successfully');
    }
    setShowModal(false);
    setShowDetail(false);
  };

  const handleDelete = (c: Customer) => {
    Alert.alert('Delete Customer', `Remove ${c.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteCustomer(c.id); setShowDetail(false); } },
    ]);
  };

  const handleExport = async () => {
    const data = exportCustomers();
    const json = JSON.stringify(data, null, 2);
    await Share.share({ message: json, title: 'Customers Export' });
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={styles.customerCard} onPress={() => { setSelectedCustomer(item); setShowDetail(true); }}>
      <View style={styles.customerAvatar}>
        <Text style={styles.customerInitials}>{item.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Text>
      </View>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerPhone}>{formatPhoneNumber(item.phone || '')}</Text>
        <View style={styles.customerStats}>
          <View style={styles.stat}><Ionicons name="cart-outline" size={14} color={colors.textMuted} /><Text style={styles.statText}>{item.totalOrders} orders</Text></View>
          <View style={styles.stat}><Ionicons name="cash-outline" size={14} color={colors.textMuted} /><Text style={styles.statText}>{formatCurrency(item.totalSpent)}</Text></View>
          <View style={styles.stat}><Ionicons name="star-outline" size={14} color={colors.warning} /><Text style={[styles.statText, { color: colors.warning }]}>{item.loyaltyPoints} pts</Text></View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
          <TouchableOpacity onPress={handleExport} style={{ padding: spacing.sm }}><Ionicons name="download-outline" size={22} color={colors.text} /></TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Ionicons name="add" size={20} color="#fff" /><Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search by name, phone or email" placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></TouchableOpacity>}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statValue}>{customers.length}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{customers.filter(c => c.totalSpent > 5000).length}</Text><Text style={styles.statLabel}>VIP</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{customers.reduce((s, c) => s + c.loyaltyPoints, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Points</Text></View>
      </View>

      <FlatList data={filteredCustomers} renderItem={renderCustomer} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.emptyContainer}><Ionicons name="people-outline" size={64} color={colors.textMuted} /><Text style={styles.emptyText}>No customers found</Text></View>}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Customer' : 'Add Customer'}</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Full Name *" placeholderTextColor={colors.textMuted} value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} />
              <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={colors.textMuted} value={formData.phone} onChangeText={(v) => setFormData({ ...formData, phone: v })} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="WhatsApp Number (with country code)" placeholderTextColor={colors.textMuted} value={formData.whatsappNumber} onChangeText={(v) => setFormData({ ...formData, whatsappNumber: v })} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={formData.email} onChangeText={(v) => setFormData({ ...formData, email: v })} keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="TRN (Tax Registration Number)" placeholderTextColor={colors.textMuted} value={formData.trn} onChangeText={(v) => setFormData({ ...formData, trn: v })} />
              <TouchableOpacity style={styles.locationPickerButton} onPress={handlePickLocation}>
                <Ionicons name="location-outline" size={20} color={colors.accent} />
                <Text style={styles.locationPickerText}>
                  {formData.latitude && formData.longitude
                    ? `Location: ${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                    : 'Pick Map Location'}
                </Text>
              </TouchableOpacity>
              <TextInput style={styles.textArea} placeholder="Notes" placeholderTextColor={colors.textMuted} value={formData.notes} onChangeText={(v) => setFormData({ ...formData, notes: v })} multiline />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setShowModal(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalSave]} onPress={handleSave}><Text style={styles.modalSaveText}>{editingId ? 'Update' : 'Add'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail View Modal */}
      <Modal visible={showDetail} transparent animationType="slide" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCustomer && (
              <>
                <Text style={styles.modalTitle}>{selectedCustomer.name}</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone</Text><Text style={styles.detailValue}>{selectedCustomer.phone || '-'}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Email</Text><Text style={styles.detailValue}>{selectedCustomer.email || '-'}</Text></View>
                {selectedCustomer.trn && <View style={styles.detailRow}><Text style={styles.detailLabel}>TRN</Text><Text style={styles.detailValue}>{selectedCustomer.trn}</Text></View>}
                {selectedCustomer.whatsappNumber && <View style={styles.detailRow}><Text style={styles.detailLabel}>WhatsApp</Text><Text style={styles.detailValue}>{selectedCustomer.whatsappNumber}</Text></View>}
                {selectedCustomer.notes && <View style={styles.detailRow}><Text style={styles.detailLabel}>Notes</Text><Text style={styles.detailValue}>{selectedCustomer.notes}</Text></View>}
                <Text style={styles.sectionTitle}>Stats</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Total Spent</Text><Text style={styles.detailValue}>{formatCurrency(selectedCustomer.totalSpent)}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Orders</Text><Text style={styles.detailValue}>{selectedCustomer.totalOrders}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Loyalty Pts</Text><Text style={styles.detailValue}>{selectedCustomer.loyaltyPoints}</Text></View>
                
                {/* Customer Orders */}
                <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Order History</Text>
                {getOrdersByCustomer(selectedCustomer.id).length > 0 ? (
                  getOrdersByCustomer(selectedCustomer.id).slice(0, 5).map((order) => (
                    <View key={order.id} style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start', paddingVertical: spacing.sm }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: spacing.xs }}>
                        <Text style={[styles.detailValue, { fontWeight: typography.fontWeight.bold }]}>{order.orderNumber}</Text>
                        <Text style={[{ fontSize: typography.fontSize.xs, color: colors.success, fontWeight: typography.fontWeight.semibold }]}>{order.status}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <Text style={styles.detailLabel}>{order.createdAt.toLocaleDateString()}</Text>
                        <Text style={styles.detailValue}>{formatCurrency(order.total)}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                    <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
                    <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.sm, marginTop: spacing.sm }}>No orders yet</Text>
                  </View>
                )}
                
                <View style={styles.detailActions}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setShowDetail(false)}><Text style={styles.modalCancelText}>Close</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalSave]} onPress={() => handleEdit(selectedCustomer)}><Text style={styles.modalSaveText}>Edit</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalDelete]} onPress={() => handleDelete(selectedCustomer)}><Text style={styles.modalDeleteText}>Delete</Text></TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
