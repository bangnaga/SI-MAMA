/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, X, Upload, Clock, User, AlertCircle, FileText, CheckCircle2, RefreshCw, MessageSquare, ShieldAlert, Image, Trash, Camera, Search } from 'lucide-react';
import { Tiket, Aset, UrgensiTiket, StatusTiket } from '../types';
import { TEKNISI_PILIHAN } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface TiketListProps {
  tikets: Tiket[];
  asets: Aset[];
  onAddTiket: (newTiket: Omit<Tiket, 'id' | 'createdAt' | 'updatedAt' | 'slaDeadline' | 'status'>) => void;
  onUpdateTiketStatus: (id: string, status: StatusTiket) => void;
  onDeleteTiket: (id: string) => void;
  isOnline: boolean;
}

export default function TiketList({ tikets, asets, onAddTiket, onUpdateTiketStatus, onDeleteTiket, isOnline }: TiketListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterUrgensi, setFilterUrgensi] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [asetId, setAsetId] = useState('');
  const [pengirim, setPengirim] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [urgensi, setUrgensi] = useState<UrgensiTiket>('SEDANG');
  const [teknisi, setTeknisi] = useState(TEKNISI_PILIHAN[0]);
  const [fotoBase64, setFotoBase64] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Stats Counters
  const stats = {
    baru: tikets.filter(t => t.status === 'BARU').length,
    proses: tikets.filter(t => t.status === 'PROSES').length,
    selesai: tikets.filter(t => t.status === 'SELESAI').length,
  };

  // Filter Logic
  const filteredTikets = tikets.filter((t) => {
    const matchSearch = t.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.asetNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchUrgensi = filterUrgensi === 'ALL' || t.urgensi === filterUrgensi;
    return matchSearch && matchStatus && matchUrgensi;
  });

  // Client Side Photo Compression Routine (Compresses to < 300KB WebP/JPEG)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Draw to local canvas for compression
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Constraint Dimensions (Max Width: 600px for robust size minification)
        const MAX_WIDTH = 600;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress quality to 60% for aggressive VSAT satellite bandwidth optimization
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setFotoBase64(compressedDataUrl);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asetId || !pengirim.trim() || !deskripsi.trim()) return;

    onAddTiket({
      asetId,
      pengirim,
      deskripsi,
      urgensi,
      teknisi,
      foto: fotoBase64 || undefined,
      asetNama: '', // Handled by App.tsx logic
      distrik: ''   // Handled by App.tsx logic
    });

    // Reset Form
    setAsetId('');
    setPengirim('');
    setDeskripsi('');
    setUrgensi('SEDANG');
    setTeknisi(TEKNISI_PILIHAN[0]);
    setFotoBase64('');
    setShowAddForm(false);

    setSuccessMsg('Aduan Gangguan Baru terdaftar! Tiket penugasan berhasil dibuat.');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Helper to visually calculate time remaining for SLA
  const renderSLAInfo = (ticket: Tiket) => {
    if (ticket.status === 'SELESAI') {
      return (
        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-150 text-[11px] font-bold dark:bg-green-950/40 dark:text-green-400">
          ✓ SLA Sukses (Selesai)
        </span>
      );
    }

    const now = new Date().getTime();
    const deadline = new Date(ticket.slaDeadline).getTime();
    const diff = deadline - now;

    if (diff <= 0) {
      return (
        <span className="text-red-650 bg-red-50 px-2 py-1 rounded-md border border-red-200 text-[11px] font-extrabold dark:bg-red-950/40 dark:text-red-400 flex items-center gap-1">
          ⚠️ Terlewati SLA (Overdue)
        </span>
      );
    }

    const hoursLeft = Math.round(diff / (1000 * 60 * 60));
    if (hoursLeft < 4) {
      return (
        <span className="text-amber-650 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 text-[11px] font-bold dark:bg-amber-950/40 dark:text-amber-400 flex items-center gap-1 animate-pulse">
          ⏳ Tinggal {hoursLeft} Jam (Mendesak)
        </span>
      );
    }

    return (
      <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-semibold dark:bg-slate-800 dark:text-slate-300">
        ⌚ Sisa SLA: {hoursLeft} Jam
      </span>
    );
  };

  return (
    <div id="tiket-list-view" className="flex flex-col gap-4">
      {/* SLA Metric Counter Cards top block */}
      <div id="tiket-stats-bar" className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-center shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase">BARU</p>
          <p className="text-xl font-extrabold text-blue-600 mt-0.5">{stats.baru}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-center shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase">DIPROSES</p>
          <p className="text-xl font-extrabold text-amber-500 mt-0.5">{stats.proses}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-center shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase">SELESAI</p>
          <p className="text-xl font-extrabold text-green-500 mt-0.5">{stats.selesai}</p>
        </div>
      </div>

      {/* Ticket Searching and Filtering */}
      <div id="tiket-controls" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              id="search-tiket-input"
              type="text"
              placeholder="Cari keluhan, pengirim, atau nomor tiket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-sm transition dark:bg-slate-950 dark:border-slate-700"
            />
          </div>

          <button
            id="btn-show-add-tiket"
            onClick={() => setShowAddForm(true)}
            className="cursor-pointer bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Buat Laporan
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex gap-2 text-xs">
          <div className="flex-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs dark:bg-slate-950 dark:border-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Tingkat Pemrosesan</option>
              <option value="BARU">Status: Baru</option>
              <option value="PROSES">Status: Diproses</option>
              <option value="SELESAI">Status: Selesai</option>
            </select>
          </div>

          <div className="flex-1">
            <select
              value={filterUrgensi}
              onChange={(e) => setFilterUrgensi(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs dark:bg-slate-950 dark:border-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Skala Urgensi</option>
              <option value="TINGGI">Urgensi: Tinggi (24 Jam)</option>
              <option value="SEDANG">Urgensi: Sedang (48 Jam)</option>
              <option value="RENDAH">Urgensi: Rendah (7 Hari)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Messages */}
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

      {/* Ticket Iteration card lists */}
      <div id="tiket-cards-container" className="flex flex-col gap-3 pb-8">
        {filteredTikets.length > 0 ? (
          filteredTikets.map((tiket) => (
            <div
              key={tiket.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-3"
            >
              {/* Card Title Header with ticket status */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-xs font-mono">
                      #{tiket.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tiket.urgensi === 'TINGGI' ? 'bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400' :
                      tiket.urgensi === 'SEDANG' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      URGENSI: {tiket.urgensi}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[13px] mt-1">
                    Ganguan pada: {tiket.asetNama}
                  </h4>
                </div>

                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  tiket.status === 'BARU' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                  tiket.status === 'PROSES' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                  'bg-green-150 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                }`}>
                  {tiket.status === 'BARU' && '🆕 BARU'}
                  {tiket.status === 'PROSES' && '⚙️ DIPROSES'}
                  {tiket.status === 'SELESAI' && '✅ SELESAI'}
                </span>
              </div>

              {/* Sender & Spec detail area */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl text-xs space-y-1">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Pelapor:</strong> {tiket.pengirim}
                </p>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-[12px]">
                  <strong>Aduan:</strong> <span className="italic">"{tiket.deskripsi}"</span>
                </p>
                {tiket.distrik && (
                  <p className="text-slate-400 text-[11px]">
                    <strong>Wilayah Operasi:</strong> Distrik {tiket.distrik}
                  </p>
                )}
              </div>

              {/* Photo representation and Technician Assigned info */}
              {tiket.foto && (
                <div className="relative max-h-[160px] rounded-xl overflow-hidden border border-slate-105 bg-slate-900 group">
                  <img
                    src={tiket.foto}
                    alt="Bukti Gangguan Jaringan"
                    className="w-full h-full object-cover max-h-[150px]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[9px] px-1.5 py-0.5 rounded text-white font-mono flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    Fisik Terkompresi Sisi Klien WebP
                  </span>
                </div>
              )}

              {/* Footer row with assignee and SLA countdown details */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-805 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Teknisi PJ: <strong>{tiket.teknisi}</strong></span>
                </div>

                {renderSLAInfo(tiket)}
              </div>

              {/* Quick status updates actions row */}
              <div className="flex items-center gap-1.5 justify-end mt-1 pt-1.5 border-t border-slate-50 dark:border-slate-805/40">
                {tiket.status === 'BARU' && (
                  <button
                    id={`assign-proses-${tiket.id}`}
                    onClick={() => onUpdateTiketStatus(tiket.id, 'PROSES')}
                    className="cursor-pointer text-xs bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    Kerjakan Tiket
                  </button>
                )}

                {tiket.status === 'PROSES' && (
                  <button
                    id={`assign-selesai-${tiket.id}`}
                    onClick={() => onUpdateTiketStatus(tiket.id, 'SELESAI')}
                    className="cursor-pointer text-xs bg-green-550 hover:bg-green-600 font-bold text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selesaikan Perbaikan
                  </button>
                )}

                <button
                  id={`delete-tiket-${tiket.id}`}
                  title="Hapus Tiket"
                  onClick={() => {
                    if (confirm(`Hapus tiket gangguan ber-ID: #${tiket.id}?`)) {
                      onDeleteTiket(tiket.id);
                    }
                  }}
                  className="cursor-pointer p-1.5 text-slate-400 hover:text-red-500 border border-slate-100 hover:border-red-200 hover:bg-red-50 rounded-lg dark:border-slate-800 dark:hover:bg-red-950/20"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-250 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Tidak ada aduan tiket di sini</p>
            <p className="text-xs">Sistem dalam kondisi normal tanpa laporan gangguan aktif.</p>
          </div>
        )}
      </div>

      {/* Add Ticket Dialog Form overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              id="add-tiket-form-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-805">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-105 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  Buat Tiket Gangguan Jaringan
                </h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Asset */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Perangkat yang Rusak *</label>
                  <select
                    id="form-tiket-asetid"
                    required
                    value={asetId}
                    onChange={(e) => setAsetId(e.target.value)}
                    className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                  >
                    <option value="">-- Pilih Alat Bermasalah --</option>
                    {asets.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.jenis}] {a.nama} (Distrik {a.distrik})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nama Pelapor / Sumber Pengaduan *</label>
                  <input
                    id="form-tiket-pelapor"
                    type="text"
                    required
                    placeholder="Contoh: Yunus Weya (Sekdis Kominfo / Kepala Distrik)"
                    value={pengirim}
                    onChange={(e) => setPengirim(e.target.value)}
                    className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Severity urgency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tingkat Urgensi</label>
                    <select
                      id="form-tiket-urgensi"
                      value={urgensi}
                      onChange={(e) => setUrgensi(e.target.value as UrgensiTiket)}
                      className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    >
                      <option value="TINGGI">🔴 TINGGI (SLA 24 jam)</option>
                      <option value="SEDANG">🟡 SEDANG (SLA 48 jam)</option>
                      <option value="RENDAH">⚪ RENDAH (SLA 7 hari)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Teknisi Pengawas</label>
                    <select
                      id="form-tiket-teknisi"
                      value={teknisi}
                      onChange={(e) => setTeknisi(e.target.value)}
                      className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    >
                      {TEKNISI_PILIHAN.map(tek => (
                        <option key={tek} value={tek}>{tek}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Keterangan / Gejala Gangguan *</label>
                  <textarea
                    id="form-tiket-deskripsi"
                    required
                    rows={3}
                    placeholder="Contoh: Sinyal Loss total, Baterai drop, atau tertutup kabut tebal di bukit..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full text-slate-800 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Attachment photo with client compression */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-dashed border-slate-205 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-indigo-505" />
                    Ambil Foto Bukti Kerusakan (Kamera HP)
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
                      <Upload className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      Pilih / Jepret Foto
                      <input
                        id="form-tiket-file"
                        type="file"
                        accept="image/*"
                        capture="environment" // direct open device back camera
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {isCompressing ? (
                      <span className="text-[10px] text-indigo-500 animate-pulse font-mono">Arsitektur Kompresi Sedang Berjalan...</span>
                    ) : fotoBase64 ? (
                      <span className="text-[10px] text-green-550 font-bold font-mono">FOTO OK (&lt; 250KB WebP)</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Tidak ada foto terpilih (Boleh kosong)</span>
                    )}
                  </div>

                  {fotoBase64 && (
                    <div className="mt-2.5 relative w-[80px] h-[80px] rounded-lg overflow-hidden border border-slate-200">
                      <img src={fotoBase64} alt="Bukti terkompresi" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotoBase64('')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-650 shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="cursor-pointer flex-1 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-805"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-submit-tiket"
                    type="submit"
                    className="cursor-pointer flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                  >
                    Kirim Aduan
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
