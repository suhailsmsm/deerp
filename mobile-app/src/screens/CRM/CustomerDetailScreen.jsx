import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useCrmStore } from '../../store/crmStore';

export function CustomerDetailScreen({ route, navigation }) {
  const { customerId } = route.params;
  const { selectedCustomer, customerOrders, getCustomer, fetchCustomerOrders, isLoading } = useCrmStore();

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      await getCustomer(customerId);
      await fetchCustomerOrders(customerId);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer data');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!selectedCustomer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Customer not found</Text>
      </View>
    );
  }

  const handleCreateOrder = () => {
    navigation.navigate('CreateOrder', { customerId });
  };

  const handleCall = () => {
    Alert.alert('Call', `Calling ${selectedCustomer.phone}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.profileName}>{selectedCustomer.name}</Text>
        <Text style={styles.profilePhone}>{selectedCustomer.phone}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Loyalty Points</Text>
          <Text style={styles.infoCardValue}>{selectedCustomer.loyalty}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Total Orders</Text>
          <Text style={styles.infoCardValue}>{customerOrders.length}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.callButton} onPress={handleCall}>
        <Text style={styles.callButtonText}>📞 Call Customer</Text>
      </TouchableOpacity>

      {customerOrders.length > 0 && (
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Order History</Text>

          {customerOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.orderTotal}>
                  AED {order.total.toFixed(2)}
                </Text>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderLabel}>Method:</Text>
                <Text style={styles.orderValue}>
                  {order.method.charAt(0).toUpperCase() + order.method.slice(1)}
                </Text>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderLabel}>ID:</Text>
                <Text style={styles.orderValue}>{order.id}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {customerOrders.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No orders yet</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.createOrderButton}
          onPress={handleCreateOrder}
        >
          <Text style={styles.createOrderButtonText}>+ Create Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  profileSection: {
    backgroundColor: 'rgba(37,99,235,0.15)',
    padding: 24,
    alignItems: 'center',
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  profilePhone: {
    fontSize: 16,
    color: '#cbd5e1',
    opacity: 1,
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  infoCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  callButton: {
    backgroundColor: '#16a34a',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ordersSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  orderCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  orderDetails: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  orderLabel: {
    fontSize: 12,
    color: '#94a3b8',
    width: 60,
  },
  orderValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 20,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  createOrderButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
