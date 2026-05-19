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
} from 'react-native';
import { posService } from '../../services/api';
import { usePosStore } from '../../store/posStore';

export function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { cart, addItem } = usePosStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await posService.getProducts(search);
      setProducts(data);
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
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.nameAr && <Text style={styles.productNameAr}>{item.nameAr}</Text>}
        <Text style={styles.productPrice}>AED {item.price.toFixed(2)}</Text>
        <Text style={[
          styles.productStock,
          { color: item.stock > 10 ? '#4caf50' : '#ff9800' }
        ]}>
          Stock: {item.stock}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.addButton,
          { opacity: item.stock > 0 ? 1 : 0.5 }
        ]}
        onPress={() => handleAddToCart(item)}
        disabled={item.stock <= 0}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={search}
        onChangeText={handleSearch}
        placeholderTextColor="#999"
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <Text style={styles.cartButtonText}>
          🛒 Cart ({cart.length})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    margin: 12,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    padding: 8,
    paddingBottom: 80,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  productNameAr: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
