'use client';
import { useState } from 'react';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) { alert('Prijavite se za slanje upita'); return; }
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/support/tickets?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setSent(true);
  }

  if (sent) return <p>Vaš upit je poslan. Odgovorićemo uskoro.</p>;
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Podrška</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Naslov" required className="w-full border rounded px-3 py-2" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Poruka" required rows={5} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded">Pošalji</button>
      </form>
    </div>
  );
}
