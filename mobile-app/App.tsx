/**
 * DerpX POS - Main App Entry Point
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import { navigationDarkTheme, navigationLightTheme, darkColors, lightColors } from './src/constants/theme';

// Auth Screen
import LoginScreen from './src/screens/auth/LoginScreen';

// POS Screens
import POSScreen from './src/screens/pos/POSScreen';
import CartScreen from './src/screens/pos/CartScreen';
import CheckoutScreen from './src/screens/pos/CheckoutScreen';
import ScannerScreen from './src/screens/pos/ScannerScreen';
import ReceiptScreen from './src/screens/pos/ReceiptScreen';
import WishlistScreen from './src/screens/pos/WishlistScreen';

// Sales Screen
import SalesScreen from './src/screens/sales/SalesScreen';

// CRM Screen
import CRMScreen from './src/screens/crm/CRMScreen';

// Inventory Screen
import InventoryScreen from './src/screens/inventory/InventoryScreen';

// Settings Screen
import SettingsScreen from './src/screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// POS Stack Navigator
function POSStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: darkColors.background,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: darkColors.text,
        },
      }}
    >
      <Stack.Screen name="POSHome" component={POSScreen} options={{ title: 'POS', headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Shopping Cart' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scan Barcode', headerShown: false }} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Receipt' }} />
    </Stack.Navigator>
  );
}

// Main App Tab Navigator
function MainApp() {
  const { theme: themeMode } = useSettingsStore();
  const colors = themeMode === 'dark' ? darkColors : lightColors;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.glass || colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tab.Screen
        name="POS"
        component={POSStack}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CRM"
        component={CRMScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const { theme: themeMode } = useSettingsStore();
  const navigationTheme = themeMode === 'dark' ? navigationDarkTheme : navigationLightTheme;

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkColors.primary} />
        <Text style={styles.loadingText}>Loading DerpX POS...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainApp} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return <RootNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkColors.background,
  },
  loadingText: {
    color: darkColors.text,
    marginTop: 16,
    fontSize: 14,
  },
});
