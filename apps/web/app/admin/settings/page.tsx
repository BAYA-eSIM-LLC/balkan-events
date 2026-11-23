'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/admin/settings')
      .then(setSettings)
      .catch(e => setError(e.message || 'API unavailable'));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await adminFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          platform_name: settings.platform_name,
          contact_email: settings.contact_email,
          default_currency: settings.default_currency,
          default_language: settings.default_language,
        }),
      });
      setSettings(updated);
      setMessage('Spremljeno. Promjena je evidentirana u Audit Logu.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !settings) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Postavke platforme</h1>
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">
          {error}
          <p className="text-xs text-zinc-500 mt-2">Endpoint /admin/settings mora biti aktivan. Nema demo podataka.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Postavke platforme</h1>
      <p className="text-zinc-400 text-sm mb-6">Samo neosjetljive postavke. Tajne se nikad ne prikazuju.</p>

      {settings && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400">Naziv platforme</label>
            <input
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              value={settings.platform_name || ''}
              onChange={e => setSettings({ ...settings, platform_name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Kontakt email</label>
            <input
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              value={settings.contact_email || ''}
              onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Default valuta</label>
            <input
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              value={settings.default_currency || 'EUR'}
              onChange={e => setSettings({ ...settings, default_currency: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Default jezik</label>
            <input
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              value={settings.default_language || 'bs'}
              onChange={e => setSettings({ ...settings, default_language: e.target.value })}
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
          >
            {saving ? 'Spremanje...' : 'Spremi'}
          </button>
          {message && <p className="text-green-400 text-sm">{message}</p>}
        </div>
      )}
    </div>
  );
}
