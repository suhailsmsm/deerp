/**
 * DerpX POS - Wishlist Screen
 * View and manage saved wishlist items
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePosStore } from '../../store/posStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatCurrency } from '../../utils';
import { darkColors, lightColors, spacing, borderRadius, typography } from '../../constants/theme';

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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
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
  productList: {
    padding: spacing.lg,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
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
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function WishlistScreen() {
  const navigation = useNavigation();
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { products, addToCart, wishlist, toggleWishlist } = usePosStore();

  const wishlistItems = products.filter(p => wishlist.has(p.id));

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    Alert.alert('Added', `${product.name} added to cart`);
  };

  const handleRemove = (product: any) => {
    toggleWishlist(product.id);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productItem} activeOpacity={0.7}>
      <View style={styles.productImage}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={{ width: '100%', height: '100%', borderRadius: borderRadius.md }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
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

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist ({wishlistItems.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Product List */}
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>No items in wishlist</Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.sm }}>
            Tap the heart icon on products to save them
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
