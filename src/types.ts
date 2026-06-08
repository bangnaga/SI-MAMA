/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type JenisAset = 'REPEATER' | 'VSAT' | 'BTS';
export type StatusAset = 'AKTIF' | 'GANGGUAN' | 'MAINTENANCE';
export type UrgensiTiket = 'TINGGI' | 'SEDANG' | 'RENDAH';
export type StatusTiket = 'BARU' | 'PROSES' | 'SELESAI';
export type KondisiAlat = 'BAIK' | 'CUKUP' | 'BURUK';

export interface DistrikInfo {
  id: string;
  nama: string;
  koordinatSenter: { lat: number; lng: number };
  deskripsi: string;
}

export interface Aset {
  id: string;
  nama: string;
  jenis: JenisAset;
  distrik: string;
  latitude: number;
  longitude: number;
  status: StatusAset;
  frekuensi?: string;
  daya?: string;
  noIsr?: string;
  lokasiSpesifik?: string;
  createdAt: string;
}

export interface Tiket {
  id: string;
  asetId: string;
  asetNama: string;
  distrik: string;
  pengirim: string;
  deskripsi: string;
  urgensi: UrgensiTiket;
  status: StatusTiket;
  teknisi: string;
  foto?: string; // Base64
  createdAt: string;
  updatedAt: string;
  slaDeadline: string; // ISO date string
}

export interface MaintenanceLog {
  id: string;
  asetId: string;
  asetNama: string;
  teknisi: string;
  tanggal: string;
  kondisiBaterai: KondisiAlat;
  kondisiSolarPanel: KondisiAlat;
  teganganSinyal: string; // e.g., "13.8V / -85dBm"
  cekFisik: boolean;
  fotoBukti?: string; // Base64
  catatan: string;
  createdAt: string;
}

export interface SyncItem {
  id: string;
  tipe: 'ASET_NEW' | 'TIKET_NEW' | 'TIKET_UPDATE' | 'MAINTENANCE_NEW';
  payload: any;
  timestamp: string;
}
