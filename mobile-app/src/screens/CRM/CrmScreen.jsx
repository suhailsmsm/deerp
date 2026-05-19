import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { crmService } from '../../services/api';

export default function CrmScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await crmService.getCustomers(search);
      setCustomers(data.data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text.length > 2 || text.length === 0) {
      loadCustomers();
    }
  };

  const renderCustomer = ({ item }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
    >
      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.customerPhone}>{item.phone}</Text>
      <Text style={styles.customerLoyalty}>Loyalty Points: {item.loyalty}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search customers..."
        value={search}
        onChangeText={handleSearch}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Customer</Text>
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
    padding: 12,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  customerLoyalty: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
