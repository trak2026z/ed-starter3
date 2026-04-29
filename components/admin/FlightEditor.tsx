'use client';

import { useState } from 'react';
import { useFlightsStore } from '@/store/flightsStore';
import type { Flight, Airline, Terminal, FlightStatus } from '@/types';
import { ALL_AIRLINES, ALL_TERMINALS, ALL_STATUSES } from '@/types';

interface FlightEditorProps {
  onAdded?: () => void;
}

const EMPTY_FLIGHT: Omit<Flight, 'id'> = {
  flightNumber: '',
  airline: 'LOT',
  destination: '',
  departureTime: '12:00',
  terminal: 'T1',
  gate: 'A1',
  status: 'On Time',
};

export function FlightEditor({ onAdded }: FlightEditorProps) {
  const { addFlight } = useFlightsStore();
  const [form, setForm] = useState<Omit<Flight, 'id'>>(EMPTY_FLIGHT);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const newFlight: Flight = {
      ...form,
      id: String(Date.now()),
    };

    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlight),
      });
      if (res.ok) {
        addFlight(newFlight);
        setForm(EMPTY_FLIGHT);
        onAdded?.();
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-3 py-1.5 rounded focus:outline-none focus:border-amber-600 w-full';
  const labelClass = 'text-xs text-zinc-500 uppercase tracking-wider mb-1 block';

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <div>
        <label className={labelClass}>Flight No.</label>
        <input
          required
          value={form.flightNumber}
          onChange={(e) => updateField('flightNumber', e.target.value)}
          placeholder="LO 999"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Airline</label>
        <select
          value={form.airline}
          onChange={(e) => updateField('airline', e.target.value as Airline)}
          className={inputClass}
        >
          {ALL_AIRLINES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Destination</label>
        <input
          required
          value={form.destination}
          onChange={(e) => updateField('destination', e.target.value)}
          placeholder="Warsaw Chopin"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Departure (HH:MM)</label>
        <input
          required
          value={form.departureTime}
          onChange={(e) => updateField('departureTime', e.target.value)}
          pattern="^([01]\d|2[0-3]):[0-5]\d$"
          placeholder="12:00"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Terminal</label>
        <select
          value={form.terminal}
          onChange={(e) => updateField('terminal', e.target.value as Terminal)}
          className={inputClass}
        >
          {ALL_TERMINALS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Gate</label>
        <input
          required
          value={form.gate}
          onChange={(e) => updateField('gate', e.target.value)}
          placeholder="A1"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Status</label>
        <select
          value={form.status}
          onChange={(e) => updateField('status', e.target.value as FlightStatus)}
          className={inputClass}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-2 md:col-span-3 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-amber-100 text-sm px-6 py-2 rounded transition-colors"
        >
          {loading ? 'Adding…' : '+ Add Flight'}
        </button>
      </div>
    </form>
  );
}
