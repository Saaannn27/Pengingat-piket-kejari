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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Memuat data...</Text>
      </View>
    );
  }

  const now = new Date();

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const sortedJadwal =
  userData?.user?.jadwal
    ?.slice()
    .sort((a, b) => {
      const dateA = getDateTime(a.tanggal, a.jam_mulai);
      const dateB = getDateTime(b.tanggal, b.jam_mulai);

      const aHariIni = isSameDay(dateA, now);
      const bHariIni = isSameDay(dateB, now);

      const aLewat = dateA < now;
      const bLewat = dateB < now;
      if (aHariIni && !bHariIni) return -1;
      if (!aHariIni && bHariIni) return 1;
      if (aLewat && !bLewat) return 1;
      if (!aLewat && bLewat) return -1;
      return dateA - dateB;
    }) || [];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
      
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
          ]}
        >
          <Text style={styles.greeting}>Halo 👋</Text>
          <Text style={styles.userName}>{userData?.user?.nama}</Text>
          <Text style={styles.userJabatan}>{userData?.user?.jabatan}</Text>

          {notifCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                🔔 {notifCount} pengingat aktif
              </Text>
            </View>
          )}
        </View>

        {/* SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Jadwal Piket Saya</Text>

          {sortedJadwal.length > 0 ? (
            sortedJadwal.map((item, index) => {
              const hariIni = isHariIni(item.tanggal);

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

        {/* BUTTON */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleAktifkanPengingat}
          >
            <Text style={styles.btnPrimaryText}>
              🔔 Aktifkan Pengingat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => {
              console.log("USER DATA:", userData);
              console.log("ALL DATA:", userData?.allData);

              navigation.navigate('AllSchedule', {
                allData: userData?.allData,
              });
            }}
          >
            <Text style={styles.btnSecondaryText}>
              📋 Semua Jadwal
            </Text>
          </TouchableOpacity>
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
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  greeting: { color: '#fff', fontSize: 16 },
  userName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  userJabatan: { color: '#fff', marginBottom: 10 },

  notifBadge: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },

  notifBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
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
});