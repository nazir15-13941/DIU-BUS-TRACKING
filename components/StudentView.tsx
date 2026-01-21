
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_BUSES, ROUTES } from '../constants';
import { Search, Navigation, Info, MessageSquare, X, Send, RefreshCw } from 'lucide-react';
import { getBusInfoResponse } from '../services/geminiService';

declare const L: any;

const StudentView: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [liveBuses, setLiveBuses] = useState<any[]>(MOCK_BUSES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const fetchLiveLocations = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        // Convert API object back to array format
        const remoteBuses = Object.entries(data).map(([id, info]: [string, any]) => ({
          id,
          busNumber: id,
          route: info.route,
          lat: info.lat,
          lng: info.lng,
          status: info.status,
          occupancy: info.occupancy,
          capacity: 50
        }));
        
        // Merge with Mock Data for a full fleet view in demo
        const merged = [...MOCK_BUSES.filter(b => !remoteBuses.find(rb => rb.id === b.id)), ...remoteBuses];
        setLiveBuses(merged);
      }
    } catch (err) {
      console.error("Polling error", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredBuses = selectedRoute 
    ? liveBuses.filter(b => b.route === selectedRoute)
    : liveBuses;

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([23.9000, 90.3200], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Refresh markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    filteredBuses.forEach(bus => {
      const busIcon = L.divIcon({
        html: `<div class="bg-green-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s1-1 1-2V7s0-1-1-1h-3"/><path d="M3 18h3s1-1 1-2V7s0-1-1-1H3"/><path d="M3 6v12"/><path d="M18 6v12"/></svg></div>`,
        className: 'custom-bus-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${bus.busNumber}</b><br>${bus.route}<br>Status: ${bus.status}`);
      
      markersRef.current[bus.id] = marker;
    });
  }, [filteredBuses]);

  // Poll for live updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchLiveLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoadingChat(true);
    const aiResponse = await getBusInfoResponse(chatInput);
    setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsLoadingChat(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row relative">
      <div className="w-full md:w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto z-10 shadow-xl">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search destination..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quick Routes</h2>
          <RefreshCw className={`w-3 h-3 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="space-y-2 mb-8">
          <button 
            onClick={() => setSelectedRoute('')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${!selectedRoute ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-50 hover:bg-green-50 text-gray-700'}`}
          >
            All Fleet
          </button>
          {ROUTES.map(route => (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route.name)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedRoute === route.name ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-50 hover:bg-green-50 text-gray-700'}`}
            >
              <div className="font-bold text-sm">{route.name}</div>
              <div className={`text-[10px] ${selectedRoute === route.name ? 'text-green-100' : 'text-gray-400'}`}>Departs: {route.startTime}</div>
            </button>
          ))}
        </div>

        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Live Updates</h2>
        <div className="space-y-4">
          {filteredBuses.map(bus => (
            <div key={bus.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:border-green-300 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="font-black text-gray-900 group-hover:text-green-700 transition-colors">{bus.busNumber}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${bus.status === 'on-time' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {bus.status}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 flex items-center gap-1 mb-3 font-medium">
                <Navigation className="w-3 h-3" /> {bus.route}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000" 
                  style={{ width: `${(bus.occupancy / bus.capacity) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>{bus.occupancy}/{bus.capacity} CAPACITY</span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  LIVE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative bg-gray-100">
        <div id="map" className="w-full h-full"></div>

        <button 
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 transition-all flex items-center gap-2 group z-[1000]"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold uppercase text-xs tracking-widest px-0 group-hover:px-2">Ask AI</span>
        </button>

        {isChatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-[1001] flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b flex justify-between items-center bg-green-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider leading-none">Bus AI</h3>
                  <span className="text-[10px] text-green-100 font-bold uppercase opacity-75">Online Support</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoadingChat && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl flex gap-1 border border-gray-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about routes or schedules..."
                className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
              />
              <button 
                onClick={handleSendMessage}
                className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentView;
