/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Radio, Disc, Signal, ShieldAlert, CheckCircle2, RefreshCw, Compass, Database, BookOpen, ChevronDown, ChevronUp, Users, AlertTriangle, CloudRain, Shield } from 'lucide-react';
import { Aset, Tiket, MaintenanceLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  asets: Aset[];
  tikets: Tiket[];
  logs: MaintenanceLog[];
  queueLength: number;
  onNavigate: (tab: string) => void;
  isOnline: boolean;
}

export default function Dashboard({ asets, tikets, logs, queueLength, onNavigate, isOnline }: DashboardProps) {
  const [showFishbone, setShowFishbone] = useState(false);

  // Calculates metrics
  const activeOutages = asets.filter(a => a.status === 'GANGGUAN').length;
  const maintenanceCount = asets.filter(a => a.status === 'MAINTENANCE').length;
  const fixedTicketsCount = tikets.filter(t => t.status === 'SELESAI').length;

  return (
    <div id="dashboard-view" className="flex flex-col gap-4">
      {/* Dynamic Government Header Banner */}
      <div id="gov-hero" className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-md">
        {/* Abstract background vector representation of central mountains of Papua */}
        <div className="absolute inset-0 opacity-15 pointer-events-none select-none">
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            <polygon points="0,200 120,40 240,200" fill="#f59e0b" />
            <polygon points="160,200 270,10 380,200" fill="#ffffff" />
            <polygon points="280,200 340,90 400,200" fill="#3b82f6" />
          </svg>
        </div>

        <div className="relative z-10 flex gap-4 items-center">
          {/* Custom crest crest of Kabupaten Intan Jaya (Represented cleanly & artistically as a shield vector) */}
          <div className="w-[64px] h-[72px] shrink-0 bg-sky-500/20 border border-sky-400/40 rounded-xl flex items-center justify-center p-1.5 shadow-inner">
            <svg viewBox="0 0 100 120" className="w-full h-full text-amber-400">
              {/* Crest outline */}
              <path d="M 10,10 Q 50,0 90,10 Q 90,80 50,110 Q 10,80 10,10 Z" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
              <path d="M 15,15 Q 50,5 85,15 Q 85,75 50,105 Q 15,75 15,15 Z" fill="#38bdf8" />
              {/* Gold star */}
              <polygon points="50,18, 54,28 64,28 56,34 59,44 50,38 41,44 44,34 36,28 46,28" fill="#eab308" />
              {/* Mountain symbol of Papua Carstensz */}
              <polygon points="25,75 50,35 75,75" fill="#facc15" />
              <polygon points="40,51 50,35 60,51" fill="#ffffff" />
              {/* Traditional Honai House representation */}
              <path d="M 38,75 Q 50,60 62,75 Z" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1" />
              <rect x="42" y="75" width="16" height="15" fill="#a16207" />
            </svg>
          </div>

          <div>
            <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase">
              Dinas Kominfo Intan Jaya
            </span>
            <h1 className="text-xl font-extrabold tracking-tight mt-0.5">SI-MAMA Mobile</h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-[280px]">
              Sistem Informasi Pemetaan dan Maintenance Aset Network Papua Offline-Friendly.
            </p>
          </div>
        </div>

        {/* Offline notification tag banner */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`} />
            {isOnline ? 'Interkoneksi: Satelit VSAT Online' : 'Koneksi: Offline / Terisolasi'}
          </span>
          <span className="font-mono text-[10px]">Sugapa, Papua Tengah</span>
        </div>
      </div>

      {/* Grid Overview Key Metrics Indicators */}
      <div id="metric-grid" className="grid grid-cols-2 gap-3">
        {/* 1. Outage Metric */}
        <button
          id="btn-nav-outages"
          onClick={() => onNavigate('ASET')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-xs border border-slate-100 hover:border-slate-200 text-left transition dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-xl">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </span>
            {activeOutages > 0 && (
              <span className="bg-red-500 text-white rounded-full w-2.5 h-2.5" />
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">GANGGUAN AKTIF</span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">
            {activeOutages} <span className="text-xs font-normal text-slate-400">Titik Down</span>
          </span>
        </button>

        {/* 2. Total Assets */}
        <button
          id="btn-nav-assets"
          onClick={() => onNavigate('ASET')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-xs border border-slate-100 hover:border-slate-200 text-left transition dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-indigo-50 text-indigo-500 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-xl">
              <Compass className="w-5 h-5" />
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">TOTAL ASET GEOSPASIAL</span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">
            {asets.length} <span className="text-xs font-normal text-slate-400">Infrastruktur</span>
          </span>
        </button>

        {/* 3. Completed issues */}
        <button
          id="btn-nav-tickets"
          onClick={() => onNavigate('TIKET')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-xs border border-slate-100 hover:border-slate-200 text-left transition dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-green-50 text-green-500 dark:bg-green-950/20 dark:text-green-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">TIKET DISELESAIKAN</span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">
            {fixedTicketsCount} <span className="text-xs font-normal text-slate-400">Kasus Selesai</span>
          </span>
        </button>

        {/* 4. Offline Sync Queue */}
        <button
          id="btn-nav-sync"
          onClick={() => onNavigate('SINKRONISASI')}
          className="cursor-pointer bg-white rounded-2xl p-4 shadow-xs border border-slate-100 hover:border-slate-200 text-left transition dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="p-2 bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400 rounded-xl">
              <Database className="w-5 h-5" />
            </span>
            {queueLength > 0 && (
              <span className="bg-amber-400 text-slate-950 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-bounce">
                {queueLength}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ANTREAN LURING</span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">
            {queueLength} <span className="text-xs font-normal text-slate-400">Menunggu Unggah</span>
          </span>
        </button>
      </div>

      {/* 4. Interactive Government Fishbone (Ishikawa) Collapsible Drawer for CPNS Assessment */}
      <div id="fishbone-drawer-card" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <button
          id="btn-toggle-fishbone"
          onClick={() => setShowFishbone(!showFishbone)}
          className="cursor-pointer w-full flex items-center justify-between font-bold text-sm text-slate-805 dark:text-slate-100 text-left focus:outline-none"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4.5 h-4.5 text-amber-400 shrink-0" />
            Latar Belakang Aktualisasi (Ishikawa Fishbone)
          </span>
          {showFishbone ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showFishbone && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100 dark:border-slate-805 mt-3 pt-3 overflow-hidden text-xs"
            >
              {/* Papua Philosophy of SI-MAMA */}
              <div className="bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10 mb-3 text-[12px] leading-relaxed italic text-slate-600 dark:text-slate-300">
                <strong>💡 Filosofi Nama MAMA di Papua:</strong> Di pegunungan tengah Papua, MAMA adalah tiang utama yang merawat, menjaga, dan mengetahui dengan pasti setiap sudut rumahnya. Aplikasi <strong>SI-MAMA</strong> hadir untuk menjaga performa radio VHF/UHF, merawat aset VSAT lewat pelaporan terstruktur, dan mengetahui koordinat geospasial secara presisi.
              </div>

              {/* The responsive Ishikawa diagram styled gorgeously with CSS/SVG */}
              <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-2 text-center">Visualisasi Akar Penyebab Isu (Diagram Tulang Ikan)</p>
              
              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-3 bg-slate-950 text-white overflow-x-auto min-w-[340px] shadow-inner font-mono text-[9px] leading-tight space-y-3">
                
                {/* Method & Human row */}
                <div className="grid grid-cols-2 gap-3 text-slate-350">
                  <div className="border-l-2 border-indigo-500 pl-2">
                    <p className="font-bold text-indigo-400 text-[10px] mb-1">METODE (Methods)</p>
                    <p>&bull; Pencatatan Manual / Arsip kertas</p>
                    <p>&bull; Alur aduan unstructured (WhatsApp)</p>
                  </div>

                  <div className="border-l-2 border-amber-500 pl-2">
                    <p className="font-bold text-amber-400 text-[10px] mb-1">MANUSIA (Manpower)</p>
                    <p>&bull; Keterbatasan pelatihan GIS</p>
                    <p>&bull; Sulit mendeteksi letak Repeater</p>
                  </div>
                </div>

                {/* Spine vector line drawing cleanly with css */}
                <div className="relative py-2 flex items-center">
                  <div className="w-full bg-amber-400 h-0.5 relative">
                    {/* Spine arrow point */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-[6px] border-l-amber-400" />
                  </div>
                  <div className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded text-[8px] tracking-wide shrink-0 ml-1">
                    CORE ISU
                  </div>
                </div>

                {/* Environment & Machine row */}
                <div className="grid grid-cols-2 gap-3 text-slate-350">
                  <div className="border-l-2 border-rose-500 pl-2">
                    <p className="font-bold text-rose-400 text-[10px] mb-1">LINGKUNGAN (Milieu)</p>
                    <p>&bull; Kontur pegunungan ekstrem Papua</p>
                    <p>&bull; Sinyal blank spot total (0G)</p>
                  </div>

                  <div className="border-l-2 border-teal-500 pl-2">
                    <p className="font-bold text-teal-400 text-[10px] mb-1">PERALATAN (Machinery)</p>
                    <p>&bull; Bandwidth VSAT internet satelit terbatas</p>
                    <p>&bull; Tidak ada Handheld GPS Pemda</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[9px] text-center text-amber-400">
                  <strong>Penyelesaian SI-MAMA:</strong> Full Offline Mode + Kompresi Foto &bull; Peta Spasial Vektor
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Quick Outages Alerts & Operations section */}
      <div id="urgent-alerts-card" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100 mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0" />
          Status Gangguan Darurat Perangkat
        </h4>

        {activeOutages > 0 ? (
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {asets.filter(a => a.status === 'GANGGUAN').map(a => (
              <div 
                key={a.id} 
                className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl flex justify-between items-center text-xs gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800 dark:text-slate-205">{a.nama}</span>
                    <span className="bg-red-500 text-white font-extrabold text-[8px] px-1.5 rounded uppercase tracking-wide">Down</span>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-0.5">Distrik {a.distrik} &bull; Lat: {a.latitude} Lng: {a.longitude}</p>
                </div>

                <button
                  id={`quick-nav-resolve-${a.id}`}
                  onClick={() => onNavigate('TIKET')}
                  className="cursor-pointer text-[10px] font-bold bg-indigo-50 hover:bg-indigo-150 text-indigo-750 px-2.5 py-1.5 rounded-lg border border-indigo-150 transition whitespace-nowrap shrink-0"
                >
                  Tinjau Log
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-405 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Semua Jaringan Normal</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Kabupaten Intan Jaya bebas dari gangguan aktif saat ini.</p>
          </div>
        )}
      </div>

      {/* 6. Mobile weather & environmental hazard guide card */}
      <div id="papua-weather-guide" className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex gap-3 text-xs text-slate-650 dark:bg-slate-955/30 dark:border-slate-800 dark:text-slate-400">
        <CloudRain className="w-8 h-8 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-slate-800 dark:text-slate-200">Panduan Lapangan Sugapa:</h5>
          <p className="leading-relaxed mt-0.5 text-[11px]">
            Di Wilayah Intan Jaya, kabut tebal menyelimuti daerah transmisi dari jam 14:00 WIT. Untuk pengerjaan pemeliharaan menara bertenaga surya (solar panel), pastikan melakukan pendakian bukit di pagi hari sebelum jam 10:00 WIT guna pemaksimalan keselamatan kerja.
          </p>
        </div>
      </div>
    </div>
  );
}
