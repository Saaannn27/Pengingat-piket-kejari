import React, { useState, useEffect, useMemo } from 'react';
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
  FlatList,
} from 'react-native';
import COLORS from '../constants/colors';
import { fetchPiketData, findUserByName } from '../services/api';
import { saveUserName, saveUserData } from '../utils/storage';

export default function IdentityScreen({ navigation }) {
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allPetugas, setAllPetugas] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const result = await fetchPiketData();
    if (result.success && result.data?.petugas) {
      setAllPetugas(result.data.petugas);
    }
  };

  const suggestions = useMemo(() => {
    if (!nama.trim()) return [];
    return allPetugas.filter((p) =>
      p.nama?.toLowerCase().includes(nama.toLowerCase())
    );
  }, [nama, allPetugas]);

  const handleSelectSuggestion = (selectedName) => {
    setNama(selectedName);
    setShowSuggestion(false);
    setError('');
  };

  const handleLanjut = async () => {
    if (!nama.trim()) {
      setError('Nama tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await fetchPiketData();

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    const userDitemukan = findUserByName(result.data, nama);

    if (!userDitemukan) {
      setError(`Nama "${nama}" tidak ditemukan dalam daftar piket.`);
      setLoading(false);
      return;
    }

    await saveUserName(userDitemukan.nama);
    await saveUserData({
      user: userDitemukan,
      allData: result.data,
    });

    setLoading(false);
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>🏛️</Text>
        <Text style={styles.title}>Piket Kejari</Text>
        <Text style={styles.subtitle}>
          Masukkan nama kamu untuk melihat jadwal piket
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nama Lengkap</Text>

        <View>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Contoh: Ahmad Fauzi"
            value={nama}
            onChangeText={(text) => {
              setNama(text);
              setError('');
              setShowSuggestion(true);
            }}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleLanjut}
          />

          {showSuggestion && suggestions.length > 0 && (
            <View style={styles.suggestionBox}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={suggestions.slice(0, 5)}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() =>
                      handleSelectSuggestion(item.nama)
                    }
                  >
                    <Text style={styles.suggestionText}>
                      {item.nama}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

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
  suggestionBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 180,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
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
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});