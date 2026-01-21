
import React, { useState, useEffect, useRef } from 'react';
import { ROUTES } from '../constants';
import { Radio, Power, Users, MapPin, AlertTriangle, CloudUpload, Activity } from 'lucide-react';

const DriverView: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [occupancy, setOccupancy] = useState(30);
  const [transmissionLogs, setTransmissionLogs] = useState<{id: string, time: string, status: string}[]>([]);
  const watchId = useRef<number | null>(null);

  const addLog = (status: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      status
    };
    setTransmissionLogs(prev => [newLog, ...prev].slice(0, 5));
  };

  const toggleTracking = () => {
    if (isTracking) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsTracking(false);
      setLocation(null);
      addLog("Tracking Stopped");
      console.log("GPS Tracking Stopped.");
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
            const { latitude, longitude, accuracy, heading, speed } = pos.coords;
            const newLoc = { lat: latitude, lng: longitude };
            setLocation(newLoc);
            
            // SIMULATING BACKEND TRANSMISSION
            const payload = {
              busId: "DIU-DRIVER-01",
              route: selectedRoute,
              lat: latitude,
              lng: longitude,
              accuracy,
              heading,
              speed,
              occupancy,
              timestamp: new Date().toISOString()
            };
            
            console.log(">>> [MOCK BACKEND] Receiving update:", payload);
            addLog(`Sent: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          },
          (err) => {
            console.error("GPS Error:", err.message);
            addLog(`Error: ${err.message}`);
            setIsTracking(false);
          },
          { 
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000 
          }
        );
      } else {
        alert("Geolocation is not supported by your mobile device or browser.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 space-y-6 pb-20">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 text-center border border-gray-100 relative overflow-hidden">
        {isTracking && (
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
        )}
        
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-700 ${isTracking ? 'bg-green-600 text-white scale-110 shadow-2xl shadow-green-200 ring-8 ring-green-50' : 'bg-gray-100 text-gray-400'}`}>
          {isTracking ? <Activity className="w-12 h-12 animate-pulse" /> : <Radio className="w-12 h-12" />}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Live GPS Feed</h1>
        <p className="text-gray-500 mb-8 text-sm">
          {isTracking 
            ? 'Broadcasting your location to students' 
            : 'Select your route and start broadcasting'}
        </p>

        <div className="space-y-4 mb-2">
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Active Route</label>
            <select 
              disabled={isTracking}
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-green-500 text-gray-900 font-semibold appearance-none transition-all cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">Choose Route...</option>
              {ROUTES.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <button 
            onClick={toggleTracking}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${isTracking ? 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-100' : 'bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-200'}`}
          >
            <Power className="w-6 h-6" />
            {isTracking ? 'STOP BROADCAST' : 'START JOURNEY'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-50">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Users className="w-5 h-5" />
            <span className="font-bold text-sm">Bus Load</span>
          </div>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setOccupancy(Math.max(0, occupancy - 1))}
              className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 border border-gray-100"
            >-</button>
            <div className="text-center">
              <span className="text-3xl font-black text-gray-900">{occupancy}</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Seats</p>
            </div>
            <button 
              onClick={() => setOccupancy(Math.min(50, occupancy + 1))}
              className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 border border-gray-100"
            >+</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-50 flex flex-col">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-bold text-sm">Coordinates</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {location ? (
              <>
                <p className="text-sm font-bold text-gray-800 leading-tight">{location.lat.toFixed(6)} N</p>
                <p className="text-sm font-bold text-gray-800 leading-tight">{location.lng.toFixed(6)} E</p>
              </>
            ) : (
              <p className="text-xs text-gray-400 font-medium">No signal</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <CloudUpload className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
          Transmission Log (Mock Backend)
        </h3>
        <div className="space-y-2 min-h-[120px]">
          {transmissionLogs.length === 0 ? (
            <p className="text-gray-600 text-xs italic">Waiting for tracking to start...</p>
          ) : (
            transmissionLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-[11px] font-mono border-b border-gray-800 pb-1 last:border-0">
                <span className="text-gray-500">[{log.time}]</span>
                <span className={`${log.status.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{log.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-100/50 p-5 rounded-3xl flex gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Battery & Connection</p>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Keep this app open while driving. For better accuracy, use a mobile charger and ensure 4G/5G data is active.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverView;
