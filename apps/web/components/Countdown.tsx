'use client';
import { useEffect, useState } from 'react';

export default function Countdown({ date }: { date: string }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(date);
    const target = new Date(hasTz ? date : date + '+01:00').getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);

  const items = [
    { v: time.d, l: 'dana' },
    { v: time.h, l: 'sati' },
    { v: time.m, l: 'min' },
    { v: time.s, l: 'sek' },
  ];

  return (
    <div className="flex gap-3 mt-4">
      {items.map(i => (
        <div key={i.l} className="bg-[#0d0b1f] text-white rounded-xl px-3 py-2 text-center min-w-[60px]">
          <div className="text-xl font-bold">{String(i.v).padStart(2, '0')}</div>
          <div className="text-[10px] text-zinc-400 uppercase">{i.l}</div>
        </div>
      ))}
    </div>
  );
}
