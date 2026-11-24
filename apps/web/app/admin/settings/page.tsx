'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

type Tab = 'general' | 'business' | 'ticketing' | 'security' | 'notifications' | 'integrations' | 'regional' | 'system';

export default function AdminSettings() {
  const [tab, setTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ label: string; run: () => Promise<void> } | null>(null);

  function load() {
    setError(null);
    Promise.all([
      adminFetch('/admin/settings').catch(() => null),
      adminFetch('/admin/settings/status').catch(() => null),
    ]).then(([s, st]) => {
      setSettings(s);
      setStatus(st);
    }).catch(e => setError(e.message));
  }

  useEffect(() => { load(); }, []);

  async function doSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await adminFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          platform_name: settings.platform_name,
          contact_email: settings.contact_email,
          support_phone: settings.support_phone,
          logo_url: settings.logo_url,
          default_currency: settings.default_currency,
          default_language: settings.default_language,
          timezone: settings.timezone,
          platform_fee_percent: Number(settings.platform_fee_percent),
          reservation_expiry_minutes: Number(settings.reservation_expiry_minutes),
          max_tickets_per_order: Number(settings.max_tickets_per_order),
          mfa_required_admins: !!settings.mfa_required_admins,
        }),
      });
      setSettings(updated);
      setMessage('Spremljeno. Promjena je evidentirana u Audit Logu.');
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
      setConfirm(null);
    }
  }

  function askSave() {
    setConfirm({ label: 'Spremi promjene postavki platforme?', run: doSave });
  }

  if (error && !settings) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Postavke platforme</h1>
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>
      </div>
    );
  }

  const tabs: [Tab, string][] = [
    ['general', 'Generalno'],
    ['business', 'Poslovno'],
    ['ticketing', 'Ulaznice'],
    ['security', 'Sigurnost'],
    ['notifications', 'Obavijesti'],
    ['integrations', 'Integracije'],
    ['regional', 'Regionalno'],
    ['system', 'Sustav'],
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">POSTAVKE</p>
        <h1 className="text-2xl font-semibold mt-1">Postavke platforme</h1>
        <p className="text-sm text-zinc-400 mt-1">Stvarni podaci iz /admin/settings. Tajne se nikad ne prikazuju.</p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        Funkcionalno: naziv, kontakt, valuta, jezik, timezone, provizija, istek rezervacije, max ulaznica. Informativno: statusi Stripe/SMTP/Redis/DB/MFA. Blokirano: maintenance mode, uređivanje e-mail predložaka, detaljna pravila isplate/otkazivanja (backend nema podršku).
      </div>

      <div className="flex gap-2 flex-wrap text-sm">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-3 py-1.5 rounded-lg border ${tab === id ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-300'}`}>{label}</button>
        ))}
      </div>

      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}
      {message && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 rounded-xl p-3 text-sm">{message}</div>}

      {settings && tab === 'general' && (
        <div className="space-y-3 max-w-lg">
          <Field label="Naziv platforme" value={settings.platform_name} onChange={v => setSettings({ ...settings, platform_name: v })} />
          <Field label="Logo URL" value={settings.logo_url || ''} onChange={v => setSettings({ ...settings, logo_url: v })} />
          <Field label="Kontakt e-mail" value={settings.contact_email || ''} onChange={v => setSettings({ ...settings, contact_email: v })} />
          <Field label="Telefon" value={settings.support_phone || ''} onChange={v => setSettings({ ...settings, support_phone: v })} />
          <Field label="Zadana valuta" value={settings.default_currency || 'EUR'} onChange={v => setSettings({ ...settings, default_currency: v })} />
          <Field label="Jezik" value={settings.default_language || 'bs'} onChange={v => setSettings({ ...settings, default_language: v })} />
          <Field label="Vremenska zona" value={settings.timezone || 'Europe/Sarajevo'} onChange={v => setSettings({ ...settings, timezone: v })} />
        </div>
      )}

      {settings && tab === 'business' && (
        <div className="space-y-3 max-w-lg">
          <Field label="Provizija platforme (%)" value={String(settings.platform_fee_percent ?? 5)} onChange={v => setSettings({ ...settings, platform_fee_percent: v })} />
          <p className="text-xs text-zinc-500">Koristi se pri Stripe plaćanju (payments.py). Padback na env PLATFORM_FEE_PERCENT.</p>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400">
            Pravila isplate, minimalni iznos, rokovi isplate i pravila otkazivanja/povrata: backend nema odvojene konfigurabilne modele. Blokirano.
          </div>
        </div>
      )}

      {settings && tab === 'ticketing' && (
        <div className="space-y-3 max-w-lg">
          <Field label="Istek rezervacije (minute)" value={String(settings.reservation_expiry_minutes ?? 15)} onChange={v => setSettings({ ...settings, reservation_expiry_minutes: v })} />
          <Field label="Max ulaznica po narudžbi" value={String(settings.max_tickets_per_order ?? 10)} onChange={v => setSettings({ ...settings, max_tickets_per_order: v })} />
          <p className="text-xs text-zinc-500">Istek rezervacije se čita pri kreiranju narudžbe. QR i kontrola ulaza koriste postojeći scanner sustav.</p>
        </div>
      )}

      {settings && tab === 'security' && (
        <div className="space-y-3 max-w-lg">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!settings.mfa_required_admins} onChange={e => setSettings({ ...settings, mfa_required_admins: e.target.checked })} />
            MFA obavezan za admine (flag spremljen; enforcement ovisi o postojećem MFA toku)
          </label>
          <div className="text-sm text-zinc-400">
            Tvoj MFA status: {status?.mfa_enabled_for_you ? 'aktiviran' : 'nije aktiviran'}
          </div>
          <p className="text-xs text-zinc-500">Registracija, verifikacija e-maila i pravila lozinki/sesija koriste postojeći auth. Detaljna politika lozinki nije odvojeno konfigurabilna.</p>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          E-mail se šalje preko postojećeg queue + SMTP (ako je konfiguriran). Uređivanje predložaka nije podržano u backendu. SMTP status: {status?.smtp_configured ? 'konfiguriran' : 'nije konfiguriran'}.
        </div>
      )}

      {tab === 'integrations' && (
        <div className="space-y-2 text-sm">
          <StatusRow label="Stripe" value={status?.stripe_configured ? 'konfiguriran (TEST)' : 'nije konfiguriran'} />
          <StatusRow label="Stripe webhook" value={status?.stripe_webhook_configured ? 'konfiguriran' : 'nije konfiguriran'} />
          <StatusRow label="SMTP" value={status?.smtp_configured ? `konfiguriran (${status.smtp_from || ''})` : 'nije konfiguriran'} />
          <p className="text-xs text-zinc-500">Tajni ključevi se nikad ne prikazuju. Statusi su live provjere.</p>
        </div>
      )}

      {tab === 'regional' && (
        <div className="text-sm text-zinc-400">
          Aktivne države u bazi: {status?.active_countries ?? '—'} (iz Country modela). Valute i jezici se postavljaju u Generalno. Nema odvojenih regionalnih pravila prodaje.
        </div>
      )}

      {tab === 'system' && (
        <div className="space-y-2 text-sm">
          <StatusRow label="API" value={status?.api || '—'} />
          <StatusRow label="Database" value={status?.database || '—'} />
          <StatusRow label="Redis" value={status?.redis || '—'} />
          <StatusRow label="Scheduler" value={status?.scheduler || '—'} />
          <StatusRow label="Verzija" value={status?.app_version || '—'} />
          <p className="text-xs text-zinc-500">Maintenance mode nije implementiran u backendu. Backup status nije centralno evidentiran (TEST backupi postoje na gatewayu).</p>
        </div>
      )}

      {settings && (tab === 'general' || tab === 'business' || tab === 'ticketing' || tab === 'security') && (
        <button onClick={askSave} disabled={saving} className="px-4 py-2 rounded-lg bg-white text-black text-sm disabled:opacity-40">
          {saving ? 'Spremanje...' : 'Spremi promjene'}
        </button>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0d24] border border-white/10 rounded-2xl p-4 w-full max-w-sm space-y-3">
            <p className="font-semibold">Potvrda</p>
            <p className="text-sm text-zinc-300">{confirm.label}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirm(null)} className="px-3 py-1.5 rounded-lg border border-white/10 text-sm">Odustani</button>
              <button onClick={() => confirm.run()} className="px-3 py-1.5 rounded-lg bg-white text-black text-sm">Potvrdi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-zinc-400">{label}</label>
      <input className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-1">
      <span className="text-zinc-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}
