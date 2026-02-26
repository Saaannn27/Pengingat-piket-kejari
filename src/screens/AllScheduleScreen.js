import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { fetchPiketData } from '../services/api';

const HIJAU_KEJAKSAAN = '#1B5E20';
const KUNING_KEJAKSAAN = '#FFD600';

export default function AllScheduleScreen() {
  const [allData, setAllData] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchPiketData();

      if (result && result.success && result.data) {
        setAllData(result.data);
      } else {
        setAllData(null);
      }
    } catch (error) {
      console.log('ERROR FETCH:', error);
      setAllData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isJadwalLewat = (tanggal, jam) => {
    if (!tanggal || !jam) return false;

    const [tahun, bulan, tgl] = tanggal.split('-').map(Number);
    const [h, m] = jam.split(':').map(Number);

    return new Date(tahun, bulan - 1, tgl, h, m) <= new Date();
  };

  const filteredPetugas = useMemo(() => {
    if (!allData?.petugas) return [];
    let data = allData.petugas.filter(
      (p) => Array.isArray(p.jadwal) && p.jadwal.length > 0
    );

    if (!query.trim()) return data;

    const keyword = query.trim().toLowerCase();

    return data.filter(
      (p) =>
        p.nama?.toLowerCase().includes(keyword) ||
        p.jabatan?.toLowerCase().includes(keyword)
    );
  }, [query, allData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HIJAU_KEJAKSAAN} />
        <Text style={{ marginTop: 10 }}>Memuat data jadwal...</Text>
      </View>
    );
  }

  if (!allData?.petugas) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>Data jadwal tidak tersedia.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={filteredPetugas}
        keyExtractor={(item) => item.id?.toString()}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}

        ListHeaderComponent={
          <View>
            <View
              style={[
                styles.userCard,
                {
                  backgroundColor: HIJAU_KEJAKSAAN,
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 24,
                },
              ]}
            >
              <Text style={styles.headerTitle}>{allData.instansi}</Text>
              <Text style={styles.headerSubtitle}>
                Tahun {allData.tahun}
              </Text>
              <Text style={styles.headerCount}>
                {filteredPetugas.length} petugas memiliki jadwal
              </Text>
            </View>

            <View style={styles.searchWrapper}>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari nama atau jabatan..."
                  placeholderTextColor="#9E9E9E"
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType="search"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>
        }

        renderItem={({ item: petugas }) => (
          <View style={styles.petugasCard}>
            <View style={styles.petugasHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {petugas.nama?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.petugasInfo}>
                <Text style={styles.petugasNama}>{petugas.nama}</Text>
                <Text style={styles.petugasJabatan}>
                  {petugas.jabatan}
                </Text>
              </View>
              <View style={styles.jadwalCountBadge}>
                <Text style={styles.jadwalCountText}>
                  {petugas.jadwal.length}x
                </Text>
              </View>
            </View>

            {petugas.jadwal.map((jadwal, idx) => {
              const lewat = isJadwalLewat(
                jadwal.tanggal,
                jadwal.jam_mulai
              );

              return (
                <View
                  key={idx}
                  style={[
                    styles.jadwalRow,
                    lewat && styles.jadwalRowLewat,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.jadwalTanggal,
                        lewat && styles.jadwalTextLewat,
                      ]}
                    >
                      📅 {formatTanggal(jadwal.tanggal)}
                    </Text>
                    <Text
                      style={[
                        styles.jadwalJam,
                        lewat && styles.jadwalTextLewat,
                      ]}
                    >
                      ⏰ {jadwal.jam_mulai} – {jadwal.jam_selesai} WIB
                    </Text>
                  </View>

                  <View
                    style={
                      lewat
                        ? styles.badgeLewat
                        : styles.badgeAktif
                    }
                  >
                    <Text
                      style={
                        lewat
                          ? styles.badgeLewatText
                          : styles.badgeAktifText
                      }
                    >
                      {lewat ? 'Lewat' : 'Aktif'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        ListEmptyComponent={
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundIcon}>🔎</Text>
            <Text style={styles.notFoundText}>
              Tidak ada petugas dengan jadwal aktif.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F1F8F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 3,
  },
  headerCount: {
    color: KUNING_KEJAKSAAN,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  searchWrapper: {
    paddingHorizontal: 14,
    paddingTop: 14,
    backgroundColor: '#F1F8F1',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
  },
  petugasCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },
  petugasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HIJAU_KEJAKSAAN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  petugasInfo: {
    flex: 1,
  },
  petugasNama: {
    fontWeight: '700',
    color: HIJAU_KEJAKSAAN,
  },
  petugasJabatan: {
    fontSize: 12,
    color: '#757575',
  },
  jadwalCountBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  jadwalCountText: {
    fontSize: 11,
    color: HIJAU_KEJAKSAAN,
    fontWeight: '800',
  },
  jadwalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  jadwalRowLewat: {
    opacity: 0.5,
  },
  jadwalTanggal: {
    fontSize: 13,
  },
  jadwalJam: {
    fontSize: 12,
    color: '#757575',
  },
  jadwalTextLewat: {
    color: '#9E9E9E',
  },
  badgeLewat: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeLewatText: {
    fontSize: 10,
    color: '#9E9E9E',
  },
  badgeAktif: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeAktifText: {
    fontSize: 10,
    color: HIJAU_KEJAKSAAN,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#9E9E9E',
  },
  notFoundContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  notFoundIcon: {
    fontSize: 36,
  },
  notFoundText: {
    marginTop: 10,
  },
});