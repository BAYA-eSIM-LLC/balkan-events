'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

const TYPES = ['STANDARD', 'VIP', 'TRIBUNE', 'STANDING', 'SPECIAL'];

export default function SeatMapBuilderPage() {
  const { events, activeOrg, loading } = useOrganizer();
  const [eventId, setEventId] = useState('');
  const [mapData, setMapData] = useState<any>(null);
  const [name, setName] = useState('Main Hall');
  const [msg, setMsg] = useState('');
  const [sec, setSec] = useState({ name: '', sector_type: 'STANDARD', base_price: '20', is_numbered: true, color: '#8B5CF6' });
  const [row, setRow] = useState({ sectorId: '', label: 'A', seats_count: '10' });

  const load = () => {
    if (!eventId) { setMapData(null); return; }
    adminFetch(`/seat-maps/event/${eventId}`).then(setMapData).catch(() => setMapData(null));
  };
  useEffect(load, [eventId]);

  const sm = mapData?.sectors ? mapData : mapData?.seat_map;

  const createMap = async () => {
    if (!eventId || !activeOrg) return;
    try {
      const d = await adminFetch('/seat-maps', { method: 'POST', body: JSON.stringify({ event_id: parseInt(eventId), organization_id: activeOrg.id, name }) });
      setMsg(`Mapa ${d.id} kreirana`);
      load();
    } catch (e: any) { setMsg(e.message); }
  };

  const addSector = async () => {
    if (!sm || !sec.name) return;
    try {
      await adminFetch(`/seat-maps/${sm.id}/sectors`, {
        method: 'POST',
        body: JSON.stringify({
          name: sec.name,
          sector_type: sec.sector_type,
          is_numbered: sec.is_numbered,
          base_price: parseFloat(sec.base_price) || 0,
          currency: 'EUR',
          color: sec.color,
        }),
      });
      setMsg(`Sektor ${sec.name} dodan`);
      setSec({ ...sec, name: '' });
      load();
    } catch (e: any) { setMsg(e.message); }
  };

  const addRow = async () => {
    if (!row.sectorId || !row.label) return;
    try {
      await adminFetch(`/seat-maps/sectors/${row.sectorId}/rows`, {
        method: 'POST',
        body: JSON.stringify({ label: row.label, seats_count: parseInt(row.seats_count) || 10, start_number: 1 }),
      });
      setMsg(`Red ${row.label} dodan`);
      load();
    } catch (e: any) { setMsg(e.message); }
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mape sjedišta</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-4">
        <option value="">Odaberi događaj</option>
        {events.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
      </select>

      {eventId && !sm && (
        <div className="flex gap-2 mb-4 max-w-md">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Naziv mape" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          <button onClick={createMap} className="bg-[#E5AD54] text-[#101B35] font-semibold px-4 py-2 rounded-lg text-sm">Nova mapa</button>
        </div>
      )}
      {msg && <p className="text-sm text-zinc-300 mb-2">{msg}</p>}

      {sm && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="font-medium">{sm.name}</p>
            <p className="text-sm text-zinc-400">ID {sm.id} · {sm.stats?.free ?? '—'} slobodno / {sm.stats?.total ?? '—'} ukupno</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold">Novi sektor</p>
            <div className="flex flex-wrap gap-2">
              <input value={sec.name} onChange={e => setSec({ ...sec, name: e.target.value })} placeholder="Naziv (Parter, VIP...)" className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
              <select value={sec.sector_type} onChange={e => setSec({ ...sec, sector_type: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <input type="number" value={sec.base_price} onChange={e => setSec({ ...sec, base_price: e.target.value })} className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
              <label className="text-xs flex items-center gap-1">
                <input type="checkbox" checked={sec.is_numbered} onChange={e => setSec({ ...sec, is_numbered: e.target.checked })} /> Numerisano
              </label>
              <button onClick={addSector} className="bg-[#E5AD54] text-[#101B35] font-semibold px-4 py-2 rounded-lg text-sm">Dodaj sektor</button>
            </div>
          </div>

          {sm.sectors?.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold">Novi red</p>
              <div className="flex flex-wrap gap-2">
                <select value={row.sectorId} onChange={e => setRow({ ...row, sectorId: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
                  <option value="">Sektor</option>
                  {sm.sectors.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input value={row.label} onChange={e => setRow({ ...row, label: e.target.value })} placeholder="Oznaka reda" className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={row.seats_count} onChange={e => setRow({ ...row, seats_count: e.target.value })} className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <button onClick={addRow} className="bg-white/10 px-4 py-2 rounded-lg text-sm">Dodaj red</button>
              </div>
            </div>
          )}

          {sm.sectors?.map((s: any) => {
            const free = s.rows?.reduce((n: number, r: any) => n + r.seats.filter((x: any) => x.status === 'FREE').length, 0) || 0;
            const sold = s.rows?.reduce((n: number, r: any) => n + r.seats.filter((x: any) => x.status === 'SOLD').length, 0) || 0;
            const res = s.rows?.reduce((n: number, r: any) => n + r.seats.filter((x: any) => x.status === 'RESERVED').length, 0) || 0;
            return (
              <div key={s.id} className="bg-white/5 rounded-xl p-4">
                <p className="font-medium">{s.name} · {s.sector_type} · {s.base_price} {s.currency}</p>
                <p className="text-xs text-zinc-400 mt-1">{s.rows?.length || 0} redova · slobodno {free} · rezervirano {res} · prodano {sold}</p>
              </div>
            );
          })}
        </div>
      )}
      {eventId && !sm && <p className="text-zinc-500 text-sm">Nema mape za ovaj događaj.</p>}
    </div>
  );
}
