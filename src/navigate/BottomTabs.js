import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import AllScheduleScreen from '../screens/AllScheduleScreen';
import SettingsScreen from '../screens/SettingsScreen';

import COLORS from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { 
            backgroundColor: COLORS.primary 
        },
        headerTintColor: '#fff',
        headerTitleStyle: { 
            fontWeight: 'bold' 
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 40 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'AllSchedule') {
            iconName = 'calendar';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Dashboard', headerTitleAlign: 'center' }}
      />
      <Tab.Screen
        name="AllSchedule"
        component={AllScheduleScreen}
        options={{ title: 'Jadwal', headerTitleAlign: 'center' }}
        initialParams={{ allData: null }}
     />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Pengaturan', headerTitleAlign: 'center' }}
      />
    </Tab.Navigator>
  );
}
