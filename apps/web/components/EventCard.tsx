import Link from 'next/link';

type Props = {
  id: number;
  slug: string;
  title: string;
  city?: string;
  country?: string;
  start_at: string;
  image_url?: string;
};

export default function EventCard({ slug, title, city, country, start_at, image_url }: Props) {
  return (
    <Link href={`/events/${slug}`} className="group block rounded-2xl overflow-hidden bg-[#1a1635] border border-white/10 hover:border-[#7C3AED]/40 transition-all hover:-translate-y-1">
      <div className="aspect-[4/3] relative overflow-hidden">
        {image_url ? (
          <img src={image_url} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/30 to-[#15112F]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10152B]/80 to-transparent" />
      </div>
      <div className="p-4">
        <p className="font-bold leading-tight line-clamp-2 group-hover:text-[#A78BFA] transition">{title}</p>
        <p className="text-xs text-zinc-400 mt-1.5">{city}{country ? `, ${country}` : ''}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{new Date(start_at).toLocaleDateString('bs-BA')}</p>
        <span className="inline-block mt-3 text-xs font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A020F0] text-white px-3 py-1.5 rounded-full">Kupi ulaznice →</span>
      </div>
    </Link>
  );
}
