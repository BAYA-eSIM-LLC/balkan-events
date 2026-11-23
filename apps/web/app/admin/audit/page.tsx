'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/audit?page=1&page_size=30')
      .then(d => setLogs(d.items || d || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Audit log</h1>
      <p className="text-zinc-400 text-sm mb-6">Evidencija administratorskih akcija</p>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      {!loading && !error && logs.length === 0 && <p className="text-zinc-400 text-sm">Nema audit zapisa.</p>}
      <div className="space-y-1 text-xs font-mono">
        {logs.map(l => (
          <div key={l.id} className="bg-white/5 border border-white/5 rounded px-3 py-2">
            <span className="text-purple-300">{l.action}</span> · {l.entity_type || '—'} #{l.entity_id || '—'} · user {l.user_id}
          </div>
        ))}
      </div>
    </div>
  );
}
