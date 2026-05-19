import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';

import { LoginScreen } from './src/screens/Auth/LoginScreen';
import PosScreen from './src/screens/POS/PosScreen';
import CrmScreen from './src/screens/CRM/CrmScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="PosHome"
        component={PosScreen}
        options={{ title: 'Point of Sale' }}
      />
    </Stack.Navigator>
  );
}

function CrmStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="CrmHome"
        component={CrmScreen}
        options={{ title: 'CRM' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
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

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="POS"
        component={PosStack}
        options={{
          tabBarLabel: 'POS',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="CRM"
        component={CrmStack}
        options={{
          tabBarLabel: 'CRM',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState(null);
  const { restoreSession, user } = useAuthStore();
  const { loadLocalSettings } = useSettingsStore();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadLocalSettings();
        const hasSession = await restoreSession();
        setInitialRoute(hasSession ? 'MainApp' : 'Auth');
      } catch (error) {
        console.error('Bootstrap error:', error);
        setInitialRoute('Auth');
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
          options={{ animationEnabled: false }}
        />
        <Stack.Screen
          name="MainApp"
          component={MainApp}
          options={{ animationEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
