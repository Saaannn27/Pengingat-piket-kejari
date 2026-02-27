import axios from 'axios';

// URL API utama
const API_URL =
  'https://raw.githubusercontent.com/Saaannn27/Pengingat-piket-kejari/main/piket-data.json';

// Fallback data (dipakai kalau API gagal)
const FALLBACK_DATA = {
  instansi: "Kejaksaan Negeri Agam",
  bulan: "Februari",
  tahun: 2026,
  petugas: [
    {
      id: 1,
      nama: "Fabio",
      jabatan: "Jaksa Fungsional",
      jadwal: [
        {
          tanggal: "2026-01-19",
          hari: "Senin",
          jam_mulai: "09:07",
          jam_selesai: "17:00",
          keterangan: "KASI BB",
        },
      ],
    },
    {
      id: 2,
      nama: "Azaria",
      jabatan: "Staf TU",
      jadwal: [
        {
          tanggal: "2026-01-19",
          hari: "Senin",
          jam_mulai: "09:07",
          jam_selesai: "17:00",
          keterangan: "KASI BB",
        },
      ],
    },
    {
      id: 3,
      nama: "Yeli",
      jabatan: "Jaksa Fungsional",
      jadwal: [
        {
          tanggal: "2026-01-20",
          hari: "Selasa",
          jam_mulai: "08:00",
          jam_selesai: "17:00",
          keterangan: "KASUBAG",
        },
      ],
    },
    {
      id: 4,
      nama: "Larosa",
      jabatan: "Staf TU",
      jadwal: [
        {
          tanggal: "2026-01-20",
          hari: "Selasa",
          jam_mulai: "08:00",
          jam_selesai: "17:00",
          keterangan: "KASUBAG",
        },
      ],
    },
    {
      id: 5,
      nama: "Satya",
      jabatan: "Jaksa Fungsional",
      jadwal: [
        {
          tanggal: "2026-01-21",
          hari: "Rabu",
          jam_mulai: "08:00",
          jam_selesai: "17:00",
          keterangan: "KASTEL",
        },
      ],
    },
    {
      id: 6,
      nama: "Tika",
      jabatan: "Jaksa Fungsional",
      jadwal: [
        {
          tanggal: "2026-01-21",
          hari: "Rabu",
          jam_mulai: "08:00",
          jam_selesai: "17:00",
          keterangan: "KASTEL",
        },
      ],
    },
    {
      id: 7,
      nama: "Dzikrul",
      jabatan: "Staf TU",
      jadwal: [
        {
          tanggal: "2026-01-22",
          hari: "Kamis",
          jam_mulai: "08:00",
          jam_selesai: "17:00",
          keterangan: "KASDUM",
        },
      ],
    },
    {
      id: 8,
      nama: "Winda",
      jabatan: "Jaksa Fungsional",
      jadwal: [
        {
          tanggal: "2026-01-22",
          hari: "Kamis",
          jam_mulai: "08:00",
          jam_selesai: "17:00",
          keterangan: "KASDUM",
        },
      ],
    },
    {
      id: 9,
      nama: "Mutiara",
      jabatan: "Jaksa Fungsional",
      jadwal: [
        {
          tanggal: "2026-01-23",
          hari: "Jumat",
          jam_mulai: "08:00",
          jam_selesai: "17:00",
          keterangan: "KASTUN",
        },
      ],
    },
    {
      id: 10,
      nama: "Indah",
      jabatan: "Staf TU",
      jadwal: [
        {
          tanggal: "2026-01-23",
          hari: "Jumat",
          jam_mulai: "08:00",
          jam_selesai: "17:00",
          keterangan: "KASTUN",
        },
      ],
    },
  ],
};

// Ambil data piket (API + fallback)
export const fetchPiketData = async () => {
  try {
    const response = await axios.get(API_URL, {
      timeout: 10000, // 10 detik
    });

    return {
      success: true,
      data: response.data,
      source: "api",
    };
  } catch (error) {
    console.warn("API gagal, menggunakan fallback data:", error.message);

    return {
      success: true,
      data: FALLBACK_DATA,
      source: "fallback",
    };
  }
};

// Cari user berdasarkan nama 
export const findUserByName = (data, nama) => {
  if (!data || !data.petugas) return null;

  const namaCari = nama.trim().toLowerCase();

  const found = data.petugas.find(
    (petugas) => petugas.nama.toLowerCase() === namaCari
  );

  return found || null;
};
