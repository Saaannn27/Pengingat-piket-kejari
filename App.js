import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import IdentityScreen from './src/screens/IdentityScreen';
import BottomTabs from './src/navigate/BottomTabs';

import { requestNotificationPermission } from './src/services/notification';
import { getUserName, getUserData } from './src/utils/storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    await requestNotificationPermission();

    const savedName = await getUserName();
    const savedData = await getUserData();

    if (savedName && savedData) {
      setInitialRoute('Main');
    } else {
      setInitialRoute('Identity');
    }
  };

  if (initialRoute === null) {
    return <SplashScreen />;
  }

  return (
  <SafeAreaProvider>
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1a237e" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: '#1B5E20' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Identity"
          component={IdentityScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
);
}
