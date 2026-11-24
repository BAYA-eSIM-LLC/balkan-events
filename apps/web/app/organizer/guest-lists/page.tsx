'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function GuestListsPage() {
  const { events, activeOrg, loading } = useOrganizer();
  const [eventId, setEventId] = useState('');
  const [lists, setLists] = useState<any[]>([]);
  const [listId, setListId] = useState<number | null>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!eventId) { setLists([]); return; }
    adminFetch(`/guest-lists?event_id=${eventId}`).then(setLists).catch(() => setLists([]));
  }, [eventId]);

  const createList = async () => {
    if (!eventId || !name) return;
    try {
      const d = await adminFetch('/guest-lists', { method: 'POST', body: JSON.stringify({ event_id: parseInt(eventId), name }) });
      setMsg(`Lista ${d.id} kreirana`);
      setLists([...lists, d]);
      setName('');
    } catch (e: any) { setMsg(e.message); }
  };

  const loadGuests = async (id: number) => {
    setListId(id);
    try {
      const d = await adminFetch(`/guest-lists/${id}/guests`);
      setGuests(d || []);
    } catch { setGuests([]); }
  };

  const addGuest = async () => {
    if (!listId || !guestName) return;
    try {
      await adminFetch(`/guest-lists/${listId}/guests`, { method: 'POST', body: JSON.stringify({ name: guestName }) });
      setGuestName('');
      loadGuests(listId);
    } catch (e: any) { setMsg(e.message); }
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Liste gostiju</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-4">
        <option value="">Odaberi događaj</option>
        {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
      </select>
      {eventId && (
        <div className="flex gap-2 mb-4 max-w-md">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Naziv liste" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          <button onClick={createList} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Nova lista</button>
        </div>
      )}
      {msg && <p className="text-sm text-zinc-300 mb-2">{msg}</p>}
      <div className="space-y-2 mb-4">
        {lists.map((l: any) => (
          <button key={l.id} onClick={() => loadGuests(l.id)} className={`block w-full text-left bg-white/5 rounded-lg p-3 text-sm ${listId === l.id ? 'border border-purple-500' : ''}`}>{l.name}</button>
        ))}
      </div>
      {listId && (
        <div>
          <div className="flex gap-2 mb-2 max-w-md">
            <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Ime gosta" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <button onClick={addGuest} className="bg-white/10 px-4 py-2 rounded-lg text-sm">Dodaj</button>
          </div>
          <div className="space-y-1">
            {guests.map((g: any) => (
              <div key={g.id} className="bg-white/5 rounded p-2 text-sm">{g.name || g.email}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
