import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IdentityScreen({ navigation }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveIdentity = async () => {
    if (!name.trim()) {
      Alert.alert('Nama Diperlukan', 'Silakan masukkan nama Anda');
      return;
    }

    setIsLoading(true);
    
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('@user_name', name.trim());
      await AsyncStorage.setItem('@user_identity_set', 'true');
      
      Alert.alert(
        'Berhasil!',
        `Halo ${name.trim()}! Selamat menggunakan aplikasi Piket.`,
        [
          {
            text: 'Lanjutkan',
            onPress: () => navigation.replace('Home'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan identitas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
            <Text style={styles.headerIcon}>👤</Text>
            <Text style={styles.headerTitle}>Identitas Pengguna</Text>
            <Text style={styles.headerSubtitle}>
              Masukkan nama Anda untuk personalisasi jadwal piket
            </Text>
          </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Andi Wijaya"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
            />
            <Text style={styles.helperText}>
              Nama ini akan digunakan untuk menampilkan jadwal piket Anda
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>⚠️ Informasi Penting</Text>
            <Text style={styles.infoText}>
              • Masukkan nama panjang tanpa gelar{'\n'}
              • Data aman dan tidak dikirim ke server{'\n'}
              • Anda bisa ubah nama nanti di Pengaturan{'\n'}
              • Nama digunakan untuk filter jadwal piket
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, (!name.trim() || isLoading) && styles.buttonDisabled]}
            onPress={handleSaveIdentity}
            disabled={!name.trim() || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Menyimpan...' : 'Simpan dan Lanjutkan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.skipButtonText}>Lewati untuk sekarang</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F4',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },

  // Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Form Container
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 5,
  },

  inputGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  helperText: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 6,
  },

  // INFO BOX
  infoBox: {
    backgroundColor: '#FFFDE7',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6D36F',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9E7C0C',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },

  // Button Container
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#1B5E20',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#607D8B',
    fontSize: 14,
  },
});

