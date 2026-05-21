import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';

import { LoginScreen } from './src/screens/Auth/LoginScreen';
import PosScreen from './src/screens/POS/PosScreen';
import { ProductsScreen } from './src/screens/POS/ProductsScreen';
import { CartScreen } from './src/screens/POS/CartScreen';
import { CheckoutScreen } from './src/screens/POS/CheckoutScreen';
import { ReceiptScreen } from './src/screens/POS/ReceiptScreen';
import CrmScreen from './src/screens/CRM/CrmScreen';
import { CustomerDetailScreen } from './src/screens/CRM/CustomerDetailScreen';
import { CreateOrderScreen } from './src/screens/CRM/CreateOrderScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { SalesScreen } from './src/screens/Sales/SalesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
        headerTitleStyle: { fontSize: 18, fontWeight: '700', color: '#fff' },
        headerTintColor: '#3b82f6',
      }}
    >
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'Products' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="Receipt"
        component={ReceiptScreen}
        options={{ title: 'Receipt' }}
      />
    </Stack.Navigator>
  );
}

function CrmStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
        headerTitleStyle: { fontSize: 18, fontWeight: '700', color: '#fff' },
        headerTintColor: '#3b82f6',
      }}
    >
      <Stack.Screen
        name="Customers"
        component={CrmScreen}
        options={{ title: 'Customers' }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ title: 'Customer Details', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{ title: 'New Order', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
        headerTitleStyle: { fontSize: 18, fontWeight: '700', color: '#fff' },
        headerTintColor: '#3b82f6',
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

function SalesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
        headerTitleStyle: { fontSize: 18, fontWeight: '700', color: '#fff' },
        headerTintColor: '#3b82f6',
      }}
    >
      <Stack.Screen
        name="SalesHistory"
        component={SalesScreen}
        options={{ title: 'Sales History' }}
      />
      <Stack.Screen
        name="Receipt"
        component={ReceiptScreen}
        options={{ title: 'Receipt' }}
      />
    </Stack.Navigator>
  );
}

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarLabelPosition: 'beside-icon',
        tabBarStyle: { height: 68, paddingHorizontal: 12, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
        tabBarItemStyle: { paddingHorizontal: 8, justifyContent: 'flex-start', alignItems: 'center' },
      }}
    >
      <Tab.Screen
        name="POSTab"
        component={PosStack}
        options={{
          tabBarLabel: 'POS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CRMTab"
        component={CrmStack}
        options={{
          tabBarLabel: 'CRM',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SalesTab"
        component={SalesStack}
        options={{
          tabBarLabel: 'Sales',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { restoreSession, user } = useAuthStore();
  const { loadLocalSettings } = useSettingsStore();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadLocalSettings();
        const hasSession = await restoreSession();
      } catch (error) {
        console.error('Bootstrap error:', error);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={user ? 'MainApp' : 'Auth'}
      >
        <Stack.Screen
          name="Auth"
          component={LoginScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="MainApp"
          component={MainApp}
          options={{ animation: 'none' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
