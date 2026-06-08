/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MapPin, Radio, Disc, Signal, Plus, X, Tag, FileText, CheckCircle2, AlertOctagon, HelpCircle, Eye, Settings, Trash } from 'lucide-react';
import { Aset, JenisAset, StatusAset } from '../types';
import { DAFTAR_DISTRIK } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface AsetListProps {
  asets: Aset[];
  onAddAset: (newAset: Omit<Aset, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, status: StatusAset) => void;
  onDeleteAset: (id: string) => void;
}

export default function AsetList({ asets, onAddAset, onUpdateStatus, onDeleteAset }: AsetListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDistrik, setFilterDistrik] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState<JenisAset>('REPEATER');
  const [distrik, setDistrik] = useState('Sugapa');
  const [latitude, setLatitude] = useState('-3.7150');
  const [longitude, setLongitude] = useState('136.9930');
  const [status, setStatus] = useState<StatusAset>('AKTIF');
  const [frekuensi, setFrekuensi] = useState('');
  const [daya, setDaya] = useState('');
  const [noIsr, setNoIsr] = useState('');
  const [lokasiSpesifik, setLokasiSpesifik] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Filter & Search Logic
  const filteredAsets = asets.filter((aset) => {
    const matchSearch = aset.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (aset.noIsr && aset.noIsr.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        aset.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'ALL' || aset.jenis === filterType;
    const matchStatus = filterStatus === 'ALL' || aset.status === filterStatus;
    const matchDistrik = filterDistrik === 'ALL' || aset.distrik === filterDistrik;
    return matchSearch && matchType && matchStatus && matchDistrik;
  });

  // Get current device GPS location
  const handleGetGPSLocation = () => {
    setGpsLoading(true);
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung Geolocation / Sensor GPS.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(5));
        setLongitude(position.coords.longitude.toFixed(5));
        setGpsLoading(false);
        setSuccessMsg('Koordinat GPS berhasil dikunci dari sensor HP!');
        setTimeout(() => setSuccessMsg(''), 3000);
      },
      (error) => {
        console.error(error);
        setGpsError('Gagal mengunci sensor GPS (layanan dimatikan / tidak ada sinyal satelit). Menggunakan default Sugapa.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    onAddAset({
      nama,
      jenis,
      distrik,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status,
      frekuensi: frekuensi.trim() || undefined,
      daya: daya.trim() || undefined,
      noIsr: noIsr.trim() || undefined,
      lokasiSpesifik: lokasiSpesifik.trim() || undefined
    });

    // Reset Form
    setNama('');
    setJenis('REPEATER');
    setDistrik('Sugapa');
    setLatitude('-3.7150');
    setLongitude('136.9930');
    setStatus('AKTIF');
    setFrekuensi('');
    setDaya('');
    setNoIsr('');
    setLokasiSpesifik('');
    setShowAddForm(false);

    setSuccessMsg('Aset Infrastruktur baru berhasil disimpan!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div id="aset-list-view" className="flex flex-col gap-4">
      {/* Search & Filter Unit */}
      <div id="aset-controls-card" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              id="search-aset-input"
              type="text"
              placeholder="Cari nama aset, No. ISR, atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-sm transition dark:bg-slate-950 dark:border-slate-700"
            />
          </div>
          
          <button
            id="btn-show-add-aset"
            onClick={() => setShowAddForm(true)}
            className="cursor-pointer bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Aset
          </button>
        </div>

        {/* Extended drop-down filters */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Distrik</label>
            <select
              value={filterDistrik}
              onChange={(e) => setFilterDistrik(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs dark:bg-slate-950 dark:border-slate-700"
            >
              <option value="ALL">Semua Distrik</option>
              {DAFTAR_DISTRIK.map(d => (
                <option key={d.id} value={d.nama}>{d.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Jenis Aset</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs dark:bg-slate-950 dark:border-slate-700"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="REPEATER">Radio Repeater</option>
              <option value="VSAT">Koneksi VSAT</option>
              <option value="BTS">Menara BTS</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs dark:bg-slate-950 dark:border-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Aktif (Normal)</option>
              <option value="GANGGUAN">Gangguan (Down)</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/20 text-green-700 border border-green-200 rounded-xl p-3 text-xs flex items-center gap-2 dark:text-green-300 dark:border-green-800"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-green-500 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assets Count Info */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-slate-500">Menampilkan <strong>{filteredAsets.length}</strong> dari <strong>{asets.length}</strong> total aset Kominfo</span>
      </div>

      {/* Grid List of Assets */}
      <div id="aset-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
        {filteredAsets.length > 0 ? (
          filteredAsets.map((aset) => (
            <div
              key={aset.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 hover:border-slate-200 transition dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                {/* Badge Header Row */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                    aset.jenis === 'REPEATER' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' :
                    aset.jenis === 'VSAT' ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400' : 
                    'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400'
                  }`}>
                    {aset.jenis === 'REPEATER' ? <Radio className="w-3 h-3" /> :
                     aset.jenis === 'VSAT' ? <Disc className="w-3 h-3" /> : <Signal className="w-3 h-3" />}
                    {aset.jenis}
                  </span>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    aset.status === 'AKTIF' ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400' :
                    aset.status === 'GANGGUAN' ? 'bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400 font-extrabold animate-pulse' :
                    'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400'
                  }`}>
                    {aset.status === 'AKTIF' ? '🟢 AKTIF' :
                     aset.status === 'GANGGUAN' ? '🔴 GANGGUAN' : '🟡 MAINTENANCE'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2">{aset.nama}</h4>
                <p className="text-xs text-slate-400 mb-2 font-mono flex items-center gap-1 dark:text-slate-500">
                  ID: {aset.id}
                </p>

                {/* Info specifications */}
                <div className="space-y-1.5 pt-2 border-t border-slate-50 dark:border-slate-800/40 text-xs text-slate-650 dark:text-slate-350">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Distrik {aset.distrik} {aset.lokasiSpesifik && <span className="text-slate-400">({aset.lokasiSpesifik})</span>}
                  </p>
                  
                  <p className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Lat: {aset.latitude} | Lng: {aset.longitude}
                  </p>

                  {aset.frekuensi && (
                    <p className="flex items-start gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{aset.frekuensi} &bull; {aset.daya}</span>
                    </p>
                  )}

                  {aset.noIsr && (
                    <p className="flex items-center gap-1.5 text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>No. ISR: <span className="font-mono">{aset.noIsr}</span></span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons inside cards (Quick Status Setter) */}
              <div className="flex gap-1 mt-4 pt-3 border-t border-slate-50 dark:border-slate-805/40">
                <button
                  id={`set-status-aktif-${aset.id}`}
                  onClick={() => onUpdateStatus(aset.id, 'AKTIF')}
                  className={`cursor-pointer flex-1 py-1 text-[10px] font-bold rounded-lg transition border ${
                    aset.status === 'AKTIF' 
                      ? 'bg-green-500 text-white border-green-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  AKTIF
                </button>
                <button
                  id={`set-status-gng-${aset.id}`}
                  onClick={() => onUpdateStatus(aset.id, 'GANGGUAN')}
                  className={`cursor-pointer flex-1 py-1 text-[10px] font-bold rounded-lg transition border ${
                    aset.status === 'GANGGUAN' 
                      ? 'bg-red-500 text-white border-red-650' 
                      : 'bg-white text-red-600 border-slate-200 hover:bg-red-50 dark:bg-slate-950 dark:border-slate-700'
                  }`}
                >
                  GANGGUAN
                </button>
                <button
                  id={`set-status-mnt-${aset.id}`}
                  onClick={() => onUpdateStatus(aset.id, 'MAINTENANCE')}
                  className={`cursor-pointer flex-1 py-1 text-[10px] font-bold rounded-lg transition border ${
                    aset.status === 'MAINTENANCE' 
                      ? 'bg-yellow-500 text-white border-yellow-600' 
                      : 'bg-white text-yellow-600 border-slate-200 hover:bg-yellow-50 dark:bg-slate-950 dark:border-slate-700'
                  }`}
                >
                  MAINT
                </button>
                <button
                  id={`delete-aset-${aset.id}`}
                  title="Hapus Aset"
                  onClick={() => {
                    if(confirm(`Yakin ingin menghapus aset hardware: "${aset.nama}"?`)) {
                      onDeleteAset(aset.id);
                    }
                  }}
                  className="cursor-pointer p-1 text-slate-400 hover:text-red-500 border border-transparent hover:border-red-200 hover:bg-red-50 rounded-lg dark:hover:bg-red-950/20"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Aset tidak ditemukan</p>
            <p className="text-xs">Coba ganti kata pencarian atau bersihkan filter di atas.</p>
          </div>
        )}
      </div>

      {/* Add New Asset Modal Form dialog overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              id="add-aset-form-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-805">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-500" />
                  Tambah Aset Baru
                </h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nama Alat / Perangkat *</label>
                  <input
                    id="form-aset-nama"
                    type="text"
                    required
                    placeholder="Contoh: Repeater VHF Distrik Ugimba"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Kategori Perangkat</label>
                    <select
                      id="form-aset-jenis"
                      value={jenis}
                      onChange={(e) => setJenis(e.target.value as JenisAset)}
                      className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    >
                      <option value="REPEATER">📻 Radio Repeater</option>
                      <option value="VSAT">🛰️ Terminal VSAT</option>
                      <option value="BTS">📶 Menara BTS/Seluler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Wilayah Distrik</label>
                    <select
                      id="form-aset-distrik"
                      value={distrik}
                      onChange={(e) => setDistrik(e.target.value)}
                      className="w-full text-slate-800 border border-slate-250 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    >
                      {DAFTAR_DISTRIK.map(d => (
                        <option key={d.id} value={d.nama}>{d.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* GEOLOCATION INPUT GROUP PANEL */}
                <div className="bg-amber-400/5 dark:bg-indigo-950/20 p-3 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-750 dark:text-indigo-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Sensor Lokasi Spasial
                    </span>
                    <button
                      id="btn-form-gps"
                      type="button"
                      disabled={gpsLoading}
                      onClick={handleGetGPSLocation}
                      className="cursor-pointer text-[11px] bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-xs"
                    >
                      <Search className="w-3 h-3 animate-pulse" />
                      {gpsLoading ? 'Mengunci...' : 'Kunci GPS HP'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Latitude (Lintang)*</label>
                      <input
                        id="form-aset-lat"
                        type="number"
                        step="0.0001"
                        required
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full text-slate-800 border border-slate-220 px-2 py-1.5 rounded-lg text-xs font-mono dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Longitude (Bujur)*</label>
                      <input
                        id="form-aset-lng"
                        type="number"
                        step="0.0001"
                        required
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full text-slate-800 border border-slate-220 px-2 py-1.5 rounded-lg text-xs font-mono dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {gpsError && <p className="text-[10px] text-red-500 mt-2 font-medium">{gpsError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Posisi / Keterangan Lokasi Spesifik</label>
                  <input
                    id="form-aset-lokasipesifik"
                    type="text"
                    placeholder="Contoh: Samping Puskesmas, Atap Sekolah, dsb."
                    value={lokasiSpesifik}
                    onChange={(e) => setLokasiSpesifik(e.target.value)}
                    className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Frekuensi / Detail Bandwidth</label>
                    <input
                      id="form-aset-frekuensi"
                      type="text"
                      placeholder="RX: 143.50 MHz dsb."
                      value={frekuensi}
                      onChange={(e) => setFrekuensi(e.target.value)}
                      className="w-full text-slate-800 border border-slate-205 px-3 py-1.5 rounded-xl text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Daya Pengerjaan (Watt/UPS)</label>
                    <input
                      id="form-aset-daya"
                      type="text"
                      placeholder="Contoh: 50 Watt"
                      value={daya}
                      onChange={(e) => setDaya(e.target.value)}
                      className="w-full text-slate-800 border border-slate-205 px-3 py-1.5 rounded-xl text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nomor Izin Ke-Anggotaan (ISR)</label>
                  <input
                    id="form-aset-isr"
                    type="text"
                    placeholder="Contoh: 0013091/KOMINFO/2025"
                    value={noIsr}
                    onChange={(e) => setNoIsr(e.target.value)}
                    className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-805 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="cursor-pointer flex-1 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-805"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-submit-aset"
                    type="submit"
                    className="cursor-pointer flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                  >
                    Simpan Aset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
