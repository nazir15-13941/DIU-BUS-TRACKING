
import React, { useState, useEffect, useRef } from 'react';
import { ROUTES } from '../constants';
import { Radio, Power, Users, MapPin, Activity, Cloud } from 'lucide-react';

declare const L: any;

const DriverView: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [occupancy, setOccupancy] = useState(30);
  const [transmissionLogs, setTransmissionLogs] = useState<{id: string, time: string, status: string}[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const watchId = useRef<number | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const syncInterval = useRef<number | null>(null);

  const addLog = (status: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      status
    };
    setTransmissionLogs(prev => [newLog, ...prev].slice(0, 5));
  };

  const syncToServer = async (loc: {lat: number, lng: number}) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bus_id: "DIU-DRIVER-01", // In real app, use auth context
          lat: loc.lat,
          lng: loc.lng,
          occupancy: occupancy,
          route: selectedRoute,
          status: 'on-time'
        })
      });
      if (response.ok) {
        addLog(`Sync: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
      } else {
        addLog("Sync Error: HTTP " + response.status);
      }
    } catch (err) {
      addLog("Network Error");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current && isTracking) {
      mapRef.current = L.map('driver-map').setView([23.9000, 90.3200], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }
  }, [isTracking]);

  const toggleTracking = () => {
    if (isTracking) {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (syncInterval.current !== null) clearInterval(syncInterval.current);
      setIsTracking(false);
      setLocation(null);
      addLog("Tracking Stopped");
    } else {
      if (!selectedRoute) {
        alert("Please select your assigned route first!");
        return;
      }
      
      if ("geolocation" in navigator) {
        setIsTracking(true);
        addLog("Initializing GPS...");
        
        watchId.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const newLoc = { lat: latitude, lng: longitude };
            setLocation(newLoc);
            
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 15);
              if (markerRef.current) markerRef.current.remove();
              markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
            }
          },
          (err) => {
            addLog(`GPS Error: ${err.message}`);
            setIsTracking(false);
          },
          { enableHighAccuracy: true }
        );

        // Start periodic sync to Vercel Python Backend
        syncInterval.current = window.setInterval(() => {
          if (location) syncToServer(location);
        }, 5000);

      } else {
        alert("Geolocation not supported.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 space-y-6 pb-20">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 text-center border border-gray-100 relative overflow-hidden">
        {isTracking && (
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
        )}
        
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-700 ${isTracking ? 'bg-green-600 text-white scale-110 shadow-2xl ring-8 ring-green-50' : 'bg-gray-100 text-gray-400'}`}>
          {isTracking ? <Activity className="w-10 h-10 animate-pulse" /> : <Radio className="w-10 h-10" />}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">DIU Driver Console</h1>
        
        <div className="space-y-4 mb-2 text-left">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Active Route</label>
            <select 
              disabled={isTracking}
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 font-semibold transition-all"
            >
              <option value="">Select your route...</option>
              {ROUTES.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <button 
            onClick={toggleTracking}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${isTracking ? 'bg-red-500 text-white shadow-xl' : 'bg-green-600 text-white shadow-xl shadow-green-200'}`}
          >
            <Power className="w-6 h-6" />
            {isTracking ? 'STOP BROADCAST' : 'GO ONLINE'}
          </button>
        </div>
      </div>

      {isTracking && (
        <div className="bg-white h-40 rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative">
          <div id="driver-map" className="w-full h-full"></div>
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-sm z-[1000] flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`}></div>
            {isSyncing ? 'SYNCING...' : 'GPS ACTIVE'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-50">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Users className="w-5 h-5" />
            <span className="font-bold text-sm">Bus Load</span>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setOccupancy(Math.max(0, occupancy - 1))} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold">-</button>
            <span className="text-2xl font-black text-gray-900">{occupancy}</span>
            <button onClick={() => setOccupancy(Math.min(50, occupancy + 1))} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold">+</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-50 flex flex-col">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Cloud className="w-5 h-5" />
            <span className="font-bold text-sm">Status</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className={`text-xs font-bold ${isTracking ? 'text-green-600' : 'text-gray-400'}`}>
              {isTracking ? 'Broadcasting Live' : 'Ready to Start'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-white/50 font-bold text-[10px] mb-4 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-3 h-3" /> System Logs
        </h3>
        <div className="space-y-1 font-mono">
          {transmissionLogs.map((log) => (
            <div key={log.id} className="flex justify-between text-[10px] border-b border-white/5 pb-1">
              <span className="text-gray-500">{log.time}</span>
              <span className="text-green-400">{log.status}</span>
            </div>
          ))}
          {transmissionLogs.length === 0 && <p className="text-[10px] text-gray-600">Waiting for activity...</p>}
        </div>
      </div>
    </div>
  );
};

export default DriverView;
