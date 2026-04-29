import { NextResponse } from 'next/server';
import { resetToSeed } from '@/lib/flights';

export async function POST() {
  const flights = resetToSeed();
  return NextResponse.json(flights);
}
