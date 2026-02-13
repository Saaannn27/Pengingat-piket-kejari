import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchScheduleData } from '../utils/api';
import ScheduleCard from '../components/ScheduleCard';
import NotificationManager from '../components/NotificationManager';

export default function ScheduleScreen({ navigation }) {
  const [scheduleData, setScheduleData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); 

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [scheduleData, userName, searchQuery, filterMode]);

  const loadData = async () => {
    try {
      const name = await AsyncStorage.getItem('@user_name');
      setUserName(name || '');
      
      await fetchSchedule();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data jadwal');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const data = await fetchScheduleData();
      setScheduleData(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      Alert.alert('Error', 'Gagal mengambil data dari server');
    }
  };

  const filterData = () => {
    let filtered = [...scheduleData];

    // filter berdasarkan mode
    if (filterMode === 'mine' && userName) {
      filtered = filtered.filter(
        item => item.nama.toLowerCase() === userName.toLowerCase()
      );
    } else if (filterMode === 'today') {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const today = new Date().getDay();
      const todayName = days[today === 0 ? 6 : today - 1];
      
      filtered = filtered.filter(item => item.hari === todayName);
    }

    // search jika ada query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.nama.toLowerCase().includes(query) ||
        item.hari.toLowerCase().includes(query) ||
        item.bagian.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedule();
    setRefreshing(false);
  };

  const handleScheduleNotification = async (schedule) => {
    try {
      await NotificationManager.schedulePiketNotification(schedule);
      Alert.alert(
        'Berhasil',
        `Notifikasi untuk ${schedule.nama} dijadwalkan`
      );
    } catch (error) {
  Alert.alert('Error', error.message || 'Gagal menjadwalkan notifikasi');
  console.log(error);
}
  };

  const scheduleAllNotifications = async () => {
    if (!userName) {
      Alert.alert('Info', 'Silakan atur nama Anda terlebih dahulu di Pengaturan');
      return;
    }

    const userSchedules = scheduleData.filter(
      item => item.nama.toLowerCase() === userName.toLowerCase()
    );

    if (userSchedules.length === 0) {
      Alert.alert('Info', 'Tidak ada jadwal ditemukan untuk nama Anda');
      return;
    }

    Alert.alert(
      'Jadwalkan Semua Notifikasi',
      `Anda akan menjadwalkan ${userSchedules.length} notifikasi. Lanjutkan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Jadwalkan',
          onPress: async () => {
            try {
              let successCount = 0;
              
              for (const schedule of userSchedules) {
                try {
                  await NotificationManager.schedulePiketNotification(schedule);
                  successCount++;
                } catch (error) {
                  console.error(`Error scheduling for ${schedule.nama}:`, error);
                }
              }
              
              Alert.alert(
                'Berhasil',
                `${successCount} dari ${userSchedules.length} notifikasi berhasil dijadwalkan`
              );
            } catch (error) {
              Alert.alert('Error', error.message || 'Gagal menjadwalkan notifikasi');
              console.log(error);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat jadwal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📋 Jadwal Piket</Text>
          <Text style={styles.headerSubtitle}>
            Total {scheduleData.length} jadwal ditemukan
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchSchedule}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama, hari, atau bagian..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'all' && styles.filterTabActive]}
          onPress={() => setFilterMode('all')}
        >
          <Text style={[styles.filterText, filterMode === 'all' && styles.filterTextActive]}>
            Semua Jadwal
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'mine' && styles.filterTabActive]}
          onPress={() => setFilterMode('mine')}
        >
          <Text style={[styles.filterText, filterMode === 'mine' && styles.filterTextActive]}>
            Jadwal Saya
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'today' && styles.filterTabActive]}
          onPress={() => setFilterMode('today')}
        >
          <Text style={[styles.filterText, filterMode === 'today' && styles.filterTextActive]}>
            Hari Ini
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.filterTab}
          onPress={scheduleAllNotifications}
        >
          <Text style={styles.filterText}>🔔 Jadwalkan Semua</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Schedule List */}
      <ScrollView
        style={styles.scheduleList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
          />
        }
        contentContainerStyle={styles.scheduleListContent}
      >
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Tidak ada jadwal ditemukan</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? 'Coba gunakan kata kunci lain'
                : filterMode === 'mine'
                ? 'Tidak ada jadwal untuk nama Anda'
                : 'Data jadwal kosong'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={fetchSchedule}
            >
              <Text style={styles.emptyButtonText}>Refresh Data</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredData.map((item, index) => (
            <ScheduleCard
              key={index}
              schedule={item}
              onNotify={() => handleScheduleNotification(item)}
              isMine={userName && item.nama.toLowerCase() === userName.toLowerCase()}
              showNotify={userName && item.nama.toLowerCase() === userName.toLowerCase()}
            />
          ))
        )}
      </ScrollView>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          Menampilkan {filteredData.length} dari {scheduleData.length} jadwal
        </Text>
        {userName && (
          <Text style={styles.statsText}>
            Jadwal Anda: {scheduleData.filter(item => 
              item.nama.toLowerCase() === userName.toLowerCase()
            ).length}
          </Text>
        )}
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  scheduleList: {
    flex: 1,
  },
  scheduleListContent: {
    padding: 15,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: '80%',
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
});