import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import SplashScreenComponent from './src/screens/SplashScreen';
import IdentityScreen from './src/screens/IdentityScreen';

const Stack = createStackNavigator();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(null);
  const [initialRoute, setInitialRoute] = useState('Splash');

  useEffect(() => {
    async function prepareApp() {
      try {
        // cek apakah user sudah mengisi identitas
        const storedName = await AsyncStorage.getItem('@user_name');
        
        if (storedName) {
          setUserName(storedName);
          setInitialRoute('Home');
        } else {
          setInitialRoute('Identity');
        }

        // Setup notifications
        await NotificationManager.setupNotifications();
        
      } catch (error) {
        console.error('Error preparing app:', error);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: { backgroundColor: '#f5f5f5' }
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreenComponent} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Identity" 
          component={IdentityScreen} 
          options={{ title: 'Identitas Pengguna' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}