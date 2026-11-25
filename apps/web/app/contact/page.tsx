'use client';
import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1230] to-[#0d0b1f] text-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Kontakt</h1>
        <p className="text-zinc-400 mb-8">Imate pitanje? Javite nam se.</p>

        {sent ? (
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
            <p className="text-emerald-400 text-lg">Poruka poslana!</p>
            <p className="text-zinc-400 mt-2">Odgovorit ćemo u najkraćem roku.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Ime"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
            />
            <textarea
              placeholder="Poruka"
              required
              rows={5}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 resize-none"
            />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium">
              Pošalji
            </button>
          </form>
        )}

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Email</h3>
            <a href="mailto:info@balkanevents.org" className="text-purple-400">info@balkanevents.org</a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Podrška</h3>
            <a href="mailto:support@balkanevents.org" className="text-purple-400">support@balkanevents.org</a>
          </div>
        </div>
      </div>
    </div>
  );
}
