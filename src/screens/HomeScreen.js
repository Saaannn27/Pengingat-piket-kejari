import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchScheduleData } from '../../src/utils/api';
import NotificationManager from '../../src/components/NotificationManager';
import ScheduleCard from '../../src/components/ScheduleCard';

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [scheduleData, setScheduleData] = useState([]);
  const [userSchedule, setUserSchedule] = useState([]);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(false);

  useEffect(() => {
    loadUserData();
    checkNotificationStatus();
  }, []);

  useEffect(() => {
    if (userName && scheduleData.length > 0) {
      filterUserSchedule();
    }
  }, [userName, scheduleData]);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('@user_name');
      setUserName(name || 'Pengguna');
      
      await fetchAndProcessSchedule();
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndProcessSchedule = async () => {
    try {
      const data = await fetchScheduleData();
      setScheduleData(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      Alert.alert('Error', 'Gagal mengambil data jadwal dari server');
    }
  };

  const filterUserSchedule = () => {
    if (!userName || !scheduleData) return;
    
    const userSchedules = scheduleData.filter(
      item => item.nama.toLowerCase() === userName.toLowerCase()
    );
    
    setUserSchedule(userSchedules);
    
    // Find next schedule
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    let nextScheduleFound = null;
    
    // Check today's schedule
    const todaySchedule = userSchedules.find(
      item => item.hari === days[today === 0 ? 6 : today - 1]
    );
    
    if (todaySchedule) {
      nextScheduleFound = {
        ...todaySchedule,
        isToday: true,
        status: 'HARI_INI',
      };
    } else {
      // Find next schedule
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (today + i) % 7;
        const nextDay = days[nextDayIndex === 0 ? 6 : nextDayIndex - 1];
        
        const nextDaySchedule = userSchedules.find(
          item => item.hari === nextDay
        );
        
        if (nextDaySchedule) {
          nextScheduleFound = {
            ...nextDaySchedule,
            daysUntil: i,
            status: 'AKAN_DATANG',
          };
          break;
        }
      }
    }
    
    setNextSchedule(nextScheduleFound);
  };

  const checkNotificationStatus = async () => {
    const status = await NotificationManager.checkNotificationPermission();
    setNotificationStatus(status);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAndProcessSchedule();
    setRefreshing(false);
  };

  const handleScheduleNotification = async (schedule) => {
    try {
      await NotificationManager.schedulePiketNotification(schedule);
      Alert.alert('Berhasil', 'Notifikasi telah dijadwalkan');
    } catch (error) {
      Alert.alert('Error', 'Gagal menjadwalkan notifikasi');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4CAF50']}
        />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeIcon}>👋</Text>
          <View>
            <Text style={styles.welcomeText}>Halo,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.profileButtonText}>Pengaturan</Text>
        </TouchableOpacity>
      </View>

      {/* Next Schedule Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Jadwal Berikutnya</Text>
        
        {nextSchedule ? (
          <View style={styles.nextScheduleCard}>
            <View style={styles.nextScheduleHeader}>
              <View>
                <Text style={styles.nextScheduleDay}>{nextSchedule.hari}</Text>
                <Text style={styles.nextScheduleTime}>{nextSchedule.jam}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                nextSchedule.isToday ? styles.todayBadge : styles.upcomingBadge
              ]}>
                <Text style={styles.statusText}>
                  {nextSchedule.isToday ? 'HARI INI' : `${nextSchedule.daysUntil} HARI LAGI`}
                </Text>
              </View>
            </View>
            
            <Text style={styles.nextScheduleName}>{nextSchedule.nama}</Text>
            <Text style={styles.nextScheduleDept}>Bagian: {nextSchedule.bagian}</Text>
            
            <View style={styles.nextScheduleActions}>
              <TouchableOpacity
                style={styles.notifyButton}
                onPress={() => handleScheduleNotification(nextSchedule)}
              >
                <Text style={styles.notifyButtonText}>🔔 Ingatkan Saya</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyScheduleCard}>
            <Text style={styles.emptyScheduleIcon}>📅</Text>
            <Text style={styles.emptyScheduleText}>Tidak ada jadwal piket</Text>
            <Text style={styles.emptyScheduleSubtext}>
              {userName ? 'Tidak ditemukan jadwal untuk nama Anda' : 'Silakan atur nama Anda terlebih dahulu'}
            </Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userSchedule.length}</Text>
          <Text style={styles.statLabel}>Total Jadwal</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {userSchedule.filter(s => {
              const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabdu'];
              const today = new Date().getDay();
              return s.hari === days[today === 0 ? 6 : today - 1];
            }).length}
          </Text>
          <Text style={styles.statLabel}>Hari Ini</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {notificationStatus ? '✅' : '❌'}
          </Text>
          <Text style={styles.statLabel}>Notifikasi</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Aksi Cepat</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Schedule')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Lihat Semua Jadwal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Refresh Jadwal',
                'Ambil data terbaru dari server?',
                [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Refresh', onPress: fetchAndProcessSchedule }
                ]
              );
            }}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Refresh Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              const result = await NotificationManager.sendTestNotification();
              if (result) {
                Alert.alert('Berhasil', 'Notifikasi test telah dikirim');
              }
            }}
          >
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionText}>Test Notifikasi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Pengaturan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Schedules */}
      {userSchedule.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Jadwal Saya</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAllText}>Lihat semua →</Text>
            </TouchableOpacity>
          </View>
          
          {userSchedule.slice(0, 3).map((item, index) => (
            <ScheduleCard
              key={index}
              schedule={item}
              onNotify={() => handleScheduleNotification(item)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1B5E20',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  nextScheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextScheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nextScheduleDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  nextScheduleTime: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayBadge: {
    backgroundColor: '#FFEB3B',
  },
  upcomingBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  nextScheduleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nextScheduleDept: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  nextScheduleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  notifyButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  notifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyScheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyScheduleIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyScheduleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptyScheduleSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});