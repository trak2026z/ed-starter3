export type FlightStatus = 'On Time' | 'Boarding' | 'Departed' | 'Delayed' | 'Cancelled';

export type Terminal = 'T1' | 'T2';

export type Airline = 'LOT' | 'Ryanair' | 'Wizz Air' | 'Lufthansa' | 'KLM' | 'Emirates' | 'Delta';

export interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  destination: string;
  departureTime: string; // "HH:MM" — no date field, recordings stay timeless
  terminal: Terminal;
  gate: string;
  status: FlightStatus;
  delayMinutes?: number; // only populated when status === 'Delayed'
}

export const ALL_STATUSES: FlightStatus[] = [
  'On Time',
  'Boarding',
  'Departed',
  'Delayed',
  'Cancelled',
];

export const ALL_AIRLINES: Airline[] = [
  'LOT',
  'Ryanair',
  'Wizz Air',
  'Lufthansa',
  'KLM',
  'Emirates',
  'Delta',
];

export const ALL_TERMINALS: Terminal[] = ['T1', 'T2'];
