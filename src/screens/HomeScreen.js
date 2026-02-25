import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import COLORS from '../constants/colors';
import { getUserData } from '../utils/storage';
import {
  scheduleNotificationPiket,
  cancelAllNotifications,
  getScheduledNotifications,
} from '../services/notification';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
    setLoading(false);

    const scheduled = await getScheduledNotifications();
    setNotifCount(scheduled.length);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  const handleAktifkanPengingat = async () => {
    if (!userData?.user?.jadwal?.length) {
      Alert.alert('Info', 'Tidak ada jadwal piket yang bisa diingatkan.');
      return;
    }

    await cancelAllNotifications();

    let berhasil = 0;
    let gagal = 0;

    for (const jadwal of userData.user.jadwal) {
      const result = await scheduleNotificationPiket(jadwal);
      if (result.success) berhasil++;
      else gagal++;
    }

    const scheduled = await getScheduledNotifications();
    setNotifCount(scheduled.length);

    Alert.alert(
      '🔔 Pengingat Diaktifkan',
      `${berhasil} berhasil.\n${gagal > 0 ? `${gagal} gagal.` : ''}`
    );
  };

  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const getDateTime = (tanggal, jam) => {
    const [tahun, bulan, tgl] = tanggal.split('-').map(Number);
    const [h, m] = jam.split(':').map(Number);
    return new Date(tahun, bulan - 1, tgl, h, m);
  };

  const isHariIni = (tanggal) => {
    const today = new Date();
    const date = new Date(tanggal);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getSelisihHari = (tanggal) => {
    const today = new Date();
    const target = new Date(tanggal);

    today.setHours(0,0,0,0);
    target.setHours(0,0,0,0);

    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Memuat data...</Text>
      </View>
    );
  }

  const sortedJadwal =
  userData?.user?.jadwal
    ?.slice()
    .sort((a, b) => {
      const now = new Date();

      const dateA = getDateTime(a.tanggal, a.jam_mulai);
      const dateB = getDateTime(b.tanggal, b.jam_mulai);

      const isTodayA = isHariIni(a.tanggal);
      const isTodayB = isHariIni(b.tanggal);

      const isPastA = dateA < now;
      const isPastB = dateB < now;

      if (isTodayA && !isTodayB) return -1;
      if (!isTodayA && isTodayB) return 1;

      if (!isPastA && isPastB) return -1;
      if (isPastA && !isPastB) return 1;

      return dateA - dateB;
    }) || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      
      {/* STATUS BAR */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          backgroundColor: '#f5f7fa',
          paddingBottom: insets.bottom + 20,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* USER CARD */}
        <View
          style={[
            styles.userCard,
            { paddingTop: insets.top + 20 },
          ]}
        >
          <Text style={styles.userName}>{userData?.user?.nama}</Text>
          <Text style={styles.userJabatan}>{userData?.user?.jabatan}</Text>

          {notifCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                🔔 {notifCount} pengingat aktif
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleAktifkanPengingat}
          >
            <Text style={styles.btnPrimaryText}>
              🔔 Aktifkan Pengingat
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Jadwal Piket Saya</Text>

          {sortedJadwal.length > 0 ? (
            sortedJadwal.map((item, index) => {
              const hariIni = isHariIni(item.tanggal);
              const selisihHari = getSelisihHari(item.tanggal);
              return (
                <View
                  key={index}
                  style={[
                    styles.jadwalCard,
                    hariIni && styles.cardHariIni,
                  ]}
                >
                  {hariIni && (
                    <View style={styles.badgeHariIni}>
                      <Text style={styles.badgeHariIniText}>🔥 Hari Ini</Text>
                    </View>
                  )}

                  {/* 🔥 COUNTDOWN BADGE */}
                  <View style={styles.countdownBadge}>
                    <Text style={styles.countdownText}>
                      {(() => {
                        const selisih = getSelisihHari(item.tanggal);

                        if (selisih === 0) return "Hari Ini";
                        if (selisih > 0) return `${selisih} hari lagi`;
                        return "Sudah lewat";
                      })()}
                    </Text>
                  </View>

                  <Text style={styles.jadwalHari}>{item.hari}</Text>
                  <Text style={styles.jadwalTanggal}>
                    {formatTanggal(item.tanggal)}
                  </Text>
                  <Text style={styles.jadwalJam}>
                    ⏰ {item.jam_mulai} – {item.jam_selesai} WIB
                  </Text>
                  <Text style={styles.jadwalKeterangan}>
                    📌 {item.keterangan}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text>Tidak ada jadwal piket.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userCard: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -35,
  },

  userName: { color: '#fff', fontSize: 25, fontWeight: 'bold' },
  userJabatan: { color: '#fff', marginBottom: 10 },

  notifBadge: {
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.3)',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 20,
  alignSelf: 'flex-start',
  marginTop: 10,
},

  notifBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },

  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },

  jadwalCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  cardHariIni: {
    borderWidth: 2,
    borderColor: '#ff9800',
  },

  badgeHariIni: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  badgeHariIniText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  jadwalHari: { fontWeight: 'bold', fontSize: 14 },
  jadwalTanggal: { marginVertical: 4 },
  jadwalJam: { fontSize: 13 },
  jadwalKeterangan: { marginTop: 4, fontSize: 12 },

  emptyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
  },

  actionContainer: {
    padding: 16,
  },

  btnPrimary: {
    backgroundColor: '#FBC02D',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 30,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  btnPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  btnSecondary: {
    backgroundColor: '#e3f2fd',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  btnSecondaryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  countdownBadge: {
  position: 'absolute',
  bottom: 8,
  right: 8,
  backgroundColor: '#e3f2fd',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
},

countdownText: {
  fontSize: 10,
  fontWeight: 'bold',
  color: COLORS.primary,
},
});