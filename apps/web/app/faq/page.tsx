'use client';
import { useState } from 'react';

const faqs = [
  { q: 'Kako kupiti ulaznicu?', a: 'Odaberite događaj, odaberite kategoriju ulaznice, dodajte u košaricu i platite. Nakon plaćanja primit ćete email s QR kodom.' },
  { q: 'Kako prikazati ulaznicu na ulazu?', a: 'Otvorite link iz emaila ili idite na Moje ulaznice. Pokažite QR kod na ekranu.' },
  { q: 'Mogu li vratiti ulaznicu?', a: 'Povrat je moguć prema politici povrata organizatora. Kontaktirajte nas za pomoć.' },
  { q: 'Što ako ne dobijem email?', a: 'Provjerite spam folder. Ako email nije stigao, prijavite se i idite na Moje ulaznice.' },
  { q: 'Kako postati organizator?', a: 'Registrirajte se i idite na Postani organizator. Nakon verifikacije možete kreirati događaje.' },
  { q: 'Koje načine plaćanja prihvaćate?', a: 'Prihvaćamo sve glavne kreditne i debitne kartice putem Stripe-a.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1230] to-[#0d0b1f] text-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Česta pitanja</h1>
        <p className="text-zinc-400 mb-8">Odgovori na najčešća pitanja.</p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-4 text-left flex justify-between items-center"
              >
                <span className="font-medium">{faq.q}</span>
                <span className="text-zinc-400">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-zinc-400">{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-400 mb-3">Niste pronašli odgovor?</p>
          <a href="/contact" className="text-purple-400 hover:text-purple-300">Kontaktirajte nas</a>
        </div>
      </div>
    </div>
  );
}
