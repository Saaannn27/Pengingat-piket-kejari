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
      // Simpan nama ke AsyncStorage
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
        <View style={styles.header}>
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
});