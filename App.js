import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import SplashScreenComponent from './src/screens/SplashScreen';
import IdentityScreen from './src/screens/IdentityScreen';
import HomeScreen from './src/screens/HomeScreen';


const Stack = createStackNavigator();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(null);
  const [initialRoute, setInitialRoute] = useState('Splash');

  useEffect(() => {
    async function prepareApp() {
      try {
        const storedName = await AsyncStorage.getItem('@user_name');
        
        if (storedName) {
          setUserName(storedName);
          setInitialRoute('Home');
        } else {
          setInitialRoute('Identity');
        }

        // Set Notifikasi
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
          options={{
            title: 'Kejari Piket App',
            headerTitleAlign: 'center', 
            headerStyle: {
              backgroundColor: '#1B5E20', 
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
            },
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: 'Dashboard Piket',
            headerTitleAlign: 'center', 
            headerStyle: {
              backgroundColor: '#1B5E20', 
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}