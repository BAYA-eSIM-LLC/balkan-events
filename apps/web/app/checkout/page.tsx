'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-api';

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('order');
  const event = params.get('event') || 'događaj';
  const amount = params.get('amount') || '—';
  const qty = params.get('qty') || '1';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    if (!orderId) { setError('Nedostaje ID narudžbe'); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch(`/payments/checkout/${orderId}`, { method: 'POST' });
      // Redirect to Stripe Checkout. Frontend does NOT confirm payment.
      if (data.url) window.location.href = data.url;
      else setError('Stripe nije vratio URL');
    } catch (e: any) {
      setError(e.message || 'Greška pri kreiranju Checkout sesije');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Checkout</h1>
      <p className="text-gray-500 mb-6">Stripe TEST MODE. Plaćanje se potvrđuje isključivo webhookom.</p>
      <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-2">
        <p className="text-sm text-gray-500">Događaj</p>
        <p className="font-semibold">{event}</p>
        <p className="text-sm text-gray-500 mt-4">Količina</p>
        <p className="font-semibold">{qty}</p>
        <p className="text-sm text-gray-500 mt-4">Ukupno</p>
        <p className="text-2xl font-bold text-violet-600">{amount} EUR</p>
      </div>
      {error && <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm mb-4">{error}</div>}
      <button
        onClick={startCheckout}
        disabled={loading || !orderId}
        className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {loading ? 'Preusmjeravanje...' : 'Plati s karticom (TEST)'}
      </button>
      <p className="text-xs text-center text-gray-400 mt-4">Koristi test karticu 4242 4242 4242 4242</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-6 py-16 text-center">Učitavanje...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
