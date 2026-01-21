
import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import RoleSelector from './components/RoleSelector';
import StudentView from './components/StudentView';
import DriverView from './components/DriverView';
import AdminView from './components/AdminView';
import { DIU_LOGO_URL } from './constants';
import { LogOut, Bell, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Persistence (Optional for demo)
  useEffect(() => {
    const savedRole = localStorage.getItem('diu_bus_role');
    if (savedRole) setRole(savedRole as UserRole);
  }, []);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    localStorage.setItem('diu_bus_role', selectedRole);
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('diu_bus_role');
  };

  if (!role) {
    return <RoleSelector onSelect={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={DIU_LOGO_URL} alt="DIU Logo" className="h-10 w-auto" />
            <h1 className="text-xl font-bold text-green-700 hidden sm:block">Bus Tracker</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 uppercase tracking-wider">
              {role} Mode
            </span>
            <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {role === UserRole.STUDENT && <StudentView />}
        {role === UserRole.DRIVER && <DriverView />}
        {role === UserRole.ADMIN && <AdminView />}
      </main>

      {/* Mobile Footer (Optional shortcuts) */}
      <footer className="md:hidden bg-white border-t border-gray-200 p-2 flex justify-around">
        <button className="flex flex-col items-center p-2 text-green-600">
          <div className="text-xs">Dashboard</div>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-400">
          <div className="text-xs">Schedule</div>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-400">
          <div className="text-xs">Alerts</div>
        </button>
      </footer>
    </div>
  );
};

export default App;
