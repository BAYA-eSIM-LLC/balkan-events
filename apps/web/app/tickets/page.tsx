'use client';
import { useEffect, useState } from 'react';

export default function TicketsPage() {
  const [status, setStatus] = useState('Provjera...');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setStatus('Prijavi se da vidiš svoje ulaznice.'); return; }
    // No public user-orders endpoint exists on main. Documenting the gap.
    setStatus('Nedostaje backend endpoint za listu korisničkih narudžbi i QR kodova. Funkcionalnost nije dostupna dok se ne implementira na API strani.');
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-display font-bold mb-2">Moje ulaznice</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800">
        {status}
      </div>
    </div>
  );
}
