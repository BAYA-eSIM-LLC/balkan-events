'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerTeamPage() {
  const { activeOrg, loading } = useOrganizer();
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!activeOrg) return;
    adminFetch(`/organizer/members?org_id=${activeOrg.id}`).then(setMembers).catch(() => setMembers([]));
  }, [activeOrg]);

  const invite = async () => {
    if (!activeOrg || !email) return;
    try {
      await adminFetch('/organizer/members/invite', { method: 'POST', body: JSON.stringify({ organization_id: activeOrg.id, email, role: 'viewer' }) });
      setMsg('Pozivnica poslana');
      setEmail('');
    } catch (e: any) { setMsg(e.message); }
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tim</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <div className="flex gap-2 mb-4 max-w-md">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <button onClick={invite} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Pozovi</button>
      </div>
      {msg && <p className="text-sm text-zinc-300 mb-2">{msg}</p>}
      <div className="space-y-2">
        {members.map((m: any) => (
          <div key={m.user_id || m.id} className="bg-white/5 rounded-lg p-3 text-sm">{m.email || m.user_id} · {m.role}</div>
        ))}
      </div>
    </div>
  );
}
