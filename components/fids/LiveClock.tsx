'use client';

import { useEffect, useState } from 'react';

export function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 rounded-[8px] border border-amber-300/25 bg-amber-300/10 px-4 py-3 font-mono text-2xl font-black text-amber-200 sm:min-w-48">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-board-muted">
        Local
      </span>
      <span className="tabular-nums">{time || '--:--:--'}</span>
    </div>
  );
}
