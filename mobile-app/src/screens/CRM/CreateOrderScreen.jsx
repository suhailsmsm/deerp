import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { posService } from '../../services/api';
import { crmService } from '../../services/api';
import { useCrmStore } from '../../store/crmStore';

export function CreateOrderScreen({ route, navigation }) {
  const { customerId } = route.params;
  const { selectedCustomer } = useCrmStore();
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [orderItems]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await posService.getProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = async () => {
    if (orderItems.length === 0) {
      setSubtotal(0);
      setVat(0);
      setTotal(0);
      return;
    }

    const newSubtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const taxData = await posService.calculateTax(newSubtotal);
      setSubtotal(taxData.subtotal);
      setVat(taxData.vat);
      setTotal(taxData.total);
    } catch (error) {
      console.error('Failed to calculate tax:', error);
    }
  };

  const addItemToOrder = (product) => {
    const existingItem = orderItems.find((item) => item.id === product.id);

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setOrderItems(
        orderItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (productId) => {
    setOrderItems(orderItems.filter((item) => item.id !== productId));
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Empty Order', 'Please add items to the order');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await crmService.createOrder({
        customerId,
        items: orderItems,
        subtotal,
        vat,
        total,
        method: 'credit',
      });

      Alert.alert(
        'Order Created',
        `Order ID: ${order.id}`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('CustomerDetail', { customerId });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => addItemToOrder(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>AED {item.price.toFixed(2)}</Text>
      </View>
      <Text style={styles.addIcon}>+</Text>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>AED {item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.qtyButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.itemTotal}>
        AED {(item.price * item.quantity).toFixed(2)}
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeItem(item.id)}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.customerName}>{selectedCustomer?.name}</Text>
        <Text style={styles.customerPhone}>{selectedCustomer?.phone}</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Available Products</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.productsList}
          />
        )}

        {orderItems.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Order Items</Text>

            <FlatList
              data={orderItems}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.orderItemsList}
            />

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>AED {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>VAT (5%):</Text>
                <Text style={styles.summaryValue}>AED {vat.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>AED {total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {orderItems.length > 0 && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleCreateOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerSection: {
    backgroundColor: '#007AFF',
    padding: 16,
    paddingTop: 24,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  productsList: {
    gap: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  addIcon: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  orderItemsList: {
    gap: 8,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#666',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyButton: {
    backgroundColor: '#f0f0f0',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantity: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    minWidth: 70,
    textAlign: 'right',
  },
  deleteButton: {
    padding: 6,
  },
  deleteText: {
    fontSize: 18,
    color: '#d32f2f',
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  cancelButton: {
    flex: 0.3,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  submitButton: {
    flex: 0.7,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
