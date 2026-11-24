'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerPOS() {
  const { events, activeOrg, loading } = useOrganizer();
  const [points, setPoints] = useState<any[]>([]);
  const [pointId, setPointId] = useState('');
  const [reg, setReg] = useState<any>(null);
  const [eventId, setEventId] = useState('');
  const [types, setTypes] = useState<any[]>([]);
  const [typeId, setTypeId] = useState('');
  const [msg, setMsg] = useState('');
  const [staff, setStaff] = useState<any[]>([]);
  const [staffUserId, setStaffUserId] = useState('');

  useEffect(() => {
    if (!activeOrg) return;
    adminFetch(`/pos/sales-points?organization_id=${activeOrg.id}`).then(setPoints).catch(() => setPoints([]));
  }, [activeOrg]);

  useEffect(() => {
    if (!eventId) { setTypes([]); return; }
    adminFetch(`/organizer/events/${eventId}/ticket-types`).then(setTypes).catch(() => setTypes([]));
  }, [eventId]);

  const openReg = async () => {
    if (!pointId) return;
    try {
      const r = await adminFetch('/pos/registers/open', { method: 'POST', body: JSON.stringify({ sales_point_id: parseInt(pointId), opening_balance: 0 }) });
      setReg(r);
      setMsg('Blagajna otvorena');
    } catch (e: any) { setMsg(e.message); }
  };

  const closeReg = async () => {
    if (!reg) return;
    try {
      await adminFetch(`/pos/registers/${reg.id}/close`, { method: 'POST', body: JSON.stringify({ closing_balance: 0 }) });
      setReg(null);
      setMsg('Blagajna zatvorena');
    } catch (e: any) { setMsg(e.message); }
  };

  const sell = async () => {
    if (!typeId || !reg) return;
    try {
      const r = await adminFetch('/pos/sale', { method: 'POST', body: JSON.stringify({ ticket_type_id: parseInt(typeId), quantity: 1, register_id: reg.id }) });
      setMsg(`Prodano: ${r.reference || r.id}`);
    } catch (e: any) { setMsg(e.message); }
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">POS</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <div className="space-y-3 max-w-md">
        <select value={pointId} onChange={e => setPointId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Odaberi prodajno mjesto</option>
          {points.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex items-center gap-2 text-sm">
          <span className={reg ? 'text-emerald-400' : 'text-zinc-500'}>{reg ? 'Blagajna OTVORENA' : 'Blagajna ZATVORENA'}</span>
          {!reg && pointId && <button onClick={openReg} className="bg-emerald-600 px-3 py-1 rounded text-xs">Otvori</button>}
          {reg && <button onClick={closeReg} className="bg-red-600/80 px-3 py-1 rounded text-xs">Zatvori</button>}
        </div>
        <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Odaberi događaj</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <select value={typeId} onChange={e => setTypeId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Odaberi kategoriju</option>
          {types.map(t => <option key={t.id} value={t.id}>{t.name} · {t.price} {t.currency}</option>)}
        </select>
        {pointId && (
          <div className="border-t border-white/10 pt-3">
            <p className="text-xs text-zinc-400 mb-2">Zaposlenici</p>
            <div className="flex gap-2 mb-2">
              <input value={staffUserId} onChange={e => setStaffUserId(e.target.value)} placeholder="User ID" className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm" />
              <button onClick={async () => { if (!staffUserId) return; try { await adminFetch(`/pos/sales-points/${pointId}/staff`, { method: 'POST', body: JSON.stringify({ user_id: parseInt(staffUserId), role: 'SELLER' }) }); setMsg('Dodan'); setStaffUserId(''); adminFetch(`/pos/sales-points/${pointId}/staff`).then(setStaff); } catch (e: any) { setMsg(e.message); } }} className="bg-white/10 px-2 py-1 rounded text-xs">Dodaj</button>
            </div>
          </div>
        )}
        <button onClick={sell} disabled={!reg} className="bg-purple-600 disabled:opacity-40 px-4 py-2 rounded-lg text-sm">Prodaj (cash)</button>
        {msg && <p className="text-sm text-zinc-300">{msg}</p>}
      </div>
    </div>
  );
}
