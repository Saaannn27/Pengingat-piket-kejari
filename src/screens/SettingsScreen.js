import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import COLORS from '../constants/colors';
import { clearUserData } from '../utils/storage';
import { cancelAllNotifications } from '../services/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    loadNotifSetting();
  }, []);

  const loadNotifSetting = async () => {
    const value = await AsyncStorage.getItem('NOTIF_ENABLED');
    if (value === 'true') {
      setNotifEnabled(true);
    }
  };

  const handleToggleNotif = async (value) => {
    if (value) {
      // Minta izin notifikasi
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Izin Ditolak',
          'Notifikasi tidak dapat diaktifkan tanpa izin.'
        );
        return;
      }

      await AsyncStorage.setItem('NOTIF_ENABLED', 'true');
      setNotifEnabled(true);
      Alert.alert('Berhasil', 'Notifikasi diaktifkan.');
    } else {
      // Matikan notifikasi
      await cancelAllNotifications();
      await AsyncStorage.setItem('NOTIF_ENABLED', 'false');
      setNotifEnabled(false);
      Alert.alert('Nonaktif', 'Semua notifikasi dibatalkan.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Reset Akun',
      'Kamu akan keluar dan semua data akan dihapus. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Reset',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            await clearUserData();
            navigation.replace('Identity');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* NOTIF SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifikasi</Text>

        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Aktifkan Notifikasi</Text>
          <Switch
            value={notifEnabled}
            onValueChange={handleToggleNotif}
            trackColor={{ false: '#ccc', true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* ACCOUNT SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuItemTextDanger}>🚪 Reset / Logout</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* INFO SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Aplikasi</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Versi Aplikasi</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>Expo Managed Workflow</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
    padding: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuItemText: {
    fontSize: 15,
    color: COLORS.text,
  },
  menuItemTextDanger: {
    fontSize: 15,
    color: COLORS.error,
  },
  menuItemArrow: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});