
import React from 'react';
import { UserRole } from '../types';
import { DIU_LOGO_URL } from '../constants';
// Fixed error: Removed non-existent and unused SteeringWheel import
import { GraduationCap, LayoutDashboard, Bus } from 'lucide-react';

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  const roles = [
    {
      id: UserRole.STUDENT,
      title: 'Student / Employee',
      desc: 'Track buses and view schedules',
      icon: GraduationCap,
      color: 'bg-green-600',
    },
    {
      id: UserRole.DRIVER,
      title: 'Bus Driver',
      desc: 'Share your location with students',
      icon: Bus,
      color: 'bg-blue-600',
    },
    {
      id: UserRole.ADMIN,
      title: 'Admin Panel',
      desc: 'Manage fleet and analytics',
      icon: LayoutDashboard,
      color: 'bg-gray-800',
    }
  ];

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center mb-12">
        <img src={DIU_LOGO_URL} alt="DIU Logo" className="h-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DIU Transport System</h1>
        <p className="text-gray-600 text-lg">Real-time bus tracking for the Daffodil family</p>
      </div>

      <div className="grid gap-6 w-full max-w-lg">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-300 transition-all group text-left"
          >
            <div className={`${role.color} p-4 rounded-xl text-white mr-6 group-hover:scale-110 transition-transform`}>
              <role.icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
              <p className="text-gray-500">{role.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-12 text-sm text-gray-400">© 2024 Daffodil International University</p>
    </div>
  );
};

export default RoleSelector;
