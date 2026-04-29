'use client';

import { useState } from 'react';
import { useFlightsStore } from '@/store/flightsStore';
import { StatusBadge } from '@/components/fids/StatusBadge';
import type { Flight, FlightStatus } from '@/types';
import { ALL_STATUSES } from '@/types';

interface StatusControlProps {
  flight: Flight;
}

export function StatusControl({ flight }: StatusControlProps) {
  const { updateFlight } = useFlightsStore();
  const [delay, setDelay] = useState(flight.delayMinutes?.toString() ?? '');
  const [loading, setLoading] = useState(false);

  async function changeStatus(newStatus: FlightStatus) {
    setLoading(true);
    const updates: Partial<Flight> = { status: newStatus };

    if (newStatus === 'Delayed') {
      updates.delayMinutes = parseInt(delay) || 30;
    } else {
      updates.delayMinutes = undefined;
    }

    try {
      const res = await fetch('/api/flights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flight.id, ...updates }),
      });
      if (res.ok) {
        updateFlight(flight.id, updates);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ALL_STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => changeStatus(s)}
          disabled={loading || flight.status === s}
          className="opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          <StatusBadge status={s} />
        </button>
      ))}

      {flight.status === 'Delayed' && (
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-zinc-500">+</span>
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
            onBlur={() =>
              changeStatus('Delayed')
            }
            min={0}
            max={999}
            className="w-16 bg-zinc-800 border border-zinc-700 text-orange-300 text-xs px-2 py-1 rounded text-center focus:outline-none focus:border-orange-600"
          />
          <span className="text-xs text-zinc-500">min</span>
        </div>
      )}
    </div>
  );
}
