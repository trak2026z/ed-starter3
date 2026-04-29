import { create } from 'zustand';
import type { Flight, FlightStatus, Terminal } from '@/types';
import { ALL_STATUSES, ALL_TERMINALS } from '@/types';

interface FiltersState {
  terminal: Terminal | 'All';
  airline: string;
  status: FlightStatus | 'All';
}

export type SortKey = 'departureTime' | 'terminal' | 'status';
export type SortDirection = 'asc' | 'desc';

interface SortState {
  key: SortKey | null;
  direction: SortDirection;
}

interface FlightsStore {
  flights: Flight[];
  filters: FiltersState;
  sort: SortState;
  setFlights: (flights: Flight[]) => void;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  toggleSort: (key: SortKey) => void;
  updateFlight: (id: string, updates: Partial<Flight>) => void;
  addFlight: (flight: Flight) => void;
  removeFlight: (id: string) => void;
  resetFlights: (flights: Flight[]) => void;
}

export const useFlightsStore = create<FlightsStore>((set) => ({
  flights: [],
  filters: {
    terminal: 'All',
    airline: 'All',
    status: 'All',
  },
  sort: {
    key: null,
    direction: 'asc',
  },

  setFlights: (flights) => set({ flights }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  toggleSort: (key) =>
    set((state) => {
      if (state.sort.key !== key) {
        return { sort: { key, direction: 'asc' } };
      }

      if (state.sort.direction === 'asc') {
        return { sort: { key, direction: 'desc' } };
      }

      return { sort: { key: null, direction: 'asc' } };
    }),

  updateFlight: (id, updates) =>
    set((state) => ({
      flights: state.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  addFlight: (flight) => set((state) => ({ flights: [...state.flights, flight] })),

  removeFlight: (id) =>
    set((state) => ({ flights: state.flights.filter((f) => f.id !== id) })),

  resetFlights: (flights) => set({ flights }),
}));

function compareFlights(a: Flight, b: Flight, key: SortKey): number {
  if (key === 'departureTime') {
    return a.departureTime.localeCompare(b.departureTime);
  }

  if (key === 'terminal') {
    return ALL_TERMINALS.indexOf(a.terminal) - ALL_TERMINALS.indexOf(b.terminal);
  }

  return ALL_STATUSES.indexOf(a.status) - ALL_STATUSES.indexOf(b.status);
}

export function selectVisibleFlights(state: FlightsStore): Flight[] {
  const { flights, filters } = state;
  const filteredFlights = flights.filter((f) => {
    if (filters.terminal !== 'All' && f.terminal !== filters.terminal) return false;
    if (filters.airline !== 'All' && f.airline !== filters.airline) return false;
    if (filters.status !== 'All' && f.status !== filters.status) return false;
    return true;
  });

  const sortKey = state.sort.key;
  if (!sortKey) return filteredFlights;

  const directionMultiplier = state.sort.direction === 'asc' ? 1 : -1;
  return filteredFlights
    .map((flight, index) => ({ flight, index }))
    .sort((a, b) => {
      const result = compareFlights(a.flight, b.flight, sortKey);
      return result === 0 ? a.index - b.index : result * directionMultiplier;
    })
    .map(({ flight }) => flight);
}

export const selectFilteredFlights = selectVisibleFlights;
