'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Profile() {
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const changePw = async () => {
    const token = localStorage.getItem('token');
    try {
      const r = await fetch((process.env.NEXT_PUBLIC_API_URL || '/api') + '/auth/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ current_password: curPw, new_password: newPw }),
      });
      const d = await r.json();
      setPwMsg(r.ok ? 'Lozinka promijenjena.' : (d.detail || 'Greška'));
    } catch { setPwMsg('Greška'); }
  };
  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setErr('Nisi prijavljen'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : Promise.reject()).then(setUser).catch(() => setErr('Ne mogu učitati profil'));
  }, []);

  if (err) return (
    <div className="min-h-screen bg-[#f6f5fb] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">{err}</p>
        <Link href="/login" className="mt-4 inline-block text-[#6d3df5]">Prijavi se</Link>
      </div>
    </div>
  );
  if (!user) return <div className="min-h-screen bg-[#f6f5fb] flex items-center justify-center">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-[#f6f5fb]">
      <div className="bg-[#0d0b1f] text-white py-12">
        <div className="max-w-3xl mx-auto px-5">
          <h1 className="text-3xl font-display font-semibold">Moj profil</h1>
          <p className="text-white/70 mt-1">{user.email}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <p className="text-sm text-gray-500">Ime</p>
          <p className="font-medium">{user.full_name || user.name || '—'}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <Link href="/tickets" className="block bg-white rounded-2xl p-6 shadow-sm border border-black/5 hover:border-[#7047EB]/30">
          <p className="font-medium">Moje ulaznice</p>
          <p className="text-sm text-gray-500 mt-1">Pregledaj kupljene ulaznice</p>
        </Link>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <p className="font-medium mb-3">Promjena lozinke</p>
          <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="Trenutna" className="w-full border rounded-lg px-3 py-2 mb-2 text-sm" />
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Nova" className="w-full border rounded-lg px-3 py-2 mb-2 text-sm" />
          <button onClick={changePw} className="bg-[#6d3df5] text-white px-4 py-2 rounded-lg text-sm">Spremi</button>
          {pwMsg && <p className="text-sm mt-2">{pwMsg}</p>}
        </div>
      </div>
    </div>
  );
}
