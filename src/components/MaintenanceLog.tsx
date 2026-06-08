/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, X, Upload, Check, Battery, Sun, HelpCircle, Activity, ClipboardList, PenTool, Calendar, User, AlignLeft, Image, Trash, Camera } from 'lucide-react';
import { MaintenanceLog, Aset, KondisiAlat } from '../types';
import { TEKNISI_PILIHAN } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface MaintenanceLogProps {
  logs: MaintenanceLog[];
  asets: Aset[];
  onAddLog: (newLog: Omit<MaintenanceLog, 'id' | 'createdAt'>) => void;
  onDeleteLog: (id: string) => void;
}

export default function MaintenanceLogComponent({ logs, asets, onAddLog, onDeleteLog }: MaintenanceLogProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [asetId, setAsetId] = useState('');
  const [teknisi, setTeknisi] = useState(TEKNISI_PILIHAN[0]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kondisiBaterai, setKondisiBaterai] = useState<KondisiAlat>('BAIK');
  const [kondisiSolarPanel, setKondisiSolarPanel] = useState<KondisiAlat>('BAIK');
  const [teganganSinyal, setTeganganSinyal] = useState('');
  const [cekFisik, setCekFisik] = useState(true);
  const [fotoBukti, setFotoBukti] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Filter state
  const [searchAsetName, setSearchAsetName] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setFotoBukti(compressedDataUrl);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asetId || !teknisi || !tanggal || !catatan.trim()) return;

    onAddLog({
      asetId,
      teknisi,
      tanggal,
      kondisiBaterai,
      kondisiSolarPanel,
      teganganSinyal: teganganSinyal.trim() || 'Normal',
      cekFisik,
      fotoBukti: fotoBukti || undefined,
      catatan,
      asetNama: '' // Managed in App.tsx side effects
    });

    // Reset fields
    setAsetId('');
    setTeknisi(TEKNISI_PILIHAN[0]);
    setTanggal(new Date().toISOString().split('T')[0]);
    setKondisiBaterai('BAIK');
    setKondisiSolarPanel('BAIK');
    setTeganganSinyal('');
    setCekFisik(true);
    setFotoBukti('');
    setCatatan('');
    setShowAddForm(false);

    setSuccessMsg('Rekam Medis Perawatan (Preventive Maintenance) baru berhasil ditambahkan!');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const filteredLogs = logs.filter(log => 
    log.asetNama.toLowerCase().includes(searchAsetName.toLowerCase()) ||
    log.teknisi.toLowerCase().includes(searchAsetName.toLowerCase())
  );

  return (
    <div id="maintenance-view" className="flex flex-col gap-4">
      {/* Control Block with Search */}
      <div id="maintenance-search-card" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            id="search-maintenance-input"
            type="text"
            placeholder="Cari log berdasarkan nama aset atau nama teknisi..."
            value={searchAsetName}
            onChange={(e) => setSearchAsetName(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-sm transition dark:bg-slate-950 dark:border-slate-700"
          />
        </div>

        <button
          id="btn-show-add-maintenance"
          onClick={() => setShowAddForm(true)}
          className="cursor-pointer bg-indigo-655 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Rekam Perawatan
        </button>
      </div>

      {/* Success logs notifications alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/20 text-green-700 border border-green-200 rounded-xl p-3 text-xs flex items-center gap-2 dark:text-green-300 dark:border-green-800"
          >
            <Check className="w-4.5 h-4.5 text-green-500 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-slate-500">Mempunyai <strong>{filteredLogs.length}</strong> catatan riwayat perawatan</span>
      </div>

      {/* Log list timeline view */}
      <div id="maintenance-timeline" className="relative pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-6 pb-12 ml-1">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="relative group">
              
              {/* Pulsating timeline index dot */}
              <div className="absolute -left-[19px] top-1 bg-indigo-500 border-4 border-slate-50 rounded-full w-4 h-4 dark:border-slate-950 z-10 transition group-hover:scale-125" />

              {/* Maintenance content frame */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 dark:bg-slate-900 dark:border-slate-850 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-105">
                      {log.asetNama}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Tanggal Perawatan: <strong>{log.tanggal}</strong>
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Log: {log.id}
                  </span>
                </div>

                {/* Checklist evaluation grid icons */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 my-1 dark:border-slate-805">
                  {/* Battery */}
                  <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-955/40 text-center">
                    <Battery className={`w-4 h-4 mb-1 ${
                      log.kondisiBaterai === 'BAIK' ? 'text-green-500' :
                      log.kondisiBaterai === 'CUKUP' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 block">Baterai (DC)</span>
                    <span className="text-[10px] font-bold text-slate-755 dark:text-slate-200">{log.kondisiBaterai}</span>
                  </div>

                  {/* Solar panel */}
                  <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-955/40 text-center">
                    <Sun className={`w-4 h-4 mb-1 ${
                      log.kondisiSolarPanel === 'BAIK' ? 'text-green-550' :
                      log.kondisiSolarPanel === 'CUKUP' ? 'text-yellow-550' : 'text-red-550'
                    }`} />
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 block">Solar Panel</span>
                    <span className="text-[10px] font-bold text-slate-755 dark:text-slate-200">{log.kondisiSolarPanel}</span>
                  </div>

                  {/* Signal voltage */}
                  <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-955/40 text-center">
                    <Activity className="w-4 h-4 mb-1 text-indigo-500" />
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 block">Sinyal / Tegangan</span>
                    <span className="text-[10px] font-bold text-slate-755 dark:text-slate-250 truncate w-full max-w-full" title={log.teganganSinyal}>
                      {log.teganganSinyal}
                    </span>
                  </div>
                </div>

                {/* Checklist physical evaluation */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold text-white ${
                    log.cekFisik ? 'bg-green-550 border-green-600' : 'bg-red-400 border-red-500'
                  }`}>
                    {log.cekFisik ? '✓' : '✗'}
                  </span>
                  <span>Kebersihan & pemeriksaan fisik alat: <strong>{log.cekFisik ? 'Sudah Di-cek' : 'Belum Lengkap'}</strong></span>
                </div>

                {/* Catatan / Notes */}
                <p className="text-xs text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-955/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-805 leading-relaxed">
                  <AlignLeft className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  <strong>Detail Laporan Kerja:</strong> {log.catatan}
                </p>

                {/* Photo attachment representation */}
                {log.fotoBukti && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-105 bg-slate-900 mt-1 max-h-[150px]">
                    <img src={log.fotoBukti} alt="Bukti Preventive Maintenance" className="w-full h-full object-cover max-h-[140px]" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-2 right-2 bg-black/60 text-[9px] px-1.5 py-0.5 rounded text-white font-mono">
                      Bukti Foto Kompresi WebP
                    </span>
                  </div>
                )}

                {/* Footer with technician and delete log actions */}
                <div className="flex justify-between items-center text-xs text-slate-450 pt-2 border-t border-slate-50 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-430" />
                    Pemeriksa: <strong>{log.teknisi}</strong>
                  </span>

                  <button
                    id={`delete-log-${log.id}`}
                    onClick={() => {
                      if (confirm(`Hapus registrasi log perawatan dengan ID: ${log.id}?`)) {
                        onDeleteLog(log.id);
                      }
                    }}
                    className="cursor-pointer text-slate-400 hover:text-red-500 p-1 rounded-md transition"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 ml-1">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Tidak ada jurnal log ditemukan</p>
            <p className="text-xs">Ubah kata pencarian atau buat entri baru untuk mengisi riwayat perawatan.</p>
          </div>
        )}
      </div>

      {/* Add Maintenance Jurnal log dialog overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              id="add-maintenance-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-806 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-805">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-indigo-500" />
                  Buat Jurnal Perawatan Berkala
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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Perangkat yang Dirawat *</label>
                  <select
                    id="form-mnt-asetid"
                    required
                    value={asetId}
                    onChange={(e) => setAsetId(e.target.value)}
                    className="w-full text-slate-805 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                  >
                    <option value="">-- Pilih Alat --</option>
                    {asets.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.jenis}] {a.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PJ and Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Teknisi Penguji</label>
                    <select
                      id="form-mnt-teknisi"
                      value={teknisi}
                      onChange={(e) => setTeknisi(e.target.value)}
                      className="w-full text-slate-805 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    >
                      {TEKNISI_PILIHAN.map(tek => (
                        <option key={tek} value={tek}>{tek}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tanggal Kegiatan</label>
                    <input
                      id="form-mnt-tanggal"
                      type="date"
                      required
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full text-slate-805 border border-slate-205 px-3 py-1.5 rounded-xl text-xs dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Param checklists baterai and solar panels */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-550 mb-1 flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-green-500" />
                      Kondisi Baterai (DC)
                    </label>
                    <select
                      id="form-mnt-baterai"
                      value={kondisiBaterai}
                      onChange={(e) => setKondisiBaterai(e.target.value as KondisiAlat)}
                      className="w-full text-slate-800 border border-slate-200 bg-white px-2 py-1 rounded-lg text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none"
                    >
                      <option value="BAIK">🟢 BAIK (13.5V+)</option>
                      <option value="CUKUP">🟡 CUKUP (12V - 13.4V)</option>
                      <option value="BURUK">🔴 BURUK (Drop / Ganti)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-550 mb-1 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Kondisi Solar Panel
                    </label>
                    <select
                      id="form-mnt-solar"
                      value={kondisiSolarPanel}
                      onChange={(e) => setKondisiSolarPanel(e.target.value as KondisiAlat)}
                      className="w-full text-slate-800 border border-slate-200 bg-white px-2 py-1 rounded-lg text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none"
                    >
                      <option value="BAIK">🟢 BAIK (Bersih / Arus OK)</option>
                      <option value="CUKUP">🟡 CUKUP (Berdebu / Rerimbun)</option>
                      <option value="BURUK">🔴 BURUK (Retak / Rusak)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      Sinyal / Tegangan Alat
                    </label>
                    <input
                      id="form-mnt-sinyal"
                      type="text"
                      required
                      placeholder="Misal: 13.8V | SWR: 1.1"
                      value={teganganSinyal}
                      onChange={(e) => setTeganganSinyal(e.target.value)}
                      className="w-full text-slate-805 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-4 select-none">
                    <input
                      id="form-mnt-cekfisik"
                      type="checkbox"
                      checked={cekFisik}
                      onChange={(e) => setCekFisik(e.target.checked)}
                      className="cursor-pointer w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="form-mnt-cekfisik" className="cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Pembersihan Fisik Selesai
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Catatan Hasil Kalibrasi / Perbaikan *</label>
                  <textarea
                    id="form-mnt-catatan"
                    required
                    rows={3}
                    placeholder="Contoh: Mengganti terminal MC4 solar panel, memangkas ranting pohon yang menutupi parabola VSAT..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full text-slate-805 border border-slate-205 px-3 py-2 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Photo attachment representation */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-dashed border-slate-205 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-indigo-505" />
                    Lampirkan Bukti Foto Perawatan (Kamera/Galeri HP)
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
                      <Upload className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      Jepret / Cari Foto
                      <input
                        id="form-mnt-file"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {isCompressing ? (
                      <span className="text-[10px] text-indigo-500 animate-pulse font-mono">Mengompres Foto...</span>
                    ) : fotoBukti ? (
                      <span className="text-[10px] text-green-550 font-bold font-mono">FOTO KOMPRES OK</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Belum ada foto</span>
                    )}
                  </div>

                  {fotoBukti && (
                    <div className="mt-2.5 relative w-[80px] h-[80px] rounded-lg overflow-hidden border border-slate-200">
                      <img src={fotoBukti} alt="Bukti terkompresi" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotoBukti('')}
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
                    id="btn-submit-mnt"
                    type="submit"
                    className="cursor-pointer flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                  >
                    Simpan Jurnal
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
