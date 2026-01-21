
import { BusRoute, BusLocation } from './types';

export const DIU_GREEN = '#16a34a'; // tailwind green-600
export const DIU_LOGO_URL = 'https://daffodilvarsity.edu.bd/images/logo.png';

export const ROUTES: BusRoute[] = [
  { id: 'r1', name: 'Uttara - DSC', stops: ['Uttara', 'Airport', 'Abdullahpur', 'DSC'], startTime: '07:30 AM' },
  { id: 'r2', name: 'Mirpur - DSC', stops: ['Mirpur 10', 'Mirpur 1', 'Gabtoli', 'DSC'], startTime: '08:00 AM' },
  { id: 'r3', name: 'Dhanmondi - DSC', stops: ['Dhanmondi 32', 'Asad Gate', 'Gabtoli', 'DSC'], startTime: '07:45 AM' },
  { id: 'r4', name: 'Savar - DSC', stops: ['Savar Bazar', 'Radio Colony', 'Baipal', 'DSC'], startTime: '08:15 AM' },
  { id: 'r5', name: 'ECB - DSC', stops: ['ECB Circle', 'Kalshi', 'Mirpur 12', 'DSC'], startTime: '07:15 AM' }
];

export const MOCK_BUSES: BusLocation[] = [
  {
    id: 'b1',
    busNumber: 'DIU-102',
    route: 'Uttara - DSC',
    driverName: 'Mr. Rahim',
    lat: 23.8759,
    lng: 90.3795,
    status: 'on-time',
    lastUpdated: new Date().toISOString(),
    capacity: 50,
    occupancy: 35
  },
  {
    id: 'b2',
    busNumber: 'DIU-205',
    route: 'Mirpur - DSC',
    driverName: 'Mr. Karim',
    lat: 23.8223,
    lng: 90.3654,
    status: 'late',
    lastUpdated: new Date().toISOString(),
    capacity: 50,
    occupancy: 48
  },
  {
    id: 'b3',
    busNumber: 'DIU-309',
    route: 'ECB - DSC',
    driverName: 'Mr. Selim',
    lat: 23.8243,
    lng: 90.3925,
    status: 'on-time',
    lastUpdated: new Date().toISOString(),
    capacity: 50,
    occupancy: 20
  }
];
