'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GuestListsPage() {
  const [eventId, setEventId] = useState('');
  const [name, setName] = useState('VIP Guests');
  const [listId, setListId] = useState<number | null>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const create = async () => {
    const r = await fetch(`${API}/guest-lists`, {
      method: 'POST', headers,
      body: JSON.stringify({ event_id: Number(eventId), name }),
    });
    const d = await r.json();
    if (r.ok) { setListId(d.id); setMsg(`List ${d.id}`); }
    else setMsg(d.detail || 'Error');
  };

  const load = async () => {
    if (!listId) return;
    const r = await fetch(`${API}/guest-lists/${listId}/guests`, { headers });
    const d = await r.json();
    if (r.ok) setGuests(d);
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Guest Lists</h1>
      <div className="space-y-2 mb-4">
        <input className="border p-2 w-full" placeholder="Event ID" value={eventId} onChange={e => setEventId(e.target.value)} />
        <input className="border p-2 w-full" placeholder="List name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={create} className="bg-black text-white px-4 py-2 rounded">Create List</button>
      </div>
      {listId && (
        <div>
          <button onClick={load} className="underline text-sm">Load guests</button>
          <ul className="mt-2 text-sm">
            {guests.map(g => <li key={g.id}>{g.last_name}, {g.first_name} {g.checked_in ? '(IN)' : ''}</li>)}
          </ul>
        </div>
      )}
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
