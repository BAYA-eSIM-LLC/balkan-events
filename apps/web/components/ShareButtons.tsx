'use client';

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  return (
    <div className="flex gap-2 mt-4">
      <a href={`https://wa.me/?text=${text}%20${encoded}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">WhatsApp</a>
      <a href={`https://t.me/share/url?url=${encoded}&text=${text}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium">Telegram</a>
      <a href={`mailto:?subject=${text}&body=${encoded}`} className="px-4 py-2 bg-zinc-700 text-white rounded-lg text-sm font-medium">Email</a>
    </div>
  );
}
