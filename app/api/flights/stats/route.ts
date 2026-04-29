import { NextResponse } from 'next/server';
import { readFlights } from '@/lib/flights';
import { ALL_STATUSES } from '@/types';
import type { FlightStatus } from '@/types';

type FlightStats = Record<FlightStatus, number>;

export async function GET() {
  const flights = readFlights();
  const stats = ALL_STATUSES.reduce<FlightStats>(
    (counts, status) => ({ ...counts, [status]: 0 }),
    {} as FlightStats
  );

  for (const { status } of flights) {
    stats[status] += 1;
  }

  return NextResponse.json(stats);
}
