/**
 * DerpX POS - Main POS Screen
 * Product list with search, categories dropdown, and cart access
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePosStore } from '../../store/posStore';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useCRMStore } from '../../store/crmStore';
import { formatCurrency } from '../../utils';
import { erpApi } from '../../services/erpApi';
import { darkColors, lightColors, spacing, borderRadius, typography } from '../../constants/theme';

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerLogoContainer: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: 55,
    height: 55,
    borderRadius: 10,
  },
  headerIcon: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  headerBranding: {
    flexDirection: 'column',
    marginLeft: spacing.md,
  },
  brandingRow1: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
  },
  brandingRow2: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barcodeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    height: 40,
  },
  cartButtonContent: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  wishlistButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wishlistButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerSelectorInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  customerDropdownList: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  customerDropdownScroll: {
    paddingVertical: spacing.sm,
  },
  customerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    height: 56,
  },
  customerListItemActive: {
    backgroundColor: colors.accent + '15',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  customerPhone: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryDropdownText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  categoryDropdownList: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryDropdownScroll: {
    paddingVertical: spacing.sm,
  },
  categoryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    height: 48,
  },
  categoryListItemActive: {
    backgroundColor: colors.accent + '15',
  },
  productList: {
    padding: spacing.sm,
    paddingBottom: 100,
  },
  productItem: {
    flex: 1,
    margin: spacing.sm,
    maxWidth: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  viewInfoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FEF3C7',
    gap: spacing.xs,
  },
  viewInfoText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    gap: spacing.xs,
  },
  addButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  productName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productSku: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  price: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
  },
  salePrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  originalPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.warning + '20',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  lowStockText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  // Product Info Modal
  productInfoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  productInfoContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  productInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  productInfoTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginRight: spacing.md,
  },
  productInfoImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productInfoDetails: {
    marginBottom: spacing.lg,
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productInfoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  productInfoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  productInfoPrice: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  productInfoPriceValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
  },
  productInfoSalePrice: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  productInfoOriginalPrice: {
    fontSize: typography.fontSize.lg,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: spacing.md,
  },
  productInfoDescription: {
    marginBottom: spacing.lg,
  },
  productInfoDescriptionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  productInfoDescriptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  productInfoActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  productInfoWishlistBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  productInfoWishlistText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  productInfoWishlistBtnActive: {
    backgroundColor: colors.error,
  },
  productInfoWishlistTextActive: {
    color: '#fff',
  },
  productInfoAddBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accent,
    gap: spacing.sm,
  },
  productInfoAddText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginTop: spacing.md,
  },
});

// Category icons mapping
const categoryIcons: Record<string, string> = {
  all: 'apps-outline',
  'paper-rolls': 'document-text-outline',
  'paper-boxes': 'cube-outline',
  software: 'code-slash-outline',
  hardware: 'desktop-outline',
  services: 'construct-outline',
};

export default function POSScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { businessLogo, theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const {
    filteredProducts,
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    cart,
    loadProducts,
    loadCategories,
    setSearchQuery,
    setSelectedCategory,
    itemCount,
    addToCart,
    initializeCart,
    setCustomer,
  } = usePosStore();

  const { customers } = useCRMStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ y: number; width: number } | null>(null);
  const [showProductInfo, setShowProductInfo] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  
  // Customer selector state
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    initializeStore();
  }, []);

  useEffect(() => {
    if (!cart) {
      initializeCart('cashier_1');
    }
  }, [cart, initializeCart]);

  const initializeStore = async () => {
    try {
      // Fetch products from ERP
      const products = await erpApi.getProducts();
      const categories = await erpApi.getCategories();
      
      // Update store with ERP data
      const { setProducts, setCategories } = usePosStore.getState();
      setProducts(products);
      setCategories(categories);
    } catch (error) {
      console.error('Failed to fetch from ERP:', error);
      // Fallback to local data
      await Promise.all([loadProducts(), loadCategories()]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeStore();
    setRefreshing(false);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    setAddedItemId(product.id);
    setTimeout(() => {
      setAddedItemId(null);
    }, 800);
  };

  const handleViewInfo = (product: any) => {
    setSelectedProduct(product);
    setShowProductInfo(true);
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  // Customer selector handlers
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCustomer(customerId);
    setShowCustomerDropdown(false);
    setCustomerSearch('');
  };

  const handleClearCustomer = () => {
    setSelectedCustomerId(undefined);
    setCustomer('');
    setShowCustomerDropdown(false);
    setCustomerSearch('');
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const WishlistButton = () => (
    <TouchableOpacity
      style={styles.wishlistButton}
      onPress={() => navigation.navigate('Wishlist')}
      activeOpacity={0.8}
    >
      <View style={styles.wishlistButtonContent}>
        <Ionicons name="heart" size={20} color="#fff" />
        {wishlist.size > 0 && (
          <View style={styles.wishlistBadge}>
            <Text style={styles.wishlistBadgeText}>{wishlist.size}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const CartButton = () => (
    <TouchableOpacity
      style={styles.cartButton}
      onPress={() => navigation.navigate('Cart')}
      activeOpacity={0.8}
    >
      <View style={styles.cartButtonContent}>
        <Ionicons name="cart" size={20} color="#fff" />
        {itemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
        )}
      </View>
      <Text style={styles.cartButtonText}>Cart</Text>
    </TouchableOpacity>
  );

  const BarcodeButton = () => (
    <TouchableOpacity
      style={styles.barcodeButton}
      onPress={() => navigation.navigate('Scanner')}
      activeOpacity={0.8}
    >
      <Ionicons name="barcode-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: any }) => {
    const isAdded = addedItemId === item.id;

    return (
      <TouchableOpacity style={styles.productItem} activeOpacity={0.7}>
        {/* Top Row: Image + Info */}
        <View style={styles.productRow}>
          <View style={styles.productImage}>
            {item.images && item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0] }}
                style={{ width: '100%', height: '100%', borderRadius: borderRadius.md }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
            )}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.productSku} numberOfLines={1}>
              SKU: {item.sku}
            </Text>

            <View style={styles.priceRow}>
              {item.salePrice && item.salePrice < item.basePrice ? (
                <>
                  <Text style={styles.salePrice}>
                    {formatCurrency(item.salePrice)}
                  </Text>
                  <Text style={styles.originalPrice}>
                    {formatCurrency(item.basePrice)}
                  </Text>
                </>
              ) : (
                <Text style={styles.price}>{formatCurrency(item.basePrice)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Bottom Row: View Info + Add buttons */}
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.viewInfoButton} 
            activeOpacity={0.7}
            onPress={() => handleViewInfo(item)}
          >
            <Ionicons name="information-circle-outline" size={16} color={colors.text} />
            <Text style={styles.viewInfoText}>View Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, isAdded && { backgroundColor: colors.success }]}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isAdded ? 'checkmark' : 'add'}
              size={18}
              color="#fff"
            />
            <Text style={styles.addButtonText}>
              {isAdded ? 'Added' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory) || categories.find(c => c.id === 'all');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoContainer}>
            {businessLogo ? (
              <Image
                source={{ uri: businessLogo }}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="cube" size={24} color={colors.accent} />
            )}
          </View>
          <View style={styles.headerBranding}>
            <Text style={styles.brandingRow1}>DerpX Ai</Text>
            <Text style={styles.brandingRow2}>MOBILE</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <BarcodeButton />
          <WishlistButton />
          <CartButton />
        </View>
      </View>

      {/* Customer Selector */}
      <View style={styles.customerSelector}>
        <Ionicons name="people-outline" size={20} color={colors.accent} />
        <TextInput
          style={styles.customerSelectorInput}
          placeholder="Select Customer (optional)"
          placeholderTextColor={colors.textMuted}
          value={selectedCustomer ? selectedCustomer.name : customerSearch}
          onChangeText={setCustomerSearch}
          onFocus={() => setShowCustomerDropdown(true)}
          editable={true}
        />
        {selectedCustomer && (
          <TouchableOpacity onPress={handleClearCustomer}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </View>

      {/* Customer Dropdown */}
      {showCustomerDropdown && (
        <View style={[styles.customerDropdownList, { top: 105, left: spacing.lg, right: spacing.lg }]}>
          <ScrollView style={styles.customerDropdownScroll} showsVerticalScrollIndicator={false}>
            {filteredCustomers.slice(0, 8).map((customer) => (
              <TouchableOpacity
                key={customer.id}
                style={[styles.customerListItem, selectedCustomerId === customer.id && styles.customerListItemActive]}
                onPress={() => handleSelectCustomer(customer.id)}
                activeOpacity={0.7}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent + '20', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.accent }}>
                    {customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName} numberOfLines={1}>{customer.name}</Text>
                  <Text style={styles.customerPhone} numberOfLines={1}>{customer.phone || customer.email || ''}</Text>
                </View>
                {selectedCustomerId === customer.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
            {filteredCustomers.length === 0 && (
              <View style={[styles.customerListItem, { justifyContent: 'center' }]}>
                <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>No customers found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, SKU, barcode..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.filterRow} onLayout={(e) => {
        const layout = e.nativeEvent.layout;
        setDropdownPosition({ y: layout.y + layout.height + 4, width: layout.width });
      }}>
        <TouchableOpacity
          style={styles.categoryDropdown}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={categoryIcons[selectedCategoryData?.id || 'all'] || 'apps-outline' as any}
            size={18}
            color={colors.accent}
          />
          <Text style={styles.categoryDropdownText}>
            {selectedCategoryData?.name || 'All Categories'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.emptyText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}

      {/* Dropdown List - Rendered after FlatList to appear on top */}
      {showCategoryDropdown && dropdownPosition && (
        <View
          style={[
            styles.categoryDropdownList,
            {
              top: dropdownPosition.y,
              left: spacing.lg,
              width: dropdownPosition.width,
            },
          ]}
        >
          <ScrollView style={styles.categoryDropdownScroll} nestedScrollEnabled>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryListItem,
                  selectedCategory === category.id && styles.categoryListItemActive,
                ]}
                onPress={() => {
                  setSelectedCategory(category.id === 'all' ? undefined : category.id);
                  setShowCategoryDropdown(false);
                }}
              >
                <Ionicons
                  name={categoryIcons[category.id] || 'apps-outline' as any}
                  size={20}
                  color={selectedCategory === category.id ? colors.accent : colors.text}
                />
                <Text
                  style={[
                    styles.categoryDropdownText,
                    selectedCategory === category.id && { fontWeight: typography.fontWeight.semibold },
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Product Info Modal */}
      <Modal visible={showProductInfo} transparent animationType="slide" onRequestClose={() => setShowProductInfo(false)}>
        <View style={styles.productInfoOverlay}>
          <View style={styles.productInfoContent}>
            {selectedProduct && (
              <>
                <View style={styles.productInfoHeader}>
                  <Text style={styles.productInfoTitle} numberOfLines={2}>
                    {selectedProduct.name}
                  </Text>
                  <TouchableOpacity onPress={() => setShowProductInfo(false)}>
                    <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.productInfoImage}>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <Image
                      source={{ uri: selectedProduct.images[0] }}
                      style={{ width: '100%', height: '100%', borderRadius: borderRadius.lg }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
                  )}
                </View>

                <View style={styles.productInfoDetails}>
                  <View style={styles.productInfoRow}>
                    <Text style={styles.productInfoLabel}>SKU:</Text>
                    <Text style={styles.productInfoValue}>{selectedProduct.sku}</Text>
                  </View>
                  {selectedProduct.category && (
                    <View style={styles.productInfoRow}>
                      <Text style={styles.productInfoLabel}>Category:</Text>
                      <Text style={styles.productInfoValue}>{selectedProduct.category}</Text>
                    </View>
                  )}
                  <View style={styles.productInfoRow}>
                    <Text style={styles.productInfoLabel}>Stock:</Text>
                    <Text style={[styles.productInfoValue, { color: (selectedProduct.stock || 0) < 10 ? colors.warning : colors.success }]}>
                      {selectedProduct.stock || 0} units
                    </Text>
                  </View>
                </View>

                <View style={styles.productInfoPrice}>
                  {selectedProduct.salePrice && selectedProduct.salePrice < selectedProduct.basePrice ? (
                    <>
                      <Text style={styles.productInfoSalePrice}>{formatCurrency(selectedProduct.salePrice)}</Text>
                      <Text style={styles.productInfoOriginalPrice}>{formatCurrency(selectedProduct.basePrice)}</Text>
                    </>
                  ) : (
                    <Text style={styles.productInfoPriceValue}>{formatCurrency(selectedProduct.basePrice)}</Text>
                  )}
                </View>

                {selectedProduct.description && (
                  <View style={styles.productInfoDescription}>
                    <Text style={styles.productInfoDescriptionTitle}>Description</Text>
                    <Text style={styles.productInfoDescriptionText}>{selectedProduct.description}</Text>
                  </View>
                )}

                <View style={styles.productInfoActions}>
                  <TouchableOpacity
                    style={[
                      styles.productInfoWishlistBtn,
                      wishlist.has(selectedProduct.id) && styles.productInfoWishlistBtnActive
                    ]}
                    onPress={() => toggleWishlist(selectedProduct.id)}
                  >
                    <Ionicons
                      name={wishlist.has(selectedProduct.id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={wishlist.has(selectedProduct.id) ? '#fff' : colors.error}
                    />
                    <Text style={[
                      styles.productInfoWishlistText,
                      wishlist.has(selectedProduct.id) && styles.productInfoWishlistTextActive
                    ]}>
                      {wishlist.has(selectedProduct.id) ? 'Saved' : 'Wishlist'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.productInfoAddBtn}
                    onPress={() => {
                      handleAddToCart(selectedProduct);
                      setShowProductInfo(false);
                    }}
                  >
                    <Ionicons name="cart-outline" size={20} color="#fff" />
                    <Text style={styles.productInfoAddText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
