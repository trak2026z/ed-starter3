import { FlightBoard } from '@/components/fids/FlightBoard';
import { readFlights } from '@/lib/flights';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const flights = readFlights();
  return <FlightBoard initialFlights={flights} />;
}
