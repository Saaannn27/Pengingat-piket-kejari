import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Setup Android Notification Channel
const setupAndroidChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('piket-kejari', {
      name: 'Pengingat Piket Kejari',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a237e',
      sound: 'default',
    });
  }
};

// Minta Izin Notifikasi
export const requestNotificationPermission = async () => {
  await setupAndroidChannel();

  if (!Device.isDevice) {
    console.warn('Notifikasi hanya bekerja di perangkat fisik.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Izin notifikasi ditolak. Aktifkan di Pengaturan > Aplikasi.');
    return false;
  }

  return true;
};

// Jadwalkan Notifikasi Piket
export const scheduleNotificationPiket = async (jadwalItem) => {
  await setupAndroidChannel();

  // Parse tanggal dan jam dari API
  const [tahun, bulan, tanggal] = jadwalItem.tanggal.split('-').map(Number);
  const [jam, menit] = jadwalItem.jam_mulai.split(':').map(Number);

  // Buat Date object jadwal piket
  const jadwalDate = new Date(tahun, bulan - 1, tanggal, jam, menit, 0);
  const jadwalTimestamp = jadwalDate.getTime();
  const sekarangTimestamp = Date.now();

  // VALIDASI WAKTU 
  if (jadwalTimestamp <= sekarangTimestamp) {
    console.log(
      `⏭️ Dilewati: jadwal ${jadwalItem.tanggal} ${jadwalItem.jam_mulai} sudah lewat.`
    );
    return {
      success: false,
      skipped: true,
      reason: `Jadwal ${jadwalItem.hari}, ${jadwalItem.tanggal} pukul ${jadwalItem.jam_mulai} sudah lewat.`,
    };
  }

  //hitung selisih detik jadwal dari sekarang
  const selisihMs = jadwalTimestamp - sekarangTimestamp;
  const triggerSeconds = Math.floor(selisihMs / 1000);
  const keteranganWaktu = `${jadwalItem.tanggal} pukul ${jadwalItem.jam_mulai} WIB`;
  console.log(`✅ Notifikasi dijadwalkan ${triggerSeconds} detik lagi (${keteranganWaktu})`);

  try {
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏛️ Pengingat Piket Kejari',
        body: `Kamu piket hari ${jadwalItem.hari}, ${jadwalItem.tanggal} pukul ${jadwalItem.jam_mulai}. Jangan lupa hadir!`,
        data: { jadwal: jadwalItem },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
        channelId: 'piket-kejari',
      },
    });

    console.log('✅ Notifikasi berhasil dijadwalkan, ID:', notifId);
    return { success: true, id: notifId, keteranganWaktu };

  } catch (error) {
    console.error('❌ Gagal menjadwalkan notifikasi:', error.message);
    return { success: false, skipped: false, error: error.message };
  }
};

// Batalkan semua notifikasi terjadwal
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('🗑️ Semua notifikasi dibatalkan');
};

// Ambil daftar notifikasi yang sudah terjadwal
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};