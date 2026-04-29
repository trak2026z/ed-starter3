import { NextResponse } from 'next/server';
import { readFlights, writeFlights, resetToSeed } from '@/lib/flights';
import type { Flight } from '@/types';

export async function GET() {
  const flights = readFlights();
  return NextResponse.json(flights);
}

// PATCH /api/flights — update a single flight by id
// Body: { id: string, ...partialFlight }
// NOTE: No input validation by design — exercise material for 01.04
export async function PATCH(request: Request) {
  const body = (await request.json()) as { id: string } & Partial<Flight>;
  const { id, ...updates } = body;

  const flights = readFlights();
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  }

  flights[index] = { ...flights[index], ...updates };
  writeFlights(flights);

  return NextResponse.json(flights[index]);
}

// POST /api/flights — add a new flight
export async function POST(request: Request) {
  const flight = (await request.json()) as Flight;
  const flights = readFlights();
  flights.push(flight);
  writeFlights(flights);
  return NextResponse.json(flight, { status: 201 });
}

// DELETE /api/flights — remove a flight by id
export async function DELETE(request: Request) {
  const { id } = (await request.json()) as { id: string };
  const flights = readFlights();
  const updated = flights.filter((f) => f.id !== id);
  writeFlights(updated);
  return NextResponse.json({ success: true });
}
