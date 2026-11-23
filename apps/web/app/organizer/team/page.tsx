'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OrganizerTeamPage() {
  const [orgId, setOrgId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [members, setMembers] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = async () => {
    const r = await fetch(`${API}/orgs/${orgId}/members`, { headers });
    const d = await r.json();
    if (r.ok) setMembers(d);
    else setMsg(d.detail || 'Error');
  };

  const invite = async () => {
    const r = await fetch(`${API}/orgs/${orgId}/invite`, {
      method: 'POST', headers,
      body: JSON.stringify({ email, role }),
    });
    const d = await r.json();
    setMsg(r.ok ? `Invited (token shown once)` : (d.detail || 'Error'));
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Team</h1>
      <input className="border p-2 w-full mb-2" placeholder="Organization ID" value={orgId} onChange={e => setOrgId(e.target.value)} />
      <button onClick={load} className="border px-4 py-2 rounded mb-4">Load members</button>
      <ul className="text-sm mb-4">{members.map(m => <li key={m.id}>User {m.user_id} — {m.role}</li>)}</ul>
      <div className="space-y-2">
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <select className="border p-2 w-full" value={role} onChange={e => setRole(e.target.value)}>
          <option>VIEWER</option><option>SCANNER</option><option>TICKET_MANAGER</option><option>FINANCE_MANAGER</option><option>EVENT_MANAGER</option><option>ADMIN</option>
        </select>
        <button onClick={invite} className="bg-black text-white px-4 py-2 rounded">Invite</button>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
