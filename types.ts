
export enum UserRole {
  STUDENT = 'STUDENT',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export interface BusLocation {
  id: string;
  busNumber: string;
  route: string;
  driverName: string;
  lat: number;
  lng: number;
  status: 'on-time' | 'late' | 'breakdown';
  lastUpdated: string;
  capacity: number;
  occupancy: number;
}

export interface BusRoute {
  id: string;
  name: string;
  stops: string[];
  startTime: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
