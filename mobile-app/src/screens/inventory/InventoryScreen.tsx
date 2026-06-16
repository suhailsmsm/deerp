/**
 * DerpX POS - Inventory Screen
 * Product/stock management synced with POS products
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, Alert, ScrollView, Share, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSettingsStore } from '../../store/settingsStore';
import { usePosStore } from '../../store/posStore';
import { formatCurrency } from '../../utils';
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
  searchInput: { flex: 1, fontSize: typography.fontSize.md, color: colors.text },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterChipText: { fontSize: typography.fontSize.sm, color: colors.text, marginLeft: spacing.xs },
  filterChipTextActive: { color: '#fff', fontWeight: typography.fontWeight.semibold },
  listContent: { padding: spacing.lg },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  productImage: { width: 60, height: 60, borderRadius: borderRadius.md, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  productInfo: { flex: 1 },
  productName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  productSku: { fontSize: typography.fontSize.xs, color: colors.textMuted, marginBottom: spacing.xs },
  productStats: { flexDirection: 'row', gap: spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statText: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  stockIndicator: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, backgroundColor: colors.success + '20' },
  stockIndicatorLow: { backgroundColor: colors.warning + '20' },
  stockIndicatorOut: { backgroundColor: colors.error + '20' },
  stockText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyText: { color: colors.textMuted, fontSize: typography.fontSize.md, marginTop: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '85%' },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  input: { backgroundColor: colors.input, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typography.fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder, marginBottom: spacing.md },
  inputHalf: { flex: 1, backgroundColor: colors.input, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typography.fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.inputBorder, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalButton: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  modalCancel: { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text },
  modalSave: { backgroundColor: colors.accent },
  modalSaveText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: '#fff' },
  modalDelete: { backgroundColor: colors.error },
  modalDeleteText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: '#fff' },
  detailRow: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary, width: 80 },
  detailValue: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.semibold, flex: 1 },
  stockAdjustmentSection: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  stockAdjustmentTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text, marginBottom: spacing.md },
  adjustmentButtons: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  adjustmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.backgroundSecondary, gap: spacing.xs },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  detailActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});

export default function InventoryScreen() {
  const { theme, businessLogo } = useSettingsStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);
  const { products, loadProducts, loadCategories } = usePosStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'low' | 'out'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', price: '', cost: '', stock: '', minStock: '', unit: 'pcs', description: '', image: '' });
  const [stockAdjustment, setStockAdjustment] = useState(0);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const filteredProducts = products.filter((p) => {
    const ms = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === 'low') return ms && p.stock > 0 && p.stock <= 10;
    if (selectedFilter === 'out') return ms && p.stock === 0;
    return ms;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', cls: styles.stockIndicatorOut, color: colors.error };
    if (stock <= 10) return { label: `Low: ${stock}`, cls: styles.stockIndicatorLow, color: colors.warning };
    return { label: `In Stock: ${stock}`, cls: styles.stockIndicator, color: colors.success };
  };

  const resetForm = () => setForm({ name: '', sku: '', category: '', price: '', cost: '', stock: '', minStock: '', unit: 'pcs', description: '', image: '' });

  const handleAdd = () => { resetForm(); setEditingId(null); setShowModal(true); };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.categoryId || '',
      price: product.basePrice.toString(),
      cost: product.costPrice?.toString() || '',
      stock: product.stock.toString(),
      minStock: product.lowStockThreshold?.toString() || '10',
      unit: product.unit || 'pcs',
      description: product.description || '',
      image: product.images?.[0] || ''
    });
    setShowDetail(false);
    setShowModal(true);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setForm({ ...form, image: result.assets[0].uri });
        Alert.alert('Success', 'Product image updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleRemoveImage = () => {
    Alert.alert('Remove Image', 'Remove product image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setForm({ ...form, image: '' }) },
    ]);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku) {
      Alert.alert('Error', 'Name and SKU are required');
      return;
    }

    const productData = {
      id: editingId || `prod_${Date.now()}`,
      name: form.name,
      sku: form.sku,
      categoryId: form.category,
      basePrice: parseFloat(form.price) || 0,
      costPrice: parseFloat(form.cost) || 0,
      stock: parseInt(form.stock) || 0,
      lowStockThreshold: parseInt(form.minStock) || 10,
      unit: form.unit,
      description: form.description,
      isAvailable: true,
      trackInventory: true,
      allowBackorder: false,
      images: form.image ? [form.image] : [],
      createdAt: editingId ? new Date() : new Date(),
      updatedAt: new Date(),
    };

    try {
      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('derp_products') || '[]');
      let updated;
      if (editingId) {
        updated = existing.map((p: any) => p.id === editingId ? { ...p, ...productData } : p);
      } else {
        updated = [...existing, productData];
      }
      localStorage.setItem('derp_products', JSON.stringify(updated));

      Alert.alert('Success', `Product ${editingId ? 'updated' : 'added'} successfully!`);
      setShowModal(false);
      loadProducts(); // Reload products
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
    }
  };

  const handleDelete = (product: any) => {
    Alert.alert('Delete Product', `Remove ${product.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            const existing = JSON.parse(localStorage.getItem('derp_products') || '[]');
            const updated = existing.filter((p: any) => p.id !== product.id);
            localStorage.setItem('derp_products', JSON.stringify(updated));
            Alert.alert('Success', 'Product deleted');
            setShowDetail(false);
            loadProducts();
          } catch {
            Alert.alert('Error', 'Failed to delete product');
          }
        } 
      },
    ]);
  };

  const handleStockAdjustment = async (adjustment: number) => {
    if (!selectedProduct) return;
    
    const newStock = selectedProduct.stock + adjustment;
    if (newStock < 0) {
      Alert.alert('Error', 'Stock cannot be negative');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('derp_products') || '[]');
      const updated = existing.map((p: any) => 
        p.id === selectedProduct.id ? { ...p, stock: newStock, updatedAt: new Date() } : p
      );
      localStorage.setItem('derp_products', JSON.stringify(updated));
      
      Alert.alert('Success', `Stock updated: ${selectedProduct.name} now has ${newStock} units`);
      setShowStockModal(false);
      loadProducts();
    } catch {
      Alert.alert('Error', 'Failed to update stock');
    }
  };

  const handleExport = async () => {
    const data = products.map(p => ({
      name: p.name,
      sku: p.sku,
      category: p.categoryId,
      price: p.basePrice,
      stock: p.stock,
    }));
    await Share.share({ message: JSON.stringify(data, null, 2), title: 'Inventory Export' });
  };

  const renderProduct = ({ item }: { item: any }) => {
    const ss = getStockStatus(item.stock);
    return (
      <TouchableOpacity style={styles.productCard} onPress={() => { setSelectedProduct(item); setShowDetail(true); }}>
        <View style={styles.productImage}>
          {item.images && item.images.length > 0 ? (
            <View style={{ width: '100%', height: '100%', borderRadius: borderRadius.md, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
            </View>
          ) : (
            <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
          <View style={styles.productStats}>
            <View style={styles.stat}><Ionicons name="cash-outline" size={14} color={colors.textMuted} /><Text style={styles.statText}>{formatCurrency(item.basePrice)}</Text></View>
            <View style={styles.stat}><Ionicons name="folder-outline" size={14} color={colors.textMuted} /><Text style={styles.statText}>{item.categoryId || 'N/A'}</Text></View>
          </View>
        </View>
        <View style={[styles.stockIndicator, ss.cls, { marginRight: spacing.sm }]}>
          <Text style={[styles.stockText, { color: ss.color }]}>{ss.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
        <TextInput style={styles.searchInput} placeholder="Search products, SKU..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></TouchableOpacity>}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {[
          { id: 'all', label: 'All', icon: 'apps' },
          { id: 'low', label: 'Low Stock', icon: 'warning' },
          { id: 'out', label: 'Out of Stock', icon: 'close-circle' },
        ].map((f) => (
          <TouchableOpacity key={f.id} style={[styles.filterChip, selectedFilter === f.id && styles.filterChipActive]} onPress={() => setSelectedFilter(f.id as any)}>
            <Ionicons name={f.icon as any} size={16} color={selectedFilter === f.id ? '#fff' : colors.textMuted} />
            <Text style={[styles.filterChipText, selectedFilter === f.id && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product List */}
      <FlatList 
        data={filteredProducts} 
        renderItem={renderProduct} 
        keyExtractor={(i) => i.id} 
        contentContainerStyle={styles.listContent} 
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add Product'}</Text>
            <ScrollView>
              {/* Product Image */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md }}>
                <View style={{ width: 80, height: 80, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  {form.image ? (
                    <Image source={{ uri: form.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Ionicons name="image-outline" size={40} color={colors.textMuted} />
                  )}
                </View>
                <View style={{ flex: 1, gap: spacing.sm }}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md }} onPress={handlePickImage}>
                    <Ionicons name="image" size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                      {form.image ? 'Change Image' : 'Add Image'}
                    </Text>
                  </TouchableOpacity>
                  {form.image && (
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }} onPress={handleRemoveImage}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                      <Text style={{ color: colors.error, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>Remove Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TextInput style={styles.input} placeholder="Product Name *" placeholderTextColor={colors.textMuted} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
              <View style={styles.row}>
                <TextInput style={styles.inputHalf} placeholder="SKU" placeholderTextColor={colors.textMuted} value={form.sku} onChangeText={(v) => setForm({ ...form, sku: v })} />
                <TextInput style={styles.inputHalf} placeholder="Category" placeholderTextColor={colors.textMuted} value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} />
              </View>
              <View style={styles.row}>
                <TextInput style={styles.inputHalf} placeholder="Price" placeholderTextColor={colors.textMuted} value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} keyboardType="decimal-pad" />
                <TextInput style={styles.inputHalf} placeholder="Cost" placeholderTextColor={colors.textMuted} value={form.cost} onChangeText={(v) => setForm({ ...form, cost: v })} keyboardType="decimal-pad" />
              </View>
              <View style={styles.row}>
                <TextInput style={styles.inputHalf} placeholder="Stock" placeholderTextColor={colors.textMuted} value={form.stock} onChangeText={(v) => setForm({ ...form, stock: v })} keyboardType="number-pad" />
                <TextInput style={styles.inputHalf} placeholder="Min Stock Alert" placeholderTextColor={colors.textMuted} value={form.minStock} onChangeText={(v) => setForm({ ...form, minStock: v })} keyboardType="number-pad" />
              </View>
              <TextInput style={styles.textArea} placeholder="Description" placeholderTextColor={colors.textMuted} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
            </ScrollView>
            <View style={styles.modalActions}>
              {editingId && (
                <TouchableOpacity style={[styles.modalButton, styles.modalDelete]} onPress={() => { handleDelete({ id: editingId, name: form.name }); setShowModal(false); }}>
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </TouchableOpacity>
              )}
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
            {selectedProduct && (
              <>
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>SKU</Text><Text style={styles.detailValue}>{selectedProduct.sku}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Category</Text><Text style={styles.detailValue}>{selectedProduct.categoryId || 'N/A'}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Price</Text><Text style={styles.detailValue}>{formatCurrency(selectedProduct.basePrice)}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Stock</Text><Text style={styles.detailValue}>{selectedProduct.stock} units</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Status</Text><Text style={[styles.detailValue, { color: getStockStatus(selectedProduct.stock).color }]}>{getStockStatus(selectedProduct.stock).label}</Text></View>
                
                {/* Stock Adjustment Section */}
                <View style={styles.stockAdjustmentSection}>
                  <Text style={styles.stockAdjustmentTitle}>Adjust Stock</Text>
                  <View style={styles.adjustmentButtons}>
                    <TouchableOpacity style={styles.adjustmentBtn} onPress={() => handleStockAdjustment(-1)}>
                      <Ionicons name="remove-circle-outline" size={20} color={colors.text} />
                      <Text style={{ color: colors.text, fontSize: typography.fontSize.sm }}>−1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adjustmentBtn} onPress={() => handleStockAdjustment(-5)}>
                      <Ionicons name="remove-circle-outline" size={20} color={colors.text} />
                      <Text style={{ color: colors.text, fontSize: typography.fontSize.sm }}>−5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adjustmentBtn} onPress={() => handleStockAdjustment(-10)}>
                      <Ionicons name="remove-circle-outline" size={20} color={colors.text} />
                      <Text style={{ color: colors.text, fontSize: typography.fontSize.sm }}>−10</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.adjustmentButtons}>
                    <TouchableOpacity style={styles.adjustmentBtn} onPress={() => handleStockAdjustment(1)}>
                      <Ionicons name="add-circle-outline" size={20} color={colors.success} />
                      <Text style={{ color: colors.success, fontSize: typography.fontSize.sm }}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adjustmentBtn} onPress={() => handleStockAdjustment(5)}>
                      <Ionicons name="add-circle-outline" size={20} color={colors.success} />
                      <Text style={{ color: colors.success, fontSize: typography.fontSize.sm }}>+5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adjustmentBtn} onPress={() => handleStockAdjustment(10)}>
                      <Ionicons name="add-circle-outline" size={20} color={colors.success} />
                      <Text style={{ color: colors.success, fontSize: typography.fontSize.sm }}>+10</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setShowDetail(false)}><Text style={styles.modalCancelText}>Close</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalSave]} onPress={() => handleEdit(selectedProduct)}><Text style={styles.modalSaveText}>Edit</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalDelete]} onPress={() => handleDelete(selectedProduct)}><Text style={styles.modalDeleteText}>Delete</Text></TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
