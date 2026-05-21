import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { posService } from '../../services/api';
import { usePosStore } from '../../store/posStore';
import { Ionicons } from '@expo/vector-icons';

export function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { cart, addItem } = usePosStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (cat = selectedCategory) => {
    setIsLoading(true);
    try {
      const data = await posService.getProducts(search, cat);
      setProducts(data);
      // derive categories from products
      const cats = Array.from(new Set(data.map(p => p.category).filter(Boolean)));
      setCategories(cats);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text.length > 2 || text.length === 0) {
      loadProducts();
    }
  };

  const handleSelectCategory = (cat) => {
    const next = selectedCategory === cat ? '' : cat;
    setSelectedCategory(next);
    loadProducts(next);
  };

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      Alert.alert('Out of Stock', `${product.name} is not available`);
      return;
    }
    addItem(product, 1);
    Alert.alert('Success', `${product.name} added to cart`);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {/* Left: Image */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.placeholderText}>{getInitials(item.name)}</Text>
        </View>
      )}

      {/* Right: Name, Price stacked */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>AED {item.price.toFixed(2)}</Text>
      </View>

      {/* Small add button at top-right */}
      <TouchableOpacity
        style={[
          styles.addButtonSmall,
          { opacity: item.stock > 0 ? 1 : 0.5 }
        ]}
        onPress={() => handleAddToCart(item)}
        disabled={item.stock <= 0}
      >
        <Text style={styles.addButtonSmallText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.headerRow}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} />
          <View style={styles.titleColumn}>
            <Text style={styles.logoText}>DERPX Ai</Text>
            <Text style={styles.smallSubtitle}>ENTERPRISE MOBILE</Text>
          </View>
        </View>

        <View style={styles.logoDivider} />
      </View>

      <View style={styles.sectionBar}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{paddingHorizontal:4}}>
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === '' && styles.categoryChipActive]}
            onPress={() => handleSelectCategory('')}
          >
            <Text style={[styles.categoryText, selectedCategory === '' && styles.categoryTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => handleSelectCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {Platform.OS === 'web' ? (
          <View style={[styles.searchGlass, styles.searchGlassWeb, {marginTop:8, flexDirection:'row', alignItems:'center'}]}>
            <Text style={{color:'#ffffff', fontSize:16, marginLeft:4, marginRight:6}}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={search}
              onChangeText={handleSearch}
              placeholderTextColor="#6b7280"
            />
          </View>
        ) : (
          <View style={[styles.searchGlass, {marginTop:8, flexDirection:'row', alignItems:'center'}]}>
            <Text style={{color:'#ffffff', fontSize:16, marginLeft:4, marginRight:6}}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={search}
              onChangeText={handleSearch}
              placeholderTextColor="#6b7280"
            />
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Cart')}
        accessibilityLabel="Open cart"
      >
        <Ionicons name="cart" size={28} color="#fff" />
        {cart.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map(p => p[0]).join('');
  return initials.toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  searchInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    padding: 8,
    paddingBottom: 80,
    paddingHorizontal: 8,
  },
  sectionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  categoryText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'flex-start',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#3b82f6',
    fontWeight: '800',
    fontSize: 16,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    flexShrink: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3b82f6',
  },
  addButtonSmall: {
    backgroundColor: '#2563eb',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonSmallText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  cartButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff3b30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  headerInner: {
    backgroundColor: 'rgba(238,246,255,0.95)',
    borderRadius: 18,
    padding: 12,
    // ensure it sits at the bottom of the header area
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 10,
  },
  searchGlass: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  logoDivider: {
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
  searchGlassWeb: {
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleColumn: {
    marginLeft: 8,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  smallSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
    letterSpacing: 0.6,
    marginTop: 0,
  },
});
