'use client';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';

export default function CheckoutPage() {
  const params = useSearchParams();
  const event = params.get('event') || 'događaj';

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="text-3xl font-display font-bold mb-2">Checkout (test)</h1>
      <p className="text-gray-500 mb-8">Stvarna Stripe naplata nije aktivna. Ovo je samo demonstracija toka.</p>
      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-500">Događaj</p>
        <p className="font-semibold">{event}</p>
        <p className="text-sm text-gray-500 mt-4">Ukupno (test)</p>
        <p className="text-2xl font-bold text-violet-600">0,00 BAM</p>
      </div>
      <Button className="w-full btn-gradient text-white" disabled>Plati (test režim – nije aktivno)</Button>
      <p className="text-xs text-center text-gray-400 mt-4">Nakon odobrenja će se povezati sa postojećim Stripe endpointima.</p>
    </div>
  );
}
