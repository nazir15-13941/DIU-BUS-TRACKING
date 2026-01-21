
import React, { useState, useEffect, useRef } from 'react';
import { ROUTES } from '../constants';
import { Radio, Power, Users, MapPin, AlertTriangle, CloudUpload, Activity } from 'lucide-react';

declare const L: any;

const DriverView: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [occupancy, setOccupancy] = useState(30);
  const [transmissionLogs, setTransmissionLogs] = useState<{id: string, time: string, status: string}[]>([]);
  const watchId = useRef<number | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const addLog = (status: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      status
    };
    setTransmissionLogs(prev => [newLog, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (!mapRef.current && isTracking) {
      mapRef.current = L.map('driver-map').setView([23.9000, 90.3200], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }
  }, [isTracking]);

  const toggleTracking = () => {
    if (isTracking) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
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

            addLog(`Sent: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          },
          (err) => {
            addLog(`Error: ${err.message}`);
            setIsTracking(false);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
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
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Live GPS Feed</h1>
        
        <div className="space-y-4 mb-2">
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 px-1">Route Assignment</label>
            <select 
              disabled={isTracking}
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-green-500 font-semibold appearance-none transition-all cursor-pointer"
            >
              <option value="">Choose Route...</option>
              {ROUTES.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <button 
            onClick={toggleTracking}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${isTracking ? 'bg-red-500 text-white shadow-xl shadow-red-100' : 'bg-green-600 text-white shadow-xl shadow-green-200'}`}
          >
            <Power className="w-6 h-6" />
            {isTracking ? 'STOP JOURNEY' : 'START TRACKING'}
          </button>
        </div>
      </div>

      {isTracking && (
        <div className="bg-white h-48 rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative">
          <div id="driver-map" className="w-full h-full"></div>
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-[10px] font-bold shadow-sm z-[1000]">Live Map View</div>
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
            <MapPin className="w-5 h-5" />
            <span className="font-bold text-sm">Signal</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {location ? (
              <p className="text-xs font-bold text-gray-800 leading-tight">{location.lat.toFixed(4)} N, {location.lng.toFixed(4)} E</p>
            ) : (
              <p className="text-xs text-gray-400 font-medium tracking-tighter">Waiting for GPS...</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl relative">
        <h3 className="text-white font-bold text-xs mb-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
          Transmission Logs (Python Backend)
        </h3>
        <div className="space-y-1 min-h-[100px]">
          {transmissionLogs.map((log) => (
            <div key={log.id} className="flex justify-between text-[10px] font-mono border-b border-gray-800 pb-1">
              <span className="text-gray-500">{log.time}</span>
              <span className="text-green-400">{log.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverView;
