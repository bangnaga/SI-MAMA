/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Signal, Radio, Disc, Info, Plus, Compass, Globe, Layers } from 'lucide-react';
import { Aset, DistrikInfo } from '../types';
import { DAFTAR_DISTRIK } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface AsetMapProps {
  asets: Aset[];
  onSelectAset?: (aset: Aset) => void;
  onAddAset?: (lat: number, lng: number) => void;
  isOnline: boolean;
}

// Bounding parameters
const MIN_LAT = -3.5;
const MAX_LAT = -3.95;
const MIN_LNG = 136.8;
const MAX_LNG = 137.25;

// Coordinate converter from local SVG space back to true geographic lat/lng
function svgToGeo(x: number, y: number): [number, number] {
  const lat = MIN_LAT + (y / 400) * (MAX_LAT - MIN_LAT);
  const lng = MIN_LNG + (x / 500) * (MAX_LNG - MIN_LNG);
  return [lat, lng];
}

// District coordinates compiled from our original custom cartography vectors
const DISTRICTS_METADATA = [
  {
    id: 'wandai',
    nama: 'Wandai',
    coords: [[20, 40], [150, 40], [190, 120], [110, 180], [20, 130]],
    color: '#818cf8',
    fillColor: 'rgba(79, 70, 229, 0.15)'
  },
  {
    id: 'tomosiga',
    nama: 'Tomosiga',
    coords: [[150, 40], [320, 30], [410, 110], [330, 160], [190, 120]],
    color: '#38bdf8',
    fillColor: 'rgba(56, 189, 248, 0.15)'
  },
  {
    id: 'homeyo',
    nama: 'Homeyo',
    coords: [[20, 130], [110, 180], [120, 280], [30, 280], [10, 210]],
    color: '#a78bfa',
    fillColor: 'rgba(167, 139, 250, 0.15)'
  },
  {
    id: 'sugapa',
    nama: 'Sugapa',
    coords: [[190, 120], [330, 160], [300, 280], [150, 280], [110, 180]],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.18)'
  },
  {
    id: 'hitadipa',
    nama: 'Hitadipa',
    coords: [[330, 160], [410, 110], [480, 180], [450, 270], [300, 280]],
    color: '#2dd4bf',
    fillColor: 'rgba(45, 212, 191, 0.15)'
  },
  {
    id: 'biandoga',
    nama: 'Biandoga',
    coords: [[30, 280], [150, 280], [180, 380], [50, 380]],
    color: '#f43f5e',
    fillColor: 'rgba(244, 63, 94, 0.15)'
  },
  {
    id: 'agisiga',
    nama: 'Agisiga',
    coords: [[150, 280], [300, 280], [260, 380], [180, 380]],
    color: '#ec4899',
    fillColor: 'rgba(236, 72, 153, 0.15)'
  },
  {
    id: 'ugimba',
    nama: 'Ugimba',
    coords: [[300, 280], [450, 270], [485, 320], [410, 385], [260, 380]],
    color: '#10b981',
    fillColor: 'rgba(16, 185, 129, 0.15)'
  }
].map(d => ({
  ...d,
  geoPoints: d.coords.map(([x, y]) => svgToGeo(x, y)) as [number, number][]
}));

// Create beautiful custom canvas indicators that dodge default Leaflet's assets loader breaks
const createMarkerIcon = (status: string, jenis: string, isSelected: boolean) => {
  let colorHex = '#22c55e'; // Green (Aktif)
  let statusClass = 'border-emerald-500 bg-emerald-500/20 text-emerald-400';
  if (status === 'GANGGUAN') {
    colorHex = '#ef4444'; // Red (Problem)
    statusClass = 'border-rose-500 bg-rose-500/20 text-rose-400';
  } else if (status === 'MAINTENANCE') {
    colorHex = '#eab308'; // Amber (Maintenance)
    statusClass = 'border-amber-500 bg-amber-550/20 text-amber-400';
  }

  // Get inner symbol depending on the hardware platform type
  let iconSvg = '';
  if (jenis === 'REPEATER') {
    iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="${colorHex}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>`;
  } else if (jenis === 'VSAT') {
    iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="${colorHex}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`;
  } else {
    iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="${colorHex}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4"/></svg>`;
  }

  const selectionPulse = isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-950 scale-125' : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full border bg-slate-950 shadow-xl transition-all duration-300 ${statusClass} ${selectionPulse}">
        ${iconSvg}
        ${status === 'GANGGUAN' ? '<span class="absolute -inset-1 rounded-full border border-red-500 animate-ping opacity-75"></span>' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Temp adding placement marker
const createTempIcon = () => {
  return L.divIcon({
    className: 'temp-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-indigo-400 bg-indigo-950/90 text-indigo-400 shadow-xl animate-bounce">
         <svg viewBox="0 0 24 24" width="18" height="18" stroke="#fbbf24" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 1.42.5 3.1 1.76 4.67C7.14 16.5 9.3 18.2 12 22c2.7-3.8 4.86-5.5 6.24-7.33C19.5 13.1 20 11.42 20 10a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Helper component that listens to clicks inside Leaflet context
function MapEventsHandler({ 
  enabled, 
  onMapClick 
}: { 
  enabled: boolean; 
  onMapClick: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Controller component to smoothly pan/zoom map view
function MapViewSetter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

export default function AsetMap({ asets, onSelectAset, onAddAset, isOnline }: AsetMapProps) {
  const [selectedDistrik, setSelectedDistrik] = useState<string | null>(null);
  const [selectedAset, setSelectedAset] = useState<Aset | null>(null);
  const [filterJenis, setFilterJenis] = useState<string>('ALL');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.725, 137.025]);
  const [mapZoom, setMapZoom] = useState<number>(10);
  const [basemapType, setBasemapType] = useState<'DARK' | 'SATELLITE'>('DARK');

  // Filtered Assets list
  const filteredAsets = useMemo(() => {
    return asets.filter((aset) => {
      const matchJenis = filterJenis === 'ALL' || aset.jenis === filterJenis;
      const matchDistrik = !selectedDistrik || aset.distrik.toLowerCase() === selectedDistrik.toLowerCase();
      return matchJenis && matchDistrik;
    });
  }, [asets, filterJenis, selectedDistrik]);

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingMarker) {
      setTempCoords({ 
        lat: parseFloat(lat.toFixed(5)), 
        lng: parseFloat(lng.toFixed(5)) 
      });
    }
  };

  const confirmAddAset = () => {
    if (tempCoords && onAddAset) {
      onAddAset(tempCoords.lat, tempCoords.lng);
      setIsAddingMarker(false);
      setTempCoords(null);
    }
  };

  const selectAssetOnMap = (aset: Aset) => {
    setSelectedAset(aset);
    setMapCenter([aset.latitude, aset.longitude]);
    setMapZoom(12);
    if (onSelectAset) {
      onSelectAset(aset);
    }
  };

  return (
    <div id="aset-map-container" className="flex flex-col h-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl border border-slate-800">
      
      {/* Map Control Headers */}
      <div id="map-header" className="p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400 rotate-12" />
            Peta Geografis Intan Jaya (Leaflet)
          </h3>
          <p className="text-xs text-slate-400">Interactive GIS Spatial Mapping & Diagnostics</p>
        </div>

        <div className="flex gap-2">
          {/* Base Layer Switcher */}
          <button
            id="toggle-basemap"
            onClick={() => setBasemapType(basemapType === 'DARK' ? 'SATELLITE' : 'DARK')}
            className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
            title="Ubah Tipe Peta"
          >
            {basemapType === 'DARK' ? (
              <>
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Mode Satelit
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Mode Gelap
              </>
            )}
          </button>

          <button
            id="toggle-add-marker"
            onClick={() => {
              setIsAddingMarker(!isAddingMarker);
              setTempCoords(null);
            }}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isAddingMarker 
                ? 'bg-rose-500 text-white hover:bg-rose-600' 
                : 'bg-indigo-600 text-indigo-50 hover:bg-indigo-550'
            }`}
          >
            {isAddingMarker ? (
              <>Batal Taruh</>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Taruh Marker Baru
              </>
            )}
          </button>
        </div>
      </div>

      {/* Map Filter Controls */}
      <div id="map-filters" className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap py-1 scrollbar-none">
          <button
            onClick={() => setFilterJenis('ALL')}
            className={`cursor-pointer px-2.5 py-1 rounded-full transition ${filterJenis === 'ALL' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            Semua Aset
          </button>
          <button
            onClick={() => setFilterJenis('REPEATER')}
            className={`cursor-pointer px-2.5 py-1 rounded-full flex items-center gap-1 transition ${filterJenis === 'REPEATER' ? 'bg-indigo-400 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <Radio className="w-3 h-3" /> Radio Repeater
          </button>
          <button
            onClick={() => setFilterJenis('VSAT')}
            className={`cursor-pointer px-2.5 py-1 rounded-full flex items-center gap-1 transition ${filterJenis === 'VSAT' ? 'bg-sky-400 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <Disc className="w-3 h-3" /> Terminal VSAT
          </button>
          <button
            onClick={() => setFilterJenis('BTS')}
            className={`cursor-pointer px-2.5 py-1 rounded-full flex items-center gap-1 transition ${filterJenis === 'BTS' ? 'bg-teal-400 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <Signal className="w-3 h-3" /> Tower BTS
          </button>
        </div>

        {selectedDistrik && (
          <button 
            onClick={() => setSelectedDistrik(null)}
            className="cursor-pointer text-amber-400 font-medium hover:underline text-xs"
          >
            Reset Distrik ({selectedDistrik})
          </button>
        )}
      </div>

      {/* Adding Pin Warning Banner */}
      {isAddingMarker && (
        <div className="bg-amber-500/20 text-amber-300 px-4 py-2 text-xs flex items-center gap-2 border-b border-amber-500/30 font-semibold shadow-inner">
          <Info className="w-4 h-4 shrink-0 animate-bounce" />
          <span><strong>Ketuk lokasi di peta</strong> untuk menentukan koordinat presisi.</span>
        </div>
      )}

      {/* Leaflet Offline Notification Banner */}
      {!isOnline && (
        <div className="bg-rose-500/10 text-rose-300 px-4 py-1.5 text-[10px] flex items-center gap-1.5 border-b border-rose-500/20 font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>KONEKSI LURING: Menggunakan batas administratif dan marker lokal bawaan.</span>
        </div>
      )}

      {/* The Leaflet Interactive Map Frame */}
      <div className="relative flex-1 bg-slate-950 min-h-[380px] flex items-stretch select-none overflow-hidden z-20">
        
        {/* District Filter Badges on Map */}
        <div className="absolute top-2 left-2 z-30 flex flex-col gap-1 pointer-events-none opacity-85">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Batas Wilayah Distrik</span>
          <div className="flex flex-wrap gap-1 max-w-[210px]">
            {DAFTAR_DISTRIK.map(d => {
              const meta = DISTRICTS_METADATA.find(dm => dm.id === d.id);
              const colorStyle = meta ? { borderColor: meta.color, color: meta.color } : {};
              const isSelected = selectedDistrik?.toLowerCase() === d.id;

              return (
                <button 
                  key={d.id} 
                  pointer-events="auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDistrik(selectedDistrik === d.id ? null : d.id);
                  }}
                  style={isSelected ? { backgroundColor: meta?.color + '20', ...colorStyle } : {}}
                  className={`pointer-events-auto text-[8px] font-semibold px-1.5 py-0.5 rounded border transition text-left cursor-pointer ${
                    isSelected 
                      ? '' 
                      : 'bg-slate-900/85 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {d.nama}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaflet Map Loader */}
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          className="w-full h-full min-h-[380px] z-10"
          zoomControl={true}
          style={{ background: '#020617' }}
        >
          {/* Smooth centering controller */}
          <MapViewSetter center={mapCenter} zoom={mapZoom} />

          {/* Map click listener when laying down anchors */}
          <MapEventsHandler enabled={isAddingMarker} onMapClick={handleMapClick} />

          {/* Tile Layer fetching (gracefully fails empty when completely offline but keeps vector outlines intact!) */}
          {isOnline && (
            basemapType === 'DARK' ? (
              <TileLayer
                target="_blank"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/" target="_blank">CARTO</a> &copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>'
              />
            ) : (
              <TileLayer
                target="_blank"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://esri.com" target="_blank">Esri</a> &bull; Earthstar Geographics'
              />
            )
          )}

          {/* District boundaries drawn vectorially as real Map Polygons */}
          {DISTRICTS_METADATA.map((distrik) => {
            const isSelected = selectedDistrik?.toLowerCase() === distrik.id;
            return (
              <Polygon
                key={distrik.id}
                positions={distrik.geoPoints}
                pathOptions={{
                  color: isSelected ? '#fbbf24' : distrik.color,
                  weight: isSelected ? 3 : 1.5,
                  fillColor: distrik.color,
                  fillOpacity: isSelected ? 0.35 : 0.08,
                  dashArray: isSelected ? '0' : '4, 4'
                }}
                eventHandlers={{
                  click: (e) => {
                    // Stop event propagation to bypass general map triggers
                    L.DomEvent.stopPropagation(e);
                    setSelectedDistrik(selectedDistrik === distrik.id ? null : distrik.id);
                  }
                }}
              />
            );
          })}

          {/* Registered Hardware Assets pins */}
          {filteredAsets.map((aset) => {
            const isSelected = selectedAset?.id === aset.id;
            return (
              <Marker
                key={aset.id}
                position={[aset.latitude, aset.longitude]}
                icon={createMarkerIcon(aset.status, aset.jenis, isSelected)}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    selectAssetOnMap(aset);
                  }
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="text-slate-900 p-1 flex flex-col font-sans">
                    <span className="font-extrabold text-xs text-indigo-950">{aset.nama}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase mt-0.5">{aset.jenis} &bull; {aset.status}</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Floating Target Pin for new device deployment */}
          {tempCoords && (
            <Marker 
              position={[tempCoords.lat, tempCoords.lng]} 
              icon={createTempIcon()} 
            />
          )}

        </MapContainer>

        {/* Locked coordinate warning box */}
        {tempCoords && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-indigo-500 rounded-xl p-3 shadow-lg flex items-center justify-between gap-2 text-xs z-30 backdrop-blur-md"
          >
            <div>
              <p className="font-bold text-amber-400">Titik Koordinat Terkunci:</p>
              <p className="font-mono text-slate-300">Lat: {tempCoords.lat.toFixed(5)} &bull; Lnk: {tempCoords.lng.toFixed(5)}</p>
            </div>
            <button
              id="confirm-temp-coords"
              onClick={confirmAddAset}
              className="cursor-pointer bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-300 transition shrink-0 shadow-md"
            >
              Gunakan Titik Ini
            </button>
          </motion.div>
        )}
      </div>

      {/* Selected Marker Detail Drawer */}
      <AnimatePresence>
        {selectedAset && (
          <motion.div
            id="map-detail-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-850 border-t border-slate-800 p-4 shrink-0 transition-all duration-300 z-30"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3">
                <div className={`p-2.5 rounded-xl self-start ${
                  selectedAset.jenis === 'REPEATER' ? 'bg-indigo-500/10 text-indigo-400' :
                  selectedAset.jenis === 'VSAT' ? 'bg-sky-500/10 text-sky-400' : 'bg-teal-500/10 text-teal-400'
                }`}>
                  {selectedAset.jenis === 'REPEATER' ? <Radio className="w-5 h-5" /> :
                   selectedAset.jenis === 'VSAT' ? <Disc className="w-5 h-5" /> : <Signal className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-100">{selectedAset.nama}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedAset.status === 'AKTIF' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      selectedAset.status === 'GANGGUAN' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {selectedAset.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-1.5 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    Distrik {selectedAset.distrik} &bull; <span className="font-mono text-slate-300">{selectedAset.latitude}, {selectedAset.longitude}</span>
                  </p>
                  
                  {/* Detailed Specs */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300 text-[11px] mt-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                    {selectedAset.frekuensi && <p><strong>Spesifikasi:</strong> {selectedAset.frekuensi}</p>}
                    {selectedAset.daya && <p><strong>Daya Kerja:</strong> {selectedAset.daya}</p>}
                    {selectedAset.noIsr && <p className="col-span-2"><strong>Nomor ISR:</strong> <span className="font-mono text-[10px] text-slate-400">{selectedAset.noIsr}</span></p>}
                    {selectedAset.lokasiSpesifik && <p className="col-span-2 text-[11px] text-amber-200"><strong>Posisi Lokasi:</strong> {selectedAset.lokasiSpesifik}</p>}
                  </div>
                </div>
              </div>

              <button
                id="close-detail-drawer"
                onClick={() => setSelectedAset(null)}
                className="cursor-pointer text-slate-400 hover:text-white px-2 py-1 text-xs border border-slate-700 hover:bg-slate-800 rounded-lg shrink-0 transition"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
