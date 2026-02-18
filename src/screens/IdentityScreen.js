import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import COLORS from '../constants/colors';
import { fetchPiketData, findUserByName } from '../services/api';
import { saveUserName, saveUserData } from '../utils/storage';

export default function IdentityScreen({ navigation }) {
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanjut = async () => {
    // Validasi: nama tidak boleh kosong
    if (!nama.trim()) {
      setError('Nama tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError('');

    // Fetch data dari API
    const result = await fetchPiketData();

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Cari user berdasarkan nama
    const userDitemukan = findUserByName(result.data, nama);

    if (!userDitemukan) {
      setError(`Nama "${nama}" tidak ditemukan dalam daftar piket. Periksa ejaan nama kamu.`);
      setLoading(false);
      return;
    }

    // Simpan data user ke AsyncStorage
    await saveUserName(userDitemukan.nama);
    await saveUserData({
      user: userDitemukan,
      allData: result.data,
    });

    setLoading(false);

    // Navigasi ke Home Screen
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>🏛️</Text>
        <Text style={styles.title}>Piket Kejari</Text>
        <Text style={styles.subtitle}>Masukkan nama kamu untuk melihat jadwal piket</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Contoh: Ahmad Fauzi"
          value={nama}
          onChangeText={(text) => {
            setNama(text);
            setError(''); // hapus error saat user mengetik
          }}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleLanjut}
        />

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : null]}
          onPress={handleLanjut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Lanjut →</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    flex: 0.6,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});