'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  if (sent) return <p>Ako email postoji, poslali smo link za reset lozinke.</p>;
  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Zaboravljena lozinka</h1>
      <form onSubmit={submit} className="space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full border rounded px-3 py-2" />
        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded">Pošalji link</button>
      </form>
    </div>
  );
}
