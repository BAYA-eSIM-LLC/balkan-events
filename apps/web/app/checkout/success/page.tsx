'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminFetch } from '@/lib/admin-api';
import Link from 'next/link';

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get('order');
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    // Poll status – never trust redirect as proof of payment
    const poll = async () => {
      try {
        const s = await adminFetch(`/payments/status/${orderId}`);
        setStatus(s);
        if (s.status !== 'paid' && s.status !== 'payment_late') {
          setTimeout(poll, 2000);
        }
      } catch (e: any) {
        setError(e.message);
      }
    };
    poll();
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Hvala na kupovini</h1>
      {error && <p className="text-red-600">{error}</p>}
      {status && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <p className="text-sm text-gray-500">Referenca</p>
          <p className="font-semibold">{status.reference}</p>
          <p className="text-sm text-gray-500 mt-4">Status</p>
          <p className="text-xl font-bold text-violet-600">{status.status}</p>
          <p className="text-sm text-gray-500 mt-4">Iznos</p>
          <p>{status.total_amount} {status.currency}</p>
        </div>
      )}
      <p className="text-sm text-gray-500 mb-6">Ulaznice se izdaju tek nakon potvrde webhooka.</p>
      <Link href="/my-tickets" className="inline-block bg-violet-600 text-white px-6 py-3 rounded-xl">Moje ulaznice</Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">Učitavanje...</div>}>
      <SuccessInner />
    </Suspense>
  );
}
