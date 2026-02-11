import axios from 'axios';

// Example JSON URL (Replace with your actual JSON URL)
const JSON_URL = 'https://raw.githubusercontent.com/Saaannn27/Pengingat-piket-kejari/refs/heads/main/jadwal-piket.json';

// Data fallback jika pengambilan data gagal
const FALLBACK_DATA = [
  {
    "id": 1,
    "nama": "Andi",
    "hari": "Senin",
    "jam": "08:00",
    "bagian": "Pidum"
  },
  {
    "id": 2,
    "nama": "Budi",
    "hari": "Selasa",
    "jam": "11:03",
    "bagian": "Intel"
  },
  {
    "id": 3,
    "nama": "Citra",
    "hari": "Rabu",
    "jam": "08:00",
    "bagian": "Reskrim"
  },
  {
    "id": 4,
    "nama": "Doni",
    "hari": "Kamis",
    "jam": "08:00",
    "bagian": "Narkoba"
  },
  {
    "id": 5,
    "nama": "Eka",
    "hari": "Jumat",
    "jam": "08:00",
    "bagian": "Sabara"
  }
];

export const fetchScheduleData = async () => {
  try {
    console.log('Fetching schedule data from:', JSON_URL);
    
    const response = await axios.get(JSON_URL, {
      timeout: 10000, 
    });
    
    if (response.data && Array.isArray(response.data)) {
      console.log('Schedule data fetched successfully:', response.data.length, 'items');
      return response.data;
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.error('Error fetching schedule data:', error.message);
    
    // Mengembalikan data fallback jika terjadi kesalahan
    console.log('Using fallback data');
    return FALLBACK_DATA;
  }
};

export const fetchLocalScheduleData = async () => {
  try {
    return FALLBACK_DATA;
  } catch (error) {
    console.error('Error loading local schedule data:', error);
    return FALLBACK_DATA;
  }
};

// Mengecek agar data refresh setiap 1 jam 
export const shouldRefreshData = (lastFetched) => {
  if (!lastFetched) return true;
  
  const lastFetchedTime = new Date(lastFetched);
  const currentTime = new Date();
  const hoursDiff = (currentTime - lastFetchedTime) / (1000 * 60 * 60);
  
  return hoursDiff > 1; 
};