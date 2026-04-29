'use client';

import { useEffect } from 'react';
import { FlightRow } from './FlightRow';
import { LiveClock } from './LiveClock';
import { useShallow } from 'zustand/react/shallow';
import { useFlightsStore, selectVisibleFlights } from '@/store/flightsStore';
import type { SortKey } from '@/store/flightsStore';
import type { Flight, FlightStatus, Terminal } from '@/types';
import { ALL_AIRLINES, ALL_STATUSES, ALL_TERMINALS } from '@/types';

interface FlightBoardProps {
  initialFlights: Flight[];
}

const sortableHeaders: Array<{
  key: SortKey;
  label: string;
  className?: string;
}> = [
  { key: 'departureTime', label: 'Time', className: 'text-center justify-center' },
  { key: 'terminal', label: 'Term.', className: 'text-center justify-center' },
  { key: 'status', label: 'Status' },
];

function getNextFlight(flights: Flight[]) {
  return flights.find((flight) => flight.status !== 'Departed' && flight.status !== 'Cancelled');
}

export function FlightBoard({ initialFlights }: FlightBoardProps) {
  const { filters, setFilter, setFlights, sort, toggleSort } = useFlightsStore();
  const flights = useFlightsStore(useShallow(selectVisibleFlights));
  const nextFlight = getNextFlight(flights);
  const delayedCount = flights.filter((flight) => flight.status === 'Delayed').length;
  const boardingCount = flights.filter((flight) => flight.status === 'Boarding').length;
  const activeFilterCount = Object.values(filters).filter((filter) => filter !== 'All').length;

  useEffect(() => {
    setFlights(initialFlights);
  }, [initialFlights, setFlights]);

  const getSortIndicator = (key: SortKey) => {
    if (sort.key !== key) return '↕';
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  const getAriaSort = (key: SortKey) => {
    if (sort.key !== key) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className="min-h-screen bg-board-bg text-board-text">
      <header className="border-b border-board-border bg-board-header/95 px-4 py-5 shadow-2xl shadow-black/20 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-board-muted">
              Flight Information Display
            </p>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-[0.08em] text-amber-300 md:text-4xl">
              RunwayBriefing
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-[8px] border border-board-border bg-black/20 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-board-muted">
                Next boardable
              </p>
              <p className="mt-1 max-w-[18rem] truncate text-sm font-bold text-board-text">
                {nextFlight
                  ? `${nextFlight.departureTime} · ${nextFlight.destination}`
                  : 'No active departures'}
              </p>
            </div>
            <LiveClock />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-8">
        <section
          aria-label="Flight list summary"
          className="grid gap-3 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1.4fr]"
        >
          <div className="rounded-[8px] border border-board-border bg-board-row px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-board-muted">Showing</p>
            <p className="mt-1 text-2xl font-black tabular-nums text-board-text">{flights.length}</p>
          </div>
          <div className="rounded-[8px] border border-orange-300/20 bg-orange-400/10 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-board-muted">Delayed</p>
            <p className="mt-1 text-2xl font-black tabular-nums text-orange-100">{delayedCount}</p>
          </div>
          <div className="rounded-[8px] border border-amber-300/25 bg-amber-300/10 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-board-muted">Boarding</p>
            <p className="mt-1 text-2xl font-black tabular-nums text-amber-100">{boardingCount}</p>
          </div>
          <div className="rounded-[8px] border border-board-border bg-board-row px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-board-muted">
              Current scope
            </p>
            <p className="mt-1 truncate text-sm font-bold text-board-text">
              {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'All departures'}
            </p>
          </div>
        </section>

        <section
          aria-label="Flight filters"
          className="mt-5 rounded-[8px] border border-board-border bg-board-header p-3 shadow-xl shadow-black/15"
        >
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-board-muted">
                Terminal
              </span>
              <select
                value={filters.terminal}
                onChange={(e) => setFilter('terminal', e.target.value as Terminal | 'All')}
                className="h-11 rounded-md border border-board-border bg-board-row px-3 text-sm font-bold text-board-text outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25"
              >
                <option value="All">All Terminals</option>
                {ALL_TERMINALS.map((terminal) => (
                  <option key={terminal} value={terminal}>
                    {terminal}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-board-muted">
                Airline
              </span>
              <select
                value={filters.airline}
                onChange={(e) => setFilter('airline', e.target.value)}
                className="h-11 rounded-md border border-board-border bg-board-row px-3 text-sm font-bold text-board-text outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25"
              >
                <option value="All">All Airlines</option>
                {ALL_AIRLINES.map((airline) => (
                  <option key={airline} value={airline}>
                    {airline}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-board-muted">
                Status
              </span>
              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value as FlightStatus | 'All')}
                className="h-11 rounded-md border border-board-border bg-board-row px-3 text-sm font-bold text-board-text outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25"
              >
                <option value="All">All Statuses</option>
                {ALL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-md border border-board-border bg-black/20 px-3 py-2 text-sm font-bold text-board-text">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-board-muted">
                Results
              </span>
              <span className="text-lg tabular-nums">
                {flights.length} flight{flights.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </section>

        <section
          aria-label="Available flights"
          className="mt-5 overflow-hidden rounded-[8px] border border-board-border bg-board-row shadow-2xl shadow-black/20"
        >
          <div
            role="row"
            className="hidden grid-cols-[120px_170px_minmax(220px,1fr)_88px_76px_76px_168px] gap-3 border-b border-board-border bg-board-header px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-board-muted md:grid"
          >
            <span role="columnheader">Flight</span>
            <span role="columnheader">Airline</span>
            <span role="columnheader">Destination</span>
            {sortableHeaders.slice(0, 2).map(({ key, label, className }) => (
              <span
                key={key}
                role="columnheader"
                aria-sort={getAriaSort(key) as 'none' | 'ascending' | 'descending'}
                className={className}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(key)}
                  aria-label={`Sort by ${label}`}
                  className={`flex w-full items-center gap-1 rounded-sm hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/35 ${
                    sort.key === key ? 'text-amber-200' : ''
                  } ${className ?? ''}`}
                >
                  <span>{label}</span>
                  <span aria-hidden="true" className="text-[10px]">
                    {getSortIndicator(key)}
                  </span>
                </button>
              </span>
            ))}
            <span role="columnheader" className="text-center">
              Gate
            </span>
            {sortableHeaders.slice(2).map(({ key, label, className }) => (
              <span
                key={key}
                role="columnheader"
                aria-sort={getAriaSort(key) as 'none' | 'ascending' | 'descending'}
                className={className}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(key)}
                  aria-label={`Sort by ${label}`}
                  className={`flex w-full items-center gap-1 rounded-sm hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/35 ${
                    sort.key === key ? 'text-amber-200' : ''
                  } ${className ?? ''}`}
                >
                  <span>{label}</span>
                  <span aria-hidden="true" className="text-[10px]">
                    {getSortIndicator(key)}
                  </span>
                </button>
              </span>
            ))}
          </div>

          <div className="bg-board-bg py-4 md:py-0" role="table" aria-label="Departures">
            {flights.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-lg font-bold text-board-text">No matching departures</p>
                <p className="mt-2 text-sm text-board-muted">
                  Broaden the terminal, airline, or status filters to see more flights.
                </p>
              </div>
            ) : (
              flights.map((flight, i) => <FlightRow key={flight.id} flight={flight} index={i} />)
            )}
          </div>
        </section>

        <div className="fixed bottom-4 right-4">
          <a
            href="/admin"
            className="rounded-full border border-board-border bg-board-header/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-board-muted shadow-lg shadow-black/25 transition hover:border-amber-300/50 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/35"
          >
            Admin
          </a>
        </div>
      </main>
    </div>
  );
}
