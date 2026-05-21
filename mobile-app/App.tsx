import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import { usePosStore } from './src/store/posStore';

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
        options={{ headerShown: false }}
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
  const [initError, setInitError] = useState(null);
  const { restoreSession, user } = useAuthStore();
  const { loadLocalSettings } = useSettingsStore();
  const { init: initPosStore } = usePosStore();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        console.log('🚀 App bootstrapping...');
        
        // Initialize settings
        await loadLocalSettings();
        
        // Initialize POS store with offline-first database
        await initPosStore();
        
        // Restore auth session
        const hasSession = await restoreSession();
        
        console.log('✅ App bootstrap complete');
        setIsReady(true);
      } catch (error) {
        console.error('❌ Bootstrap error:', error);
        setInitError(error.message);
        setIsReady(true); // Still show app, but with error state
      }
    };

    bootstrap();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#fff', marginTop: 16, fontSize: 14 }}>Initializing offline database...</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', padding: 20 }}>
        <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>⚠️ Initialization Error</Text>
        <Text style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center' }}>{initError}</Text>
        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 16, textAlign: 'center' }}>The app may have limited functionality without database access.</Text>
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
