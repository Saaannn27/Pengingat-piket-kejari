import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import COLORS from '../constants/colors';
import { clearUserData } from '../utils/storage';
import { cancelAllNotifications } from '../services/notification';

export default function SettingsScreen({ navigation }) {
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuItemTextDanger}>🚪 Reset / Logout</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
      </View>

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