import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import SplashScreen from './src/screens/SplashScreen';
import IdentityScreen from './src/screens/IdentityScreen';
import HomeScreen from './src/screens/HomeScreen';
import AllScheduleScreen from './src/screens/AllScheduleScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { requestNotificationPermission } from './src/services/notification';
import { getUserName, getUserData } from './src/utils/storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null); // null = masih loading

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    // Minta izin notifikasi saat pertama buka aplikasi
    await requestNotificationPermission();

    // Cek apakah user sudah login sebelumnya
    const savedName = await getUserName();
    const savedData = await getUserData();

    if (savedName && savedData) {
      // Sudah pernah login → langsung ke Home
      setInitialRoute('Home');
    } else {
      // Belum pernah login → ke halaman Identity
      setInitialRoute('Identity');
    }
  };

  // Tampilkan splash screen sementara masih loading
  if (initialRoute === null) {
    return <SplashScreen />;
  }

  return (
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
          name="Home"
          component={HomeScreen}
          options={{ title: 'Dashboard Piket Kejari', headerTitleAlign: 'center', headerBackVisible: false }}
        />
        <Stack.Screen
          name="AllSchedule"
          component={AllScheduleScreen}
          options={{ title: 'Jadwal Piket', headerTitleAlign: 'center', }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Pengaturan', headerTitleAlign: 'center', }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}