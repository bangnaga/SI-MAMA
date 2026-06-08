/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Aset, Tiket, MaintenanceLog, DistrikInfo } from '../types';

export const DAFTAR_DISTRIK: DistrikInfo[] = [
  { id: 'sugapa', nama: 'Sugapa', koordinatSenter: { lat: -3.7150, lng: 136.9930 }, deskripsi: 'Ibu kota Kabupaten Intan Jaya, pusat pemerintahan dan penghubung utama.' },
  { id: 'homeyo', nama: 'Homeyo', koordinatSenter: { lat: -3.7220, lng: 136.8500 }, deskripsi: 'Distrik bagian barat dengan kontur pegunungan ekstrem, rawan blank spot.' },
  { id: 'wandai', nama: 'Wandai', koordinatSenter: { lat: -3.6100, lng: 136.9100 }, deskripsi: 'Berbatasan langsung dengan wilayah pegunungan tengah utara.' },
  { id: 'biandoga', nama: 'Biandoga', koordinatSenter: { lat: -3.8800, lng: 136.9400 }, deskripsi: 'Distrik selatan dengan akses geografi yang menantang dan berbukit.' },
  { id: 'agisiga', nama: 'Agisiga', koordinatSenter: { lat: -3.8900, lng: 137.0600 }, deskripsi: 'Distrik pedalaman timur dengan densitas hutan lebat.' },
  { id: 'hitadipa', nama: 'Hitadipa', koordinatSenter: { lat: -3.6800, lng: 137.0300 }, deskripsi: 'Pusat wilayah pertanian dataran tinggi dan stasiun relay radio.' },
  { id: 'ugimba', nama: 'Ugimba', koordinatSenter: { lat: -3.9200, lng: 137.2000 }, deskripsi: 'Gerbang pendakian puncak tertinggi, jalur geografi murni tebing batu.' },
  { id: 'tomosiga', nama: 'Tomosiga', koordinatSenter: { lat: -3.5500, lng: 137.1000 }, deskripsi: 'Distrik terluar utara, mengandalkan konektivitas radio komunikasi murni.' }
];

export const TEKNISI_PILIHAN = [
  'Sermi Weya, S.Kom',
  'Yulius Tigau',
  'Marthen Sondegau',
  'Amos Kobogau'
];

export const INITIAL_ASETS: Aset[] = [
  {
    id: 'ast-001',
    nama: 'Repeater VHF/UHF Puncak Bilogai',
    jenis: 'REPEATER',
    distrik: 'Sugapa',
    latitude: -3.7121,
    longitude: 136.9954,
    status: 'AKTIF',
    frekuensi: 'RX: 143.550 MHz | TX: 148.550 MHz',
    daya: '50 Watt',
    noIsr: '0012942/KOMINFO/2025',
    lokasiSpesifik: 'Puncak Bukit Bilogai, dekat Menara Salib',
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'ast-002',
    nama: 'VSAT Kantor Bupati Intan Jaya',
    jenis: 'VSAT',
    distrik: 'Sugapa',
    latitude: -3.7165,
    longitude: 136.9912,
    status: 'AKTIF',
    frekuensi: 'Ku-Band (Satelit Nusantara Tiga)',
    daya: '20 Watt (Transceiver)',
    noIsr: '0013091/KOMINFO/2025',
    lokasiSpesifik: 'Hub Tembok Belakang Ruang Kerja Kominfo',
    createdAt: '2025-01-12T09:30:00Z'
  },
  {
    id: 'ast-003',
    nama: 'BTS Combat Telkomsel Sugapa',
    jenis: 'BTS',
    distrik: 'Sugapa',
    latitude: -3.7152,
    longitude: 136.9928,
    status: 'AKTIF',
    frekuensi: '900 MHz (2G/3G) & 1800 MHz (4G)',
    daya: '120 Watt (Solar Array backup)',
    noIsr: '0023450/POSTEL/2024',
    lokasiSpesifik: 'Halaman Samping Kantor Dinas Kominfo',
    createdAt: '2025-01-15T11:00:00Z'
  },
  {
    id: 'ast-004',
    nama: 'Repeater VHF Stasiun Hitadipa',
    jenis: 'REPEATER',
    distrik: 'Hitadipa',
    latitude: -3.6812,
    longitude: 137.0289,
    status: 'GANGGUAN',
    frekuensi: 'RX: 142.100 MHz | TX: 147.100 MHz',
    daya: '25 Watt',
    noIsr: '0014522/KOMINFO/2025',
    lokasiSpesifik: 'Pos Pengamatan Kehutanan Lama Hitadipa',
    createdAt: '2025-02-01T04:20:00Z'
  },
  {
    id: 'ast-005',
    nama: 'VSAT Puskesmas Pembantu Homeyo',
    jenis: 'VSAT',
    distrik: 'Homeyo',
    latitude: -3.7218,
    longitude: 136.8485,
    status: 'MAINTENANCE',
    frekuensi: 'C-Band (Satelit Telkom-4)',
    daya: '15 Watt (C-Band BUC)',
    noIsr: '0011289/KOMINFO/2026',
    lokasiSpesifik: 'Atap Gedung Utama Pustu Homeyo',
    createdAt: '2025-02-18T10:15:00Z'
  },
  {
    id: 'ast-006',
    nama: 'BTS Merdeka Sinyal Wandai',
    jenis: 'BTS',
    distrik: 'Wandai',
    latitude: -3.6115,
    longitude: 136.9082,
    status: 'AKTIF',
    frekuensi: '800 MHz (2G)',
    daya: '80 Watt (Pure Solar)',
    noIsr: '0034291/POSTEL/2025',
    lokasiSpesifik: 'Bukit Kampung Wandai Kanan',
    createdAt: '2025-03-05T08:00:00Z'
  },
  {
    id: 'ast-007',
    nama: 'VSAT Sekolah Dasar Inpres Biandoga',
    jenis: 'VSAT',
    distrik: 'Biandoga',
    latitude: -3.8791,
    longitude: 136.9388,
    status: 'GANGGUAN',
    frekuensi: 'Ku-Band (Satelit Kacific-1)',
    daya: '5 Watt',
    noIsr: '0018820/KOMINFO/2025',
    lokasiSpesifik: 'Tiang Penyangga Samping Ruang Guru',
    createdAt: '2025-04-12T14:00:00Z'
  }
];

export const INITIAL_TIKETS: Tiket[] = [
  {
    id: 'TKT-101',
    asetId: 'ast-004',
    asetNama: 'Repeater VHF Stasiun Hitadipa',
    distrik: 'Hitadipa',
    pengirim: 'Yunus Weya (Kepala Distrik Hitadipa)',
    deskripsi: 'Sinyal radio VHF di distrik Hitadipa melemah total sejak petir kemarin sore. Suara noise sangat keras saat dicoba transmitter.',
    urgensi: 'TINGGI',
    status: 'PROSES',
    teknisi: 'Sermi Weya, S.Kom',
    createdAt: '2026-06-05T10:00:00Z',
    updatedAt: '2026-06-06T08:30:00Z',
    slaDeadline: '2026-06-06T10:00:00Z' // 24 Hours
  },
  {
    id: 'TKT-102',
    asetId: 'ast-007',
    asetNama: 'VSAT Sekolah Dasar Inpres Biandoga',
    distrik: 'Biandoga',
    pengirim: 'Ibu Maria S. (Guru SD Biandoga)',
    deskripsi: 'Koneksi internet VSAT sekolah tidak terhubung sama sekali. Lampu modem kedip merah lambat (Loss of Signal).',
    urgensi: 'SEDANG',
    status: 'BARU',
    teknisi: 'Marthen Sondegau',
    createdAt: '2026-06-06T14:45:00Z',
    updatedAt: '2026-06-06T14:45:00Z',
    slaDeadline: '2026-06-08T14:45:00Z' // 48 Hours
  }
];

export const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  {
    id: 'MNT-001',
    asetId: 'ast-001',
    asetNama: 'Repeater VHF/UHF Puncak Bilogai',
    teknisi: 'Sermi Weya, S.Kom',
    tanggal: '2026-05-15',
    kondisiBaterai: 'BAIK',
    kondisiSolarPanel: 'BAIK',
    teganganSinyal: '13.9V | Jangkauan 25km',
    cekFisik: true,
    catatan: 'Pembersihan debu panel solar surya, penggantian kabel koaksial RG8 yang digigit tikus hutan. Sekarang transceiver bersih tanpa noise.',
    createdAt: '2026-05-15T09:00:00Z'
  },
  {
    id: 'MNT-002',
    asetId: 'ast-002',
    asetNama: 'VSAT Kantor Bupati Intan Jaya',
    teknisi: 'Amos Kobogau',
    tanggal: '2026-05-20',
    kondisiBaterai: 'CUKUP',
    kondisiSolarPanel: 'BAIK',
    teganganSinyal: 'PING 650ms stable | 15 Mbps',
    cekFisik: true,
    catatan: 'Kalibrasi kembali feedhorn parabola (kena angin kencang bergeser 3 derajat). Sinyal naik dari 45% ke 82%. Baterai UPS disarankan ganti 3 bulan lagi.',
    createdAt: '2026-05-20T11:20:00Z'
  }
];
