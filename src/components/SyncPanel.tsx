/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Download, Upload, Trash2, Database, AlertTriangle, Layers, CheckCircle2, History } from 'lucide-react';
import { SyncItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SyncPanelProps {
  queue: SyncItem[];
  isOnline: boolean;
  onToggleOnline: () => void;
  onSyncAll: () => Promise<void>;
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => boolean;
  onResetDatabase: () => void;
}

export default function SyncPanel({
  queue,
  isOnline,
  onToggleOnline,
  onSyncAll,
  onExportBackup,
  onImportBackup,
  onResetDatabase
}: SyncPanelProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncPercentage, setSyncPercentage] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const handleSyncClick = async () => {
    if (!isOnline) {
      setErrorMsg('Tidak dapat mengunggah: Koneksi jaringan terputus (Sedang luring/offline).');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (queue.length === 0) {
      setSuccessMsg('Antrean kosong! Semua data lokal sudah sinkron dengan server pusat.');
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }

    setSyncing(true);
    setSyncPercentage(15);
    
    // Simulate multi-stage network stream to server
    const interval = setInterval(() => {
      setSyncPercentage(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 250);

    try {
      await onSyncAll();
      clearInterval(interval);
      setSyncPercentage(100);
      setTimeout(() => {
        setSyncing(false);
        setSyncPercentage(0);
        setSuccessMsg('Sinkronisasi Berhasil! Antrean lokal telah diunggah ke database PostgreSQL pusat.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setSyncing(false);
      setErrorMsg('Koneksi terganggu/latensi tinggi VSAT Satelit. Silakan coba kembali.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleImportTextSubmit = () => {
    if (!importText.trim()) return;
    const success = onImportBackup(importText);
    if (success) {
      setSuccessMsg('Database lokal berhasil dipulihkan dari file backup!');
      setImportText('');
      setShowImportArea(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg('Format backup JSON tidak valid atau struktur tidak cocok dengan skema SI-MAMA.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const triggerFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = onImportBackup(content);
      if (success) {
        setSuccessMsg('Sukses memulihkan database dari file backup!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg('Gagal memulihkan: Format berkas tidak cocok.');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="sync-panel-view" className="flex flex-col gap-4">
      {/* 1. Offline Mode Simulator Switcher */}
      <div id="signal-simulator" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          Status Koneksi Jaringan (VSAT Satelit)
        </h4>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Gunakan tombol di bawah ini untuk mensimulasikan kondisi blank spot ekstrem ($0$G) di pedalaman kabupaten Intan Jaya.
        </p>

        <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <button
            id="sim-online-btn"
            onClick={() => {
              if (!isOnline) onToggleOnline();
            }}
            className={`cursor-pointer flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              isOnline 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-950/20'
            }`}
          >
            <Wifi className="w-4 h-4" />
            ONLINE (Ada Sinyal)
          </button>
          <button
            id="sim-offline-btn"
            onClick={() => {
              if (isOnline) onToggleOnline();
            }}
            className={`cursor-pointer flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              !isOnline 
                ? 'bg-rose-500 text-white' 
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-950/20'
            }`}
          >
            <WifiOff className="w-4 h-4" />
            BLANK SPOT (Luring)
          </button>
        </div>
      </div>

      {/* Synchronize state notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/20 text-green-700 border border-green-200 rounded-xl p-3 text-xs flex items-center gap-2 dark:text-green-300 dark:border-green-800"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-green-500 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/20 text-red-700 border border-red-200 rounded-xl p-3 text-xs flex items-center gap-2 dark:text-red-300 dark:border-red-800"
          >
            <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Upload Synchronize Queue Console */}
      <div id="sync-console" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2.5">
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-105 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" />
              Antrean Unggah Data Luring
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Data pengerjaan yang belum tersinkronisasi: <strong>{queue.length} item</strong>
            </p>
          </div>

          <button
            id="btn-sync-submit"
            disabled={syncing}
            onClick={handleSyncClick}
            className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              queue.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? `Mengunggah (${syncPercentage}%)` : 'Singkronkan Data'}
          </button>
        </div>

        {/* Sync Progress scale bar */}
        {syncing && (
          <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden mb-3">
            <motion.div 
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${syncPercentage}%` }}
              layout
            />
          </div>
        )}

        {/* List of Offline Queue Entries */}
        {queue.length > 0 ? (
          <div className="border border-slate-150 dark:border-slate-800 rounded-xl divide-y divide-slate-150 dark:divide-slate-800 overflow-hidden max-h-[160px] overflow-y-auto">
            {queue.map((item, index) => (
              <div key={item.id} className="p-2.5 text-xs flex justify-between bg-slate-50/50 dark:bg-slate-950/20 items-center">
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.tipe === 'ASET_NEW' && '📡 Penambahan Aset Hardware'}
                      {item.tipe === 'TIKET_NEW' && '🚨 Pembuatan Tiket Gangguan'}
                      {item.tipe === 'TIKET_UPDATE' && '⚙️ Pembaharuan Status Tiket'}
                      {item.tipe === 'MAINTENANCE_NEW' && '🛠️ Pengisian Log Maintenance'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Disimpan lokal: {new Date(item.timestamp).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md">
                  Luring
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-955/20">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Semua Data Sinkron</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Tidak ditemukan data pending di antrean luring.</p>
          </div>
        )}
      </div>

      {/* 3. Offline Backup export / import center */}
      <div id="offline-bridge" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5">
          <History className="w-4 h-4 text-indigo-500" />
          Transfer Data Antar-Teknisi (Tanpa Internet)
        </h4>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Di area pedalaman tanpa internet VSAT sama sekali, download file backup ini dan kirimkan ke sesama rekan teknisi via Bluetooth / ShareIt / Kabel USB untuk saling mentransfer basis data kerja.
        </p>

        <div className="flex gap-2 mb-3">
          <button
            id="btn-export-db"
            onClick={onExportBackup}
            className="cursor-pointer flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-indigo-150 transition"
          >
            <Download className="w-4 h-4" />
            Ekspor File Backup
          </button>

          <button
            id="btn-toggle-import-pane"
            onClick={() => setShowImportArea(!showImportArea)}
            className="cursor-pointer flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
          >
            <Upload className="w-4 h-4" />
            {showImportArea ? 'Tutup Panel Impor' : 'Impor File Backup'}
          </button>
        </div>

        {/* File upload input fallback */}
        {showImportArea && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-slate-100 dark:border-slate-805 pt-3 flex flex-col gap-2.5"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cara 1: Unggah berkas backup (.json)</label>
              <input
                id="file-import-input"
                type="file"
                accept=".json"
                onChange={triggerFileInput}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Cara 2: Tempel teks backup JSON</label>
              <textarea
                id="text-import-area"
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Tempel salinan teks kode backup JSON di sini...'
                className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-[10px] rounded-xl focus:outline-none"
              />
              <button
                id="btn-import-submit"
                onClick={handleImportTextSubmit}
                className="cursor-pointer bg-indigo-650 text-white font-bold text-xs py-2 rounded-xl"
              >
                Terapkan Impor JSON
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 4. Dangerous Factory Reset Section */}
      <div id="danger-field" className="bg-red-500/5 rounded-2xl p-4 shadow-sm border border-red-500/10 dark:bg-red-950/10">
        <h4 className="font-bold text-sm text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5">
          <AlertTriangle className="w-4.5 h-4.5" />
          Tindakan Pembersihan Sistem
        </h4>
        <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">
          Tindakan ini menghapus seluruh penambahan data lokal Anda dan memulihkan database ke draf pangkalan data awal Kabupaten Intan Jaya.
        </p>

        <button
          id="btn-reset-db"
          onClick={() => {
            if (confirm('PERINGATAN! Anda akan menghapus seluruh database lokal SI-MAMA dan mengembalikan ke setelan awal. Tindakan ini tidak dapat dibatalkan. Setuju?')) {
              onResetDatabase();
              setSuccessMsg('Sistem berhasil di-reset kembali ke baseline dasar!');
              setTimeout(() => setSuccessMsg(''), 4000);
            }
          }}
          className="cursor-pointer w-full py-2.5 border border-red-200 hover:bg-red-500 hover:text-white text-red-650 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
        >
          <Trash2 className="w-4 h-4" />
          Bersihkan/Reset Database Lokal
        </button>
      </div>
    </div>
  );
}
