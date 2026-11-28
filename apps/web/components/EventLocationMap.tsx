'use client';

import { useEffect, useState } from 'react';

type Coordinates = {
  lat: number;
  lon: number;
};

type Props = {
  location: string;
};

export default function EventLocationMap({ location }: Props) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function findLocation() {
      try {
        setStatus('loading');
        setCoordinates(null);

        // Photon geocoding is used instead of a paid Google Maps API key.
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error('Geocoding request failed');

        const data = await response.json();
        const feature = data?.features?.[0];
        const point = feature?.geometry?.coordinates;

        if (!Array.isArray(point) || point.length < 2) {
          setStatus('error');
          return;
        }

        setCoordinates({ lon: Number(point[0]), lat: Number(point[1]) });
        setStatus('ready');
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setStatus('error');
      }
    }

    void findLocation();
    return () => controller.abort();
  }, [location]);

  const mapUrl = coordinates
    ? (() => {
        const { lat, lon } = coordinates;
        const delta = 0.012;
        const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join(',');
        return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lon}`;
      })()
    : undefined;

  const directionsUrl = coordinates
    ? `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lon}#map=16/${coordinates.lat}/${coordinates.lon}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`;

  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Lokacija događaja</h2>
      <p className="mt-1 text-sm text-zinc-500">{location}</p>
      <div className="relative mt-4 overflow-hidden rounded-xl">
        {mapUrl ? (
          <iframe
            title={`OpenStreetMap karta: ${location}`}
            src={mapUrl}
            className="h-[320px] w-full border-0 bg-zinc-100"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-[320px] items-center justify-center bg-zinc-100 px-5 text-center text-sm text-zinc-600">
            {status === 'error'
              ? 'Lokacija nije pronađena. Provjerite naziv mjesta održavanja.'
              : 'Učitavanje karte…'}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>Mapa: © OpenStreetMap saradnici</span>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-violet-700 hover:underline"
        >
          Otvori mapu
        </a>
      </div>
    </section>
  );
}
