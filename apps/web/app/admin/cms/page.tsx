'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

type Tab = 'hero' | 'sections' | 'media' | 'preview' | 'history';

const pageKeys = [
  { key: 'faq', label: 'FAQ' },
  { key: 'about', label: 'O nama' },
  { key: 'contact', label: 'Kontakt' },
  { key: 'terms', label: 'Pravila' },
  { key: 'privacy', label: 'Privatnost' },
];

export default function AdminCMS() {
  const [tab, setTab] = useState<Tab>('hero');
  const [hero, setHero] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<{ action: string; label: string; run: () => Promise<void> } | null>(null);
  const [form, setForm] = useState<any>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      adminFetch('/admin/cms/hero').catch(() => []),
      adminFetch('/admin/cms/sections').catch(() => []),
      adminFetch('/admin/cms/media').catch(() => []),
      adminFetch('/admin/cms/preview').catch(() => null),
      adminFetch('/admin/audit?page=1&page_size=100').catch(() => ({ items: [] })),
    ])
      .then(([h, s, m, p, a]) => {
        setHero(Array.isArray(h) ? h : []);
        setSections(Array.isArray(s) ? s : []);
        setMedia(Array.isArray(m) ? m : []);
        setPreview(p);
        setAudit((a?.items || []).filter((x: any) => String(x.action || '').startsWith('cms.')));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function doConfirm() {
    if (!confirm) return;
    try {
      await confirm.run();
      setConfirm(null);
      setForm(null);
      load();
    } catch (e: any) {
      setError(e.message);
      setConfirm(null);
    }
  }

  function ask(action: string, label: string, run: () => Promise<void>) {
    setConfirm({ action, label, run });
  }

  const filteredHero = hero.filter(s => {
    if (filter === 'published' && !s.is_published) return false;
    if (filter === 'draft' && s.is_published) return false;
    if (q && !`${s.title || ''} ${s.subtitle || ''}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const filteredSections = sections.filter(s => {
    if (filter === 'published' && !s.is_published) return false;
    if (filter === 'draft' && s.is_published) return false;
    if (q && !`${s.key} ${s.title || ''} ${s.description || ''}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">CMS</p>
        <h1 className="text-2xl font-semibold mt-1">Sadržaj platforme</h1>
        <p className="text-sm text-zinc-400 mt-1">Stvarni podaci iz /admin/cms. Javni portal čita samo objavljene i aktivne stavke.</p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        Zakazano objavljivanje je aktivno. Blokade: Nema odvojenih modela za FAQ, O nama, Kontakt, Pravila i Privatnost – koriste se HomepageSection ključevi. Nema admin CRUD za kategorije događaja. Nema revizijske tablice sadržaja; historija je iz AuditLog.
      </div>

      <div className="flex gap-2 flex-wrap text-sm">
        {([['hero', 'Banneri'], ['sections', 'Sekcije i stranice'], ['media', 'Media'], ['preview', 'Pregled'], ['history', 'Historija']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-3 py-1.5 rounded-lg border ${tab === id ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-300'}`}>{label}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Pretraga naslova ili ključa" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Svi statusi</option>
          <option value="draft">Draft</option>
          <option value="published">Objavljeno</option>
        </select>
        <button onClick={load} className="px-3 py-2 rounded-lg border border-white/10 text-sm">Osvježi</button>
      </div>

      {loading && <p className="text-zinc-400 text-sm">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}

      {tab === 'hero' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Hero banneri ({filteredHero.length})</h2>
            <button onClick={() => setForm({ type: 'hero', image_url: '', is_published: false, is_active: true, duration_seconds: 6, sort_order: 0 })} className="px-3 py-1.5 rounded-lg bg-white text-black text-sm">Novi banner</button>
          </div>
          {filteredHero.map(s => (
            <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{s.title || 'Bez naslova'}</p>
                  <p className="text-xs text-zinc-400">{s.subtitle || '—'} · {s.duration_seconds}s · {s.is_published ? 'Objavljen' : s.publish_at ? 'Zakazano' : 'Draft'} · {s.is_active ? 'Aktivan' : 'Neaktivan'}</p>
                  <p className="text-xs text-zinc-500 truncate">{s.image_url}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setForm({ type: 'hero', ...s })} className="px-2 py-1 rounded border border-white/10 text-xs">Uredi</button>
                  {!s.is_published && <button onClick={() => ask('Objavi', s.title || `Banner #${s.id}`, () => adminFetch(`/admin/cms/hero/${s.id}/publish`, { method: 'POST' }))} className="px-2 py-1 rounded border border-white/10 text-xs">Objavi</button>}
                  <button onClick={() => ask('Obriši', s.title || `Banner #${s.id}`, () => adminFetch(`/admin/cms/hero/${s.id}`, { method: 'DELETE' }))} className="px-2 py-1 rounded border border-red-500/40 text-red-300 text-xs">Obriši</button>
                </div>
              </div>
            </div>
          ))}
          {filteredHero.length === 0 && <p className="text-zinc-400 text-sm">Nema bannerа.</p>}
        </div>
      )}

      {tab === 'sections' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Sekcije i stranice ({filteredSections.length})</h2>
            <button onClick={() => setForm({ type: 'section', key: '', title: '', description: '', is_published: false, is_active: true, platforms: 'web,ios,android', sort_order: 0 })} className="px-3 py-1.5 rounded-lg bg-white text-black text-sm">Nova sekcija</button>
          </div>
          <div className="flex gap-1 flex-wrap text-xs">
            {pageKeys.map(p => (
              <button key={p.key} onClick={() => setForm({ type: 'section', key: p.key, title: p.label, description: '', is_published: false, is_active: true, platforms: 'web,ios,android', sort_order: 0 })} className="px-2 py-1 rounded border border-white/10">{p.label}</button>
            ))}
          </div>
          {filteredSections.map(s => (
            <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{s.title || s.key}</p>
                  <p className="text-xs text-zinc-400">{s.key} · {s.is_published ? 'Objavljena' : s.publish_at ? 'Zakazano' : 'Draft'} · {s.platforms}</p>
                  {s.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{s.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setForm({ type: 'section', ...s })} className="px-2 py-1 rounded border border-white/10 text-xs">Uredi</button>
                  {!s.is_published && <button onClick={() => ask('Objavi', s.title || s.key, () => adminFetch(`/admin/cms/sections/${s.id}/publish`, { method: 'POST' }))} className="px-2 py-1 rounded border border-white/10 text-xs">Objavi</button>}
                  <button onClick={() => ask('Obriši', s.title || s.key, () => adminFetch(`/admin/cms/sections/${s.id}`, { method: 'DELETE' }))} className="px-2 py-1 rounded border border-red-500/40 text-red-300 text-xs">Obriši</button>
                </div>
              </div>
            </div>
          ))}
          {filteredSections.length === 0 && <p className="text-zinc-400 text-sm">Nema sekcija.</p>}
        </div>
      )}

      {tab === 'media' && (
        <div className="space-y-3">
          <h2 className="font-semibold">Media ({media.length})</h2>
          <MediaUpload onDone={load} onError={setError} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {media.map(m => (
              <div key={m.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs">
                <p className="truncate font-medium">{m.original_name || m.filename}</p>
                <p className="text-zinc-500">{m.mime_type} · {m.category || '—'}</p>
                <p className="text-zinc-600 truncate">{m.url}</p>
                <button onClick={() => ask('Deaktiviraj', m.original_name || m.filename, () => adminFetch(`/admin/cms/media/${m.id}`, { method: 'DELETE' }))} className="mt-1 text-red-300">Deaktiviraj</button>
              </div>
            ))}
          </div>
          {media.length === 0 && <p className="text-zinc-400 text-sm">Nema medija.</p>}
        </div>
      )}

      {tab === 'preview' && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
          <h2 className="font-semibold mb-2">Pregled prije objave</h2>
          <p className="text-zinc-400">Hero: {preview?.hero?.length || 0} · Sekcije: {preview?.sections?.length || 0}</p>
          <p className="text-xs text-zinc-500 mt-1">{preview?.note || 'Uključuje neobjavljene stavke.'}</p>
          <div className="mt-3 space-y-1">
            {(preview?.hero || []).map((s: any) => (
              <p key={s.id} className="text-xs">{s.is_published ? '●' : '○'} {s.title || 'Banner'} · {s.image_url}</p>
            ))}
            {(preview?.sections || []).map((s: any) => (
              <p key={s.id} className="text-xs">{s.is_published ? '●' : '○'} {s.key} · {s.title || '—'}</p>
            ))}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          <h2 className="font-semibold">CMS historija ({audit.length})</h2>
          {audit.map(a => (
            <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs">
              <p>{a.action} · {a.entity_type} #{a.entity_id}</p>
              <p className="text-zinc-500">{a.created_at ? new Date(a.created_at).toLocaleString() : '—'} · user {a.user_id}</p>
            </div>
          ))}
          {audit.length === 0 && <p className="text-zinc-400 text-sm">Nema CMS audit zapisa.</p>}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-[#0d0d24] border border-white/10 rounded-2xl p-4 w-full max-w-md space-y-3">
            <h3 className="font-semibold">{form.id ? 'Uredi' : 'Novo'} {form.type === 'hero' ? 'banner' : 'sekciju'}</h3>
            {form.type === 'section' && <input value={form.key || ''} onChange={e => setForm({ ...form, key: e.target.value })} placeholder="Ključ (faq, about, contact...)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />}
            <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Naslov" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <textarea value={form.subtitle || form.description || ''} onChange={e => setForm({ ...form, [form.type === 'hero' ? 'subtitle' : 'description']: e.target.value })} placeholder="Opis" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" rows={3} />
            {form.type === 'hero' && <input value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="URL slike (obavezno)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />}
            <label className="text-xs text-zinc-400">Zakazano objavljivanje (ostavi prazno za draft)</label>
            <input type="datetime-local" value={form.publish_at ? form.publish_at.slice(0, 16) : ''} onChange={e => setForm({ ...form, publish_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg border border-white/10 text-sm">Odustani</button>
              <button onClick={() => {
                const path = form.type === 'hero'
                  ? (form.id ? `/admin/cms/hero/${form.id}` : '/admin/cms/hero')
                  : (form.id ? `/admin/cms/sections/${form.id}` : '/admin/cms/sections');
                const method = form.id ? 'PATCH' : 'POST';
                const body = form.type === 'hero'
                  ? { title: form.title, subtitle: form.subtitle, image_url: form.image_url, is_published: !!form.is_published, is_active: form.is_active !== false, duration_seconds: form.duration_seconds || 6, sort_order: form.sort_order || 0, publish_at: form.publish_at || null }
                  : { key: form.key, title: form.title, description: form.description, is_published: !!form.is_published, is_active: form.is_active !== false, platforms: form.platforms || 'web,ios,android', sort_order: form.sort_order || 0, publish_at: form.publish_at || null };
                ask('Spremi', form.title || form.key || 'stavku', () => adminFetch(path, { method, body: JSON.stringify(body) }));
              }} className="px-3 py-1.5 rounded-lg bg-white text-black text-sm">Spremi</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0d24] border border-white/10 rounded-2xl p-4 w-full max-w-sm space-y-3">
            <p className="font-semibold">{confirm.action}</p>
            <p className="text-sm text-zinc-300">{confirm.label}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirm(null)} className="px-3 py-1.5 rounded-lg border border-white/10 text-sm">Odustani</button>
              <button onClick={doConfirm} className="px-3 py-1.5 rounded-lg bg-white text-black text-sm">Potvrdi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaUpload({ onDone, onError }: { onDone: () => void; onError: (s: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  async function upload() {
    if (!file) return;
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/cms/media/upload', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFile(null);
      onDone();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex gap-2 items-center text-sm">
      <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-xs" />
      <button disabled={!file || busy} onClick={upload} className="px-3 py-1.5 rounded-lg bg-white text-black disabled:opacity-40">Upload</button>
    </div>
  );
}
