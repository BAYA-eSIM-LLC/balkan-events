'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AttendancePage() {
  const [eventId, setEventId] = useState('');
  const [data, setData] = useState<any>(null);

  const load = async () => {
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/scanner/attendance?event_id=${eventId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (r.ok) setData(await r.json());
  };

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>
      <input className="border p-2 w-full mb-2" placeholder="Event ID" value={eventId} onChange={e => setEventId(e.target.value)} />
      <button onClick={load} className="bg-black text-white px-4 py-2 rounded">Load</button>
      {data && (
        <div className="mt-4 text-sm space-y-1">
          <div>Scanned: {data.scanned}</div>
          <div>Already used: {data.already_used}</div>
          <div>Invalid: {data.invalid}</div>
        </div>
      )}
    </div>
  );
}
