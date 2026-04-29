import fs from 'fs';
import path from 'path';
import type { Flight } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'flights.json');
const seedPath = path.join(process.cwd(), 'data', 'flights.seed.json');

function computeFlightStatus(flight: Flight): Flight {
  if (flight.status === 'Cancelled') return flight;

  const now = new Date();
  const [h, m] = flight.departureTime.split(':').map(Number);
  const depMinutes = h * 60 + m + (flight.delayMinutes ?? 0);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let status: Flight['status'];
  if (nowMinutes > depMinutes + 10) {
    status = 'Departed';
  } else if (nowMinutes >= depMinutes - 25) {
    status = 'Boarding';
  } else if (flight.delayMinutes) {
    status = 'Delayed';
  } else {
    status = 'On Time';
  }

  return { ...flight, status };
}

export function readFlights(): Flight[] {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const flights = JSON.parse(raw) as Flight[];
  return flights.map(computeFlightStatus);
}

export function writeFlights(flights: Flight[]): void {
  fs.writeFileSync(dataPath, JSON.stringify(flights, null, 2), 'utf-8');
}

export function resetToSeed(): Flight[] {
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const seed = JSON.parse(raw) as Flight[];
  writeFlights(seed);
  return seed.map(computeFlightStatus);
}
