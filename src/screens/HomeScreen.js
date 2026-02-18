import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import COLORS from '../constants/colors';
import { getUserData } from '../utils/storage';
import {
  scheduleNotificationPiket,
  cancelAllNotifications,
  getScheduledNotifications,
} from '../services/notification';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
    setLoading(false);

    // Cek berapa notifikasi yang sudah terjadwal
    const scheduled = await getScheduledNotifications();
    setNotifCount(scheduled.length);
  };

  const handleAktifkanPengingat = async () => {
    if (!userData?.user?.jadwal?.length) {
      Alert.alert('Info', 'Tidak ada jadwal piket yang bisa diingatkan.');
      return;
    }

    setSchedulingLoading(true);

    // Batalkan semua notifikasi lama dulu
    await cancelAllNotifications();

    let berhasil = 0;
    let gagal = 0;

    // Jadwalkan notifikasi untuk setiap jadwal piket
    for (const jadwal of userData.user.jadwal) {
      const result = await scheduleNotificationPiket(jadwal);
      if (result.success) {
        berhasil++;
        console.log(`✅ Notifikasi dijadwalkan untuk: ${result.pesanWaktu}`);
      } else {
        gagal++;
      }
    }

    setSchedulingLoading(false);

    // Update jumlah notifikasi
    const scheduled = await getScheduledNotifications();
    setNotifCount(scheduled.length);

    Alert.alert(
      '🔔 Pengingat Diaktifkan',
      `${berhasil} pengingat berhasil dijadwalkan.\n${gagal > 0 ? `${gagal} gagal.` : ''}`,
      [{ text: 'OK' }]
    );
  };

  // Format tanggal yang lebih ramah dibaca
  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  // Cek apakah jadwal sudah lewat
  const isJadwalLewat = (tanggal, jam) => {
    const [tahun, bulan, tgl] = tanggal.split('-').map(Number);
    const [h, m] = jam.split(':').map(Number);
    const jadwalDate = new Date(tahun, bulan - 1, tgl, h, m);
    return jadwalDate <= new Date();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Card info user */}
      <View style={styles.userCard}>
        <Text style={styles.greeting}>Halo, 👋</Text>
        <Text style={styles.userName}>{userData?.user?.nama}</Text>
        <Text style={styles.userJabatan}>{userData?.user?.jabatan}</Text>
        {notifCount > 0 && (
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>🔔 {notifCount} pengingat aktif</Text>
          </View>
        )}
      </View>

      {/* Jadwal piket user */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Jadwal Piket Saya</Text>

        {userData?.user?.jadwal?.length > 0 ? (
          userData.user.jadwal.map((item, index) => {
            const sudahLewat = isJadwalLewat(item.tanggal, item.jam_mulai);
            return (
              <View
                key={index}
                style={[styles.jadwalCard, sudahLewat && styles.jadwalCardLewat]}
              >
                <View style={styles.jadwalHeader}>
                  <Text style={styles.jadwalHari}>{item.hari}</Text>
                  {sudahLewat && (
                    <View style={styles.badgeLewat}>
                      <Text style={styles.badgeLewatText}>Sudah Lewat</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.jadwalTanggal}>{formatTanggal(item.tanggal)}</Text>
                <Text style={styles.jadwalJam}>
                  ⏰ {item.jam_mulai} – {item.jam_selesai} WIB
                </Text>
                <Text style={styles.jadwalKeterangan}>📌 {item.keterangan}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Tidak ada jadwal piket untuk kamu.</Text>
          </View>
        )}
      </View>

      {/* Tombol-tombol aksi */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.btnPrimary, schedulingLoading && styles.btnDisabled]}
          onPress={handleAktifkanPengingat}
          disabled={schedulingLoading}
        >
          {schedulingLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.btnPrimaryText}>🔔 Aktifkan Pengingat</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('AllSchedule', { allData: userData?.allData })}
        >
          <Text style={styles.btnSecondaryText}>📋 Semua Jadwal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.btnOutlineText}>⚙️ Pengaturan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textLight,
  },
  userCard: {
    backgroundColor: COLORS.primary,
    padding: 24,
    paddingTop: 30,
  },
  greeting: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  userName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  userJabatan: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  notifBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  notifBadgeText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  jadwalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  jadwalCardLewat: {
    borderLeftColor: COLORS.textLight,
    opacity: 0.7,
  },
  jadwalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jadwalHari: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  badgeLewat: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeLewatText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  jadwalTanggal: {
    color: COLORS.text,
    fontSize: 14,
    marginTop: 4,
  },
  jadwalJam: {
    color: COLORS.textLight,
    fontSize: 13,
    marginTop: 4,
  },
  jadwalKeterangan: {
    color: COLORS.textLight,
    fontSize: 13,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  actionContainer: {
    padding: 16,
    paddingBottom: 30,
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
  },
  btnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnSecondary: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
});