'use client';

import { useCallback, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    google?: any;
  }
}

type Props = {
  location: string;
};

export default function EventLocationMap({ location }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const initializeMap = useCallback(() => {
    const maps = window.google?.maps;
    if (!maps || !mapElement.current) return;

    const geocoder = new maps.Geocoder();
    geocoder.geocode({ address: location }, (results: any[], resultStatus: string) => {
      const coordinates = results?.[0]?.geometry?.location;
      if (resultStatus !== 'OK' || !coordinates || !mapElement.current) {
        setStatus('error');
        return;
      }

      const map = new maps.Map(mapElement.current, {
        center: coordinates,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      new maps.Marker({ map, position: coordinates, title: location });
      setStatus('ready');
    });
  }, [location]);

  if (!apiKey) {
    return (
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-lg font-semibold text-zinc-900">Lokacija događaja</h2>
        <p className="mt-2 text-sm text-zinc-600">Google Maps će biti prikazan nakon konfiguracije API ključa.</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Lokacija događaja</h2>
      <p className="mt-1 text-sm text-zinc-500">{location}</p>
      <div className="relative mt-4 overflow-hidden rounded-xl">
        <div ref={mapElement} className="h-[320px] w-full bg-zinc-100" aria-label={`Google mapa: ${location}`} />
        {status !== 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/90 px-5 text-center text-sm text-zinc-600">
            {status === 'error'
              ? 'Lokacija nije pronađena. Provjerite naziv mjesta održavanja.'
              : 'Učitavanje Google karte…'}
          </div>
        )}
      </div>
    </section>
  );
}
