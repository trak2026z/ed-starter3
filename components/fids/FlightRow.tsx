'use client';

import { useEffect, useRef, useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import type { Flight } from '@/types';

interface FlightRowProps {
  flight: Flight;
  index: number;
}

export function FlightRow({ flight, index }: FlightRowProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevStatusRef = useRef(flight.status);

  useEffect(() => {
    if (prevStatusRef.current === flight.status) return;
    prevStatusRef.current = flight.status;

    const startTimer = window.setTimeout(() => setIsAnimating(true), 0);
    const endTimer = window.setTimeout(() => setIsAnimating(false), 600);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [flight.status]);

  const isCancelled = flight.status === 'Cancelled';
  const isDeparted = flight.status === 'Departed';
  const isDelayed = flight.status === 'Delayed';
  const isActionable = !isCancelled && !isDeparted;

  return (
    <>
      <article
        className={cn(
          'mx-4 mb-3 rounded-[8px] border border-board-border bg-board-row p-4 shadow-lg shadow-black/20 md:hidden',
          isActionable && 'border-amber-300/20',
          isCancelled && 'opacity-70'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
              {flight.flightNumber}
            </p>
            <h2
              className={cn(
                'mt-1 truncate text-xl font-bold tracking-tight',
                isCancelled ? 'text-board-muted line-through' : 'text-board-text'
              )}
            >
              {flight.destination}
            </h2>
            <p className="mt-1 truncate text-sm text-board-muted">{flight.airline}</p>
          </div>
          <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-board-muted">Departs</p>
            <p className="text-2xl font-black tabular-nums text-amber-100">{flight.departureTime}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-black/20 px-2 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-board-muted">Terminal</p>
            <p className="mt-1 text-base font-bold text-board-text">{flight.terminal}</p>
          </div>
          <div className="rounded-md bg-black/20 px-2 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-board-muted">Gate</p>
            <p className="mt-1 text-base font-bold text-board-text">{flight.gate}</p>
          </div>
          <div className="rounded-md bg-black/20 px-2 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-board-muted">Status</p>
            <p className={cn('mt-1 text-base font-bold', isDelayed ? 'text-orange-200' : 'text-board-text')}>
              {isDelayed && flight.delayMinutes ? `+${flight.delayMinutes}m` : 'Live'}
            </p>
          </div>
        </div>

        <div className={cn('split-flap-wrapper mt-4', isAnimating && 'split-flap-char animating')}>
          <StatusBadge status={flight.status} className="w-full" />
        </div>
      </article>

      <div
        role="row"
        className={cn(
          'hidden grid-cols-[120px_170px_minmax(220px,1fr)_88px_76px_76px_168px] items-center gap-3 border-b border-board-border px-5 py-3.5 font-mono text-sm transition-colors md:grid',
          index % 2 === 0 ? 'bg-board-row' : 'bg-board-row-alt',
          isActionable && 'shadow-[inset_3px_0_0_rgba(251,191,36,0.45)]',
          isCancelled && 'opacity-60',
          isDeparted && 'opacity-65'
        )}
      >
        <span role="cell" className="font-bold tracking-[0.14em] text-amber-300">
          {flight.flightNumber}
        </span>
        <span role="cell" className="truncate text-board-muted">
          {flight.airline}
        </span>
        <span
          role="cell"
          className={cn(
            'min-w-0 truncate text-base font-semibold',
            isCancelled ? 'text-board-muted line-through' : 'text-board-text'
          )}
        >
          {flight.destination}
        </span>
        <span role="cell" className="text-center text-lg font-black tabular-nums text-amber-100">
          {flight.departureTime}
        </span>
        <span role="cell" className="text-center font-bold text-board-text">
          {flight.terminal}
        </span>
        <span role="cell" className="text-center font-bold text-board-text">
          {flight.gate}
        </span>

        <div role="cell" className={cn('split-flap-wrapper justify-self-start', isAnimating && 'split-flap-char animating')}>
          <StatusBadge status={flight.status} />
          {isDelayed && flight.delayMinutes && (
            <span className="ml-2 text-xs font-bold text-orange-200">+{flight.delayMinutes}m</span>
          )}
        </div>
      </div>
    </>
  );
}
