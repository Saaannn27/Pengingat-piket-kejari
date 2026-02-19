import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_NAME: '@piket_kejari_username',
  USER_DATA: '@piket_kejari_userdata',
};

// Simpan nama user
export const saveUserName = async (nama) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, nama);
    return true;
  } catch (error) {
    console.error('Error menyimpan nama:', error);
    return false;
  }
};

// Ambil nama user yang sudah tersimpan
export const getUserName = async () => {
  try {
    const nama = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
    return nama; // null jika belum ada
  } catch (error) {
    console.error('Error mengambil nama:', error);
    return null;
  }
};

// Simpan data lengkap user (nama + jadwal)
export const saveUserData = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error menyimpan data user:', error);
    return false;
  }
};

// Ambil data lengkap user
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error mengambil data user:', error);
    return null;
  }
};

// Hapus semua data user (untuk logout)
export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_NAME);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    return true;
  } catch (error) {
    console.error('Error menghapus data:', error);
    return false;
  }
};