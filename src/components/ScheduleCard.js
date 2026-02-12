import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScheduleCard({ schedule, onNotify, isMine = false, showNotify = true }) {
  const getDayColor = (hari) => {
    const colors = {
      'Senin': '#FF9800',
      'Selasa': '#2196F3',
      'Rabu': '#4CAF50',
      'Kamis': '#9C27B0',
      'Jumat': '#F44336',
      'Sabtu': '#607D8B',
      'Minggu': '#795548',
    };
    return colors[hari] || '#666';
  };

  return (
    <View style={[styles.card, isMine && styles.myCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.dayContainer}>
          <View style={[styles.dayBadge, { backgroundColor: getDayColor(schedule.hari) }]}>
            <Text style={styles.dayText}>{schedule.hari}</Text>
          </View>
          <Text style={styles.time}>{schedule.jam}</Text>
        </View>
        
        {isMine && (
          <View style={styles.myBadge}>
            <Text style={styles.myBadgeText}>JADWAL SAYA</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.name}>{schedule.nama}</Text>
        <Text style={styles.department}>Bagian: {schedule.bagian}</Text>
        
        {schedule.deskripsi && (
          <Text style={styles.description}>{schedule.deskripsi}</Text>
        )}
      </View>
      
      {showNotify && onNotify && (
        <TouchableOpacity
          style={styles.notifyButton}
          onPress={onNotify}
        >
          <Text style={styles.notifyButtonText}>🔔 Ingatkan Saya</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  myBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myBadgeText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  notifyButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  notifyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});