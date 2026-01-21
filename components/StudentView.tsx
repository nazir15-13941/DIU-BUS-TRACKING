
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_BUSES, ROUTES } from '../constants';
import { MapPin, Search, Navigation, Info, MessageSquare, X, Send, Bus as BusIcon } from 'lucide-react';
import { getBusInfoResponse } from '../services/geminiService';

declare const L: any; // Leaflet global

const StudentView: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const filteredBuses = selectedRoute 
    ? MOCK_BUSES.filter(b => b.route === selectedRoute)
    : MOCK_BUSES;

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([23.9000, 90.3200], 13); // Centered on DSC
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Clean up markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add Bus Markers
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

    return () => {
      // Logic for partial updates if needed
    };
  }, [filteredBuses]);

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
      <div className="w-full md:w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto z-10">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search destination..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Routes</h2>
        <div className="space-y-2 mb-8">
          <button 
            onClick={() => setSelectedRoute('')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${!selectedRoute ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-50 hover:bg-green-50 text-gray-700'}`}
          >
            All Routes
          </button>
          {ROUTES.map(route => (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route.name)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${selectedRoute === route.name ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-50 hover:bg-green-50 text-gray-700'}`}
            >
              <div className="font-medium">{route.name}</div>
              <div className={`text-xs ${selectedRoute === route.name ? 'text-green-100' : 'text-gray-400'}`}>Start: {route.startTime}</div>
            </button>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Buses</h2>
        <div className="space-y-4">
          {filteredBuses.map(bus => (
            <div key={bus.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:border-green-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">{bus.busNumber}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${bus.status === 'on-time' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {bus.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <Navigation className="w-3 h-3" /> {bus.route}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${(bus.occupancy / bus.capacity) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-medium text-gray-400">
                <span>{bus.occupancy}/{bus.capacity} Seats</span>
                <span>Live Update</span>
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
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium">Ask Assistant</span>
        </button>

        {isChatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-[1001] flex flex-col border-l border-gray-100">
            <div className="p-4 border-b flex justify-between items-center bg-green-600 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Bus Assistant</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                  <p>Ask me anything about DIU buses!</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button onClick={() => setChatInput('When is the next bus to Uttara?')} className="text-xs border rounded-full px-3 py-1 hover:bg-gray-50">Uttara Schedule?</button>
                    <button onClick={() => setChatInput('Is there a bus from Mirpur now?')} className="text-xs border rounded-full px-3 py-1 hover:bg-gray-50">Mirpur Bus?</button>
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none shadow-md' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoadingChat && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button 
                onClick={handleSendMessage}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
