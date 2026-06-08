/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Home, Compass, Layers, ShieldAlert, ClipboardList, Database, Wifi, WifiOff, RefreshCw, Battery, Signal } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AsetMap from './components/AsetMap';
import AsetList from './components/AsetList';
import TiketList from './components/TiketList';
import MaintenanceLogComponent from './components/MaintenanceLog';
import SyncPanel from './components/SyncPanel';
import { Aset, Tiket, MaintenanceLog, SyncItem, StatusAset, StatusTiket } from './types';
import { INITIAL_ASETS, INITIAL_TIKETS, INITIAL_MAINTENANCE } from './data/mockData';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  
  // Core localStorage Database states
  const [asets, setAsets] = useState<Aset[]>(() => {
    const local = localStorage.getItem('SI_MAMA_ASETS');
    return local ? JSON.parse(local) : INITIAL_ASETS;
  });

  const [tikets, setTikets] = useState<Tiket[]>(() => {
    const local = localStorage.getItem('SI_MAMA_TIKETS');
    return local ? JSON.parse(local) : INITIAL_TIKETS;
  });

  const [logs, setLogs] = useState<MaintenanceLog[]>(() => {
    const local = localStorage.getItem('SI_MAMA_MAINTENANCE_LOGS');
    return local ? JSON.parse(local) : INITIAL_MAINTENANCE;
  });

  const [syncQueue, setSyncQueue] = useState<SyncItem[]>(() => {
    const local = localStorage.getItem('SI_MAMA_SYNC_QUEUE');
    return local ? JSON.parse(local) : [];
  });

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const local = localStorage.getItem('SI_MAMA_ONLINE_STATE');
    return local ? JSON.parse(local) : true;
  });

  // Clock state for mock phone status bar
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save states to local storage on modification
  useEffect(() => {
    localStorage.setItem('SI_MAMA_ASETS', JSON.stringify(asets));
  }, [asets]);

  useEffect(() => {
    localStorage.setItem('SI_MAMA_TIKETS', JSON.stringify(tikets));
  }, [tikets]);

  useEffect(() => {
    localStorage.setItem('SI_MAMA_MAINTENANCE_LOGS', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('SI_MAMA_SYNC_QUEUE', JSON.stringify(syncQueue));
  }, [syncQueue]);

  useEffect(() => {
    localStorage.setItem('SI_MAMA_ONLINE_STATE', JSON.stringify(isOnline));
  }, [isOnline]);

  // Handler: Turn online/offline
  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  // Handler: Add Asset
  const handleAddAset = (newAset: Omit<Aset, 'id' | 'createdAt'>) => {
    const generatedId = `ast-${100 + asets.length + 1}`;
    const cleanAset: Aset = {
      ...newAset,
      id: generatedId,
      createdAt: new Date().toISOString()
    };

    setAsets(prev => [cleanAset, ...prev]);

    // Add to sync queue if offline
    if (!isOnline) {
      const queueItem: SyncItem = {
        id: `q-${Date.now()}`,
        tipe: 'ASET_NEW',
        payload: cleanAset,
        timestamp: new Date().toISOString()
      };
      setSyncQueue(prev => [...prev, queueItem]);
    }
  };

  // Handler: Update Asset Operating Status
  const handleUpdateStatus = (id: string, newStatus: StatusAset) => {
    setAsets(prev => 
      prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
    );

    // If offline, add to sync queue
    if (!isOnline) {
      const queueItem: SyncItem = {
        id: `q-${Date.now()}`,
        tipe: 'TIKET_UPDATE',
        payload: { id, targetStatus: newStatus },
        timestamp: new Date().toISOString()
      };
      setSyncQueue(prev => [...prev, queueItem]);
    }
  };

  // Handler: Delete Asset
  const handleDeleteAset = (id: string) => {
    setAsets(prev => prev.filter(a => a.id !== id));
    // Also cleanup associated logs/tickets
    setTikets(prev => prev.filter(t => t.asetId !== id));
    setLogs(prev => prev.filter(l => l.asetId !== id));
  };

  // Handler: Add Ticket Outage
  const handleAddTiket = (newTiket: Omit<Tiket, 'id' | 'createdAt' | 'updatedAt' | 'slaDeadline' | 'status'>) => {
    const generatedId = `TKT-${100 + tikets.length + 1}`;
    
    // Find associated asset details
    const targetAset = asets.find(a => a.id === newTiket.asetId);
    const assetNama = targetAset ? targetAset.nama : 'Unknown Device';
    const distrik = targetAset ? targetAset.distrik : 'Sugapa';

    // Calculate SLA target
    const now = new Date();
    if (newTiket.urgensi === 'TINGGI') {
      now.setHours(now.getHours() + 24); // 24 hours
    } else if (newTiket.urgensi === 'SEDANG') {
      now.setHours(now.getHours() + 48); // 48 hours
    } else {
      now.setHours(now.getHours() + 168); // 7 days
    }

    const cleanTiket: Tiket = {
      ...newTiket,
      id: generatedId,
      asetNama: assetNama,
      distrik,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: now.toISOString(),
      status: 'BARU'
    };

    setTikets(prev => [cleanTiket, ...prev]);

    // Automatically set associated asset state to "GANGGUAN"
    setAsets(prev => 
      prev.map(a => a.id === newTiket.asetId ? { ...a, status: 'GANGGUAN' } : a)
    );

    // If offline, queue action
    if (!isOnline) {
      const queueItem: SyncItem = {
        id: `q-${Date.now()}`,
        tipe: 'TIKET_NEW',
        payload: cleanTiket,
        timestamp: new Date().toISOString()
      };
      setSyncQueue(prev => [...prev, queueItem]);
    }
  };

  // Handler: Update Ticket Outage status
  const handleUpdateTiketStatus = (tiketId: string, newStatus: StatusTiket) => {
    setTikets(prev => 
      prev.map(t => t.id === tiketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t)
    );

    // If status is "SELESAI", restore corresponding active asset to "AKTIF" status automatically!
    if (newStatus === 'SELESAI') {
      const targetTicket = tikets.find(t => t.id === tiketId);
      if (targetTicket) {
        setAsets(prev => 
          prev.map(a => a.id === targetTicket.asetId ? { ...a, status: 'AKTIF' } : a)
        );
      }
    }

    // If offline, queue action description
    if (!isOnline) {
      const queueItem: SyncItem = {
        id: `q-${Date.now()}`,
        tipe: 'TIKET_UPDATE',
        payload: { id: tiketId, targetStatus: newStatus },
        timestamp: new Date().toISOString()
      };
      setSyncQueue(prev => [...prev, queueItem]);
    }
  };

  // Handler: Delete Ticket
  const handleDeleteTiket = (id: string) => {
    setTikets(prev => prev.filter(t => t.id !== id));
  };

  // Handler: Add Maintenance Jurnal log
  const handleAddMaintenanceLog = (newLog: Omit<MaintenanceLog, 'id' | 'createdAt'>) => {
    const generatedId = `MNT-${100 + logs.length + 1}`;
    
    const targetAset = asets.find(a => a.id === newLog.asetId);
    const assetNama = targetAset ? targetAset.nama : 'Unknown Device';

    const cleanLog: MaintenanceLog = {
      ...newLog,
      id: generatedId,
      asetNama: assetNama,
      createdAt: new Date().toISOString()
    };

    setLogs(prev => [cleanLog, ...prev]);

    // If physical audit was doublechecked & battery is good, restore status to normal AKTIF
    if (newLog.cekFisik && newLog.kondisiBaterai === 'BAIK') {
      setAsets(prev => 
        prev.map(a => a.id === newLog.asetId ? { ...a, status: 'AKTIF' } : a)
      );
    }

    // If offline, add to Sync Queue
    if (!isOnline) {
      const queueItem: SyncItem = {
        id: `q-${Date.now()}`,
        tipe: 'MAINTENANCE_NEW',
        payload: cleanLog,
        timestamp: new Date().toISOString()
      };
      setSyncQueue(prev => [...prev, queueItem]);
    }
  };

  // Handler: Delete Log
  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  // Action: Synchronize queue offline list
  const handleSyncAll = async () => {
    // Artificial latency loader stream
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncQueue([]);
  };

  // Database Backup: Export JSON
  const handleExportBackup = () => {
    const databaseBackupObj = {
      asets,
      tikets,
      logs,
      syncQueue
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(databaseBackupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SI_MAMA_BATALION_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Database Backup: Import JSON file
  const handleImportBackup = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.asets && parsed.tikets && parsed.logs) {
        setAsets(parsed.asets);
        setTikets(parsed.tikets);
        setLogs(parsed.logs);
        if (parsed.syncQueue) setSyncQueue(parsed.syncQueue);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Factory reset
  const handleResetDatabase = () => {
    setAsets(INITIAL_ASETS);
    setTikets(INITIAL_TIKETS);
    setLogs(INITIAL_MAINTENANCE);
    setSyncQueue([]);
    setIsOnline(true);
    localStorage.clear();
  };

  // Trigger click placement on map redirecting to list form
  const handleMapAddAsetRedirect = (lat: number, lng: number) => {
    setActiveTab('ASET');
    // We could pre-open modal, the component handles that nicely
  };

  return (
    <div id="applet-viewport" className="min-h-screen bg-slate-950 flex items-center justify-center py-0 sm:py-8 font-sans transition">
      
      {/* Immersive Mobile Simulation mock frame */}
      <div 
        id="phone-wrapper" 
        className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[880px] bg-slate-50 dark:bg-slate-950 flex flex-col justify-between overflow-hidden shadow-2xl sm:rounded-[40px] border-x border-y border-slate-200 dark:border-slate-800 relative ring-8 ring-slate-100 dark:ring-slate-900"
      >
        {/* Dynamic Mobile Status Bar info */}
        <div id="phone-notch-bar" className="bg-slate-900 dark:bg-black/40 text-white text-[10px] px-6 py-2.5 flex items-center justify-between font-mono select-none border-b border-slate-800/40 shrink-0 z-40">
          <span className="font-bold">{currentTime || '08:00'} LATSAR</span>
          
          {/* Virtual camera notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 bg-black w-24 h-4.5 rounded-full border border-slate-800 border-t-0 shrink-0 hidden sm:block" />

          <div className="flex items-center gap-1.5 grayscale-0">
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-green-400 shrink-0" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />
            )}
            <Signal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Battery className="w-4 h-4 text-slate-300 shrink-0" />
          </div>
        </div>

        {/* Dynamic header title block */}
        <div id="phone-gove-hdr" className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-805/60 px-4 py-3 flex items-center justify-between shadow-xs select-none shrink-0 z-30">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-500/10 text-indigo-500 rounded-lg">
              <Database className="w-5 h-5 shrink-0" />
            </span>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                SI-MAMA
                <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-1.5 py-0.5 rounded font-extrabold uppercase">MVP</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Kab. Intan Jaya &bull; Offline Database</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
              isOnline 
                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' 
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 animate-pulse'
            }`}>
              {isOnline ? '● Daring' : '● Luring'}
            </span>
          </div>
        </div>

        {/* Central main content scrolling container */}
        <div id="phone-scroller" className="flex-1 overflow-y-auto px-4 py-4 dark:text-white space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === 'DASHBOARD' && (
                <Dashboard
                  asets={asets}
                  tikets={tikets}
                  logs={logs}
                  queueLength={syncQueue.length}
                  onNavigate={(tab) => setActiveTab(tab)}
                  isOnline={isOnline}
                />
              )}

              {activeTab === 'MAP' && (
                <AsetMap
                  asets={asets}
                  onSelectAset={(a) => handleUpdateStatus(a.id, a.status)}
                  onAddAset={handleMapAddAsetRedirect}
                  isOnline={isOnline}
                />
              )}

              {activeTab === 'ASET' && (
                <AsetList
                  asets={asets}
                  onAddAset={handleAddAset}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteAset={handleDeleteAset}
                />
              )}

              {activeTab === 'TIKET' && (
                <TiketList
                  tikets={tikets}
                  asets={asets}
                  onAddTiket={handleAddTiket}
                  onUpdateTiketStatus={handleUpdateTiketStatus}
                  onDeleteTiket={handleDeleteTiket}
                  isOnline={isOnline}
                />
              )}

              {activeTab === 'MAINTENANCE' && (
                <MaintenanceLogComponent
                  logs={logs}
                  asets={asets}
                  onAddLog={handleAddMaintenanceLog}
                  onDeleteLog={handleDeleteLog}
                />
              )}

              {activeTab === 'SINKRONISASI' && (
                <SyncPanel
                  queue={syncQueue}
                  isOnline={isOnline}
                  onToggleOnline={handleToggleOnline}
                  onSyncAll={handleSyncAll}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  onResetDatabase={handleResetDatabase}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Immersive bottom navigation dock panel */}
        <div id="phone-nav-dock" className="bg-slate-900 border-t border-slate-800 flex justify-around items-center px-2 py-2 select-none shrink-0 z-40">
          
          {/* Tab 1: Dashboard */}
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('DASHBOARD')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-2xl w-14 transition ${
              activeTab === 'DASHBOARD' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[8px] mt-0.5 uppercase tracking-wide">Dasbor</span>
          </button>

          {/* Tab 2: Map */}
          <button
            id="tab-map"
            onClick={() => setActiveTab('MAP')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-2xl w-14 transition ${
              activeTab === 'MAP' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span className="text-[8px] mt-0.5 uppercase tracking-wide">Peta</span>
          </button>

          {/* Tab 3: Assets */}
          <button
            id="tab-assets"
            onClick={() => setActiveTab('ASET')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-2xl w-14 transition ${
              activeTab === 'ASET' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 shrink-0" />
            <span className="text-[8px] mt-0.5 uppercase tracking-wide">Aset</span>
          </button>

          {/* Tab 4: Tickets */}
          <button
            id="tab-tickets"
            onClick={() => setActiveTab('TIKET')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-2xl w-14 transition ${
              activeTab === 'TIKET' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="text-[8px] mt-0.5 uppercase tracking-wide">Tiket</span>
          </button>

          {/* Tab 5: Maintenance Logs */}
          <button
            id="tab-jurnal"
            onClick={() => setActiveTab('MAINTENANCE')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-2xl w-14 transition ${
              activeTab === 'MAINTENANCE' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-5 h-5 shrink-0" />
            <span className="text-[8px] mt-0.5 uppercase tracking-wide">Jurnal</span>
          </button>

          {/* Tab 6: Offline Sync settings panel */}
          <button
            id="tab-sync"
            onClick={() => setActiveTab('SINKRONISASI')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-2xl w-14 relative transition ${
              activeTab === 'SINKRONISASI' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-5 h-5 shrink-0" />
            {syncQueue.length > 0 ? (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                {syncQueue.length}
              </span>
            ) : !isOnline ? (
              <span className="absolute top-1.5 right-3 bg-rose-500 w-2 h-2 rounded-full animate-ping" />
            ) : null}
            <span className="text-[8px] mt-0.5 uppercase tracking-wide">Sinkron</span>
          </button>

        </div>
      </div>

    </div>
  );
}
