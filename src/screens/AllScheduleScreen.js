import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import COLORS from '../constants/colors';

const HIJAU_KEJAKSAAN = '#1B5E20';
const KUNING_KEJAKSAAN = '#FFD600';

export default function AllScheduleScreen({ route }) {
  const { allData } = route.params || {};
  const [query, setQuery] = useState('');

  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const isJadwalLewat = (tanggal, jam) => {
    const [tahun, bulan, tgl] = tanggal.split('-').map(Number);
    const [h, m] = jam.split(':').map(Number);
    return new Date(tahun, bulan - 1, tgl, h, m) <= new Date();
  };

  // Filter petugas berdasarkan nama atau jabatan secara real-time
  const filteredPetugas = useMemo(() => {
    if (!allData?.petugas) return [];
    if (!query.trim()) return allData.petugas;

    const keyword = query.trim().toLowerCase();
    return allData.petugas.filter(
      (p) =>
        p.nama.toLowerCase().includes(keyword) ||
        p.jabatan.toLowerCase().includes(keyword)
    );
  }, [query, allData]);

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
        style={styles.container}
        data={filteredPetugas}
        keyExtractor={(item) => item.id.toString()}
        keyboardShouldPersistTaps="handled"

        ListHeaderComponent={
          <View>
            {/* Header instansi */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{allData.instansi}</Text>
              <Text style={styles.headerSubtitle}>Tahun {allData.tahun}</Text>
              <Text style={styles.headerCount}>
                {allData.petugas.length} petugas terdaftar
              </Text>
            </View>

            {/* Search Bar */}
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
                  clearButtonMode="while-editing"
                  autoCorrect={false}
                />
                {query.length > 0 && (
                  <Text
                    style={styles.searchClear}
                    onPress={() => setQuery('')}
                  >
                    ✕
                  </Text>
                )}
              </View>
              {query.trim() !== '' && (
                <Text style={styles.searchResult}>
                  {filteredPetugas.length === 0
                    ? 'Tidak ditemukan'
                    : `${filteredPetugas.length} hasil ditemukan`}
                </Text>
              )}
            </View>
          </View>
        }

        renderItem={({ item: petugas }) => (
          <View style={styles.petugasCard}>
            {/* Header nama & jabatan */}
            <View style={styles.petugasHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {petugas.nama.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.petugasInfo}>
                <Text style={styles.petugasNama}>{petugas.nama}</Text>
                <Text style={styles.petugasJabatan}>{petugas.jabatan}</Text>
              </View>
              <View style={styles.jadwalCountBadge}>
                <Text style={styles.jadwalCountText}>
                  {petugas.jadwal.length}x
                </Text>
              </View>
            </View>

            {/* Daftar jadwal */}
            {petugas.jadwal.map((jadwal, idx) => {
              const lewat = isJadwalLewat(jadwal.tanggal, jadwal.jam_mulai);
              return (
                <View
                  key={idx}
                  style={[styles.jadwalRow, lewat && styles.jadwalRowLewat]}
                >
                  <View style={styles.jadwalLeft}>
                    <Text style={[styles.jadwalTanggal, lewat && styles.jadwalTextLewat]}>
                      📅 {formatTanggal(jadwal.tanggal)}
                    </Text>
                    <Text style={[styles.jadwalJam, lewat && styles.jadwalTextLewat]}>
                      ⏰ {jadwal.jam_mulai} – {jadwal.jam_selesai} WIB
                    </Text>
                  </View>
                  {lewat ? (
                    <View style={styles.badgeLewat}>
                      <Text style={styles.badgeLewatText}>Lewat</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeAktif}>
                      <Text style={styles.badgeAktifText}>Aktif</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        ListEmptyComponent={
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundIcon}>🔎</Text>
            <Text style={styles.notFoundText}>
              Nama "{query}" tidak ditemukan.
            </Text>
            <Text style={styles.notFoundSub}>Coba periksa ejaan nama.</Text>
          </View>
        }

        ListFooterComponent={<View style={{ height: 20 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F1F8F1',
  },
  container: {
    flex: 1,
  },

  // ── Header ──
  header: {
    backgroundColor: HIJAU_KEJAKSAAN,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 3,
  },
  headerCount: {
    color: KUNING_KEJAKSAAN,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },

  // ── Search Bar ──
  searchWrapper: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: '#F1F8F1',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
    padding: 0,
  },
  searchClear: {
    fontSize: 13,
    color: '#9E9E9E',
    paddingLeft: 8,
    paddingVertical: 2,
  },
  searchResult: {
    fontSize: 12,
    color: HIJAU_KEJAKSAAN,
    fontWeight: '600',
    marginTop: 7,
    marginLeft: 4,
  },

  // ── Petugas Card ──
  petugasCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  petugasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    fontSize: 16,
    fontWeight: '800',
  },
  petugasInfo: {
    flex: 1,
  },
  petugasNama: {
    fontSize: 15,
    fontWeight: '700',
    color: HIJAU_KEJAKSAAN,
  },
  petugasJabatan: {
    fontSize: 12,
    color: '#757575',
    marginTop: 1,
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

  // ── Jadwal Row ──
  jadwalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  jadwalRowLewat: {
    opacity: 0.5,
  },
  jadwalLeft: {
    flex: 1,
    gap: 2,
  },
  jadwalTanggal: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '500',
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
    marginLeft: 8,
  },
  badgeLewatText: {
    fontSize: 10,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  badgeAktif: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  badgeAktifText: {
    fontSize: 10,
    color: HIJAU_KEJAKSAAN,
    fontWeight: '700',
  },

  // ── Empty / Not Found ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8F1',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 15,
  },
  notFoundContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  notFoundIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  notFoundText: {
    color: '#424242',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  notFoundSub: {
    color: '#9E9E9E',
    fontSize: 13,
    marginTop: 4,
  },
});