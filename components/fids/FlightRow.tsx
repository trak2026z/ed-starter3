'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import type { Flight } from '@/types';

interface FlightRowProps {
  flight: Flight;
  index: number;
}

export function FlightRow({ flight, index }: FlightRowProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevStatus, setPrevStatus] = useState(flight.status);

  // TODO: implement full split-flap animation for each character
  // Currently animates the entire status badge as one unit
  if (prevStatus !== flight.status) {
    setPrevStatus(flight.status);
    setIsAnimating(true);
  }

  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  const isCancelled = flight.status === 'Cancelled';
  const isDeparted = flight.status === 'Departed';

  return (
    <div
      className={cn(
        'grid grid-cols-[120px_160px_1fr_80px_60px_60px_140px] items-center gap-2 px-4 py-3 text-sm font-mono border-b border-board-border transition-colors',
        index % 2 === 0 ? 'bg-board-row' : 'bg-board-row-alt',
        isCancelled && 'opacity-50',
        isDeparted && 'opacity-60'
      )}
    >
      <span className="font-bold text-amber-300 tracking-wider">{flight.flightNumber}</span>
      <span className="text-board-muted truncate">{flight.airline}</span>
      <span
        className={cn(
          'truncate',
          isCancelled ? 'line-through text-board-muted' : 'text-board-text'
        )}
      >
        {flight.destination}
      </span>
      <span className="tabular-nums text-center text-amber-100">{flight.departureTime}</span>
      <span className="text-center text-board-muted">{flight.terminal}</span>
      <span className="text-center text-board-muted">{flight.gate}</span>

      <div className={cn('split-flap-wrapper', isAnimating && 'split-flap-char animating')}>
        <StatusBadge status={flight.status} />
        {flight.status === 'Delayed' && flight.delayMinutes && (
          <span className="ml-1 text-orange-400 text-xs">+{flight.delayMinutes}m</span>
        )}
      </div>
    </div>
  );
}
