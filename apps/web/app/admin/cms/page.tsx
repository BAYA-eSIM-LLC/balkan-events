'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminCMS() {
  const [slides, setSlides] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminFetch('/admin/cms/hero').catch(() => []),
      adminFetch('/admin/cms/sections').catch(() => []),
      adminFetch('/admin/cms/media').catch(() => []),
    ]).then(([h, s, m]) => {
      setSlides(Array.isArray(h) ? h : []);
      setSections(Array.isArray(s) ? s : []);
      setMedia(Array.isArray(m) ? m : []);
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const loadPreview = () => {
    adminFetch('/admin/cms/preview').then(setPreview).catch(e => setError(e.message));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">CMS – Homepage</h1>
      <p className="text-zinc-400 text-sm mb-6">Media, hero, sekcije, preview, publish</p>

      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}

      <div className="mb-6 flex gap-3">
        <button onClick={loadPreview} className="text-xs bg-purple-600 px-4 py-2 rounded-lg">Preview (uključuje neobjavljeno)</button>
      </div>

      {preview && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6 text-sm">
          <p className="font-medium text-purple-300 mb-2">Preview</p>
          <p className="text-xs text-zinc-400">Hero: {preview.hero?.length || 0} · Sekcije: {preview.sections?.length || 0}</p>
          <p className="text-xs text-zinc-500 mt-1">{preview.note}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-semibold mb-3">Media Library ({media.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {media.map(m => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs">
              <p className="truncate">{m.original_name || m.filename}</p>
              <p className="text-zinc-500">{m.mime_type}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-3">Hero slajdovi</h2>
        {slides.map(s => (
          <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-3 mb-2 flex justify-between text-sm">
            <div>
              <p className="font-medium">{s.title || 'Bez naslova'}</p>
              <p className="text-xs text-zinc-400">{s.category || '—'} · {s.duration_seconds}s · {s.is_published ? 'Objavljen' : 'Draft'} · {s.is_active ? 'Aktivan' : 'Neaktivan'}</p>
            </div>
          </div>
        ))}
        {slides.length === 0 && !loading && <p className="text-zinc-400 text-sm">Nema slajdova.</p>}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Sekcije</h2>
        {sections.map(sec => (
          <div key={sec.id} className="bg-white/5 border border-white/10 rounded-xl p-3 mb-2 text-sm">
            <p className="font-medium">{sec.title || sec.key}</p>
            <p className="text-xs text-zinc-400">{sec.is_published ? 'Objavljena' : 'Draft'} · {sec.platforms}</p>
          </div>
        ))}
        {sections.length === 0 && !loading && <p className="text-zinc-400 text-sm">Nema sekcija.</p>}
      </div>

      <div className="mt-6 text-xs text-zinc-500 border-t border-white/10 pt-4">
        Javni: <code className="text-purple-300">GET /public/homepage</code> (samo published + active)
      </div>
    </div>
  );
}
