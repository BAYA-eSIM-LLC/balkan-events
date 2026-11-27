import Link from 'next/link';
import { EventItem, formatDate } from '@/lib/api';

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <Link href={`/events/${event.slug}`} className="event-card group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-slate-900/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,.18),_transparent_45%),linear-gradient(135deg,#0f172a,#334155)] px-5 text-center">
            <span className="text-2xl font-black tracking-tight text-white/90">BALKAN<span className="text-sky-300">EVENTS</span></span>
          </div>
        )}
        {event.is_featured && <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-slate-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">Izdvojeno</span>}
        <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/55 to-transparent" aria-hidden="true" />
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold text-brand-700">{formatDate(event.start_at, event.timezone)}</p>
        <h3 className="mt-2 line-clamp-2 min-h-[3.25rem] text-base font-extrabold leading-6 text-slate-950 transition group-hover:text-brand-700">{event.title}</h3>
        {(event.city || event.country) && <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><span aria-hidden="true">⌖</span><span className="line-clamp-1">{event.city}{event.country ? `, ${event.country}` : ''}</span></p>}
        {event.short_description && <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-500">{event.short_description}</p>}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition group-hover:text-brand-700">Detalji događaja <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
