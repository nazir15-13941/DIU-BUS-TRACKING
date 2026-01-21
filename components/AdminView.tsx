
import React from 'react';
import { MOCK_BUSES, ROUTES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ShieldAlert, Users, Bus, TrendingUp, AlertCircle, Clock } from 'lucide-react';

const AdminView: React.FC = () => {
  const chartData = ROUTES.map(r => ({
    name: r.name.split(' - ')[0],
    occupancy: MOCK_BUSES.find(b => b.route === r.name)?.occupancy || Math.floor(Math.random() * 50),
  }));

  const stats = [
    { label: 'Active Buses', value: '18', icon: Bus, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Passengers', value: '742', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Speed', value: '34 km/h', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Alerts', value: '2', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Dashboard</h1>
          <p className="text-gray-500">Real-time monitoring of DIU transport system</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Export PDF</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-100">Add Bus</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Occupancy Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Route Occupancy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="occupancy" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.occupancy > 40 ? '#ef4444' : '#16a34a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Alerts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Critical Alerts</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700">Bus DIU-205: Mechanical Issue</p>
                <p className="text-xs text-red-600">Location: Gabtoli - 5 mins ago</p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded flex gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-700">Uttara Route: High Delay</p>
                <p className="text-xs text-amber-600">Traffic at Airport crossing - 12 mins delay</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bus List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Active Fleet Status</h3>
          <button className="text-green-600 text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Bus ID</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Load</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_BUSES.map(bus => (
                <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{bus.busNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bus.route}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bus.driverName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${(bus.occupancy/bus.capacity)*100}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400">{Math.round((bus.occupancy/bus.capacity)*100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${bus.status === 'on-time' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-bold text-green-600 hover:text-green-800 uppercase">Contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
