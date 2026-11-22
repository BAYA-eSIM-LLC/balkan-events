import Link from 'next/link';

type Props = {
  slug?: string;
  title: string;
  image?: string;
  date?: string;
  city?: string;
  price?: string;
  availability?: string;
};

export default function EventCard({ slug, title, image, date, city, price, availability }: Props) {
  const href = slug ? `/events/${slug}` : '/search';
  return (
    <Link href={href} className="group block bg-white rounded-xl overflow-hidden border border-zinc-200 hover:shadow-lg transition">
      <div className="aspect-[4/5] relative bg-zinc-100">
        {image ? (
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">Nema fotografije</div>
        )}
        {date && <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">{date}</span>}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base leading-snug line-clamp-2">{title}</h3>
        {city && <p className="text-sm text-zinc-500 mt-1">{city}</p>}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-[#e11d48]">{price || 'Cijena uskoro'}</span>
          {availability && <span className="text-xs text-zinc-500">{availability}</span>}
        </div>
        <span className="inline-block mt-3 text-sm font-medium text-[#e11d48] group-hover:underline">Kupi ulaznicu</span>
      </div>
    </Link>
  );
}
