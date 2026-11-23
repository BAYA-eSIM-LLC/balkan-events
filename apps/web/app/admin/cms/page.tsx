'use client';
export default function AdminCMS() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">CMS – Homepage</h1>
      <p className="text-zinc-400 text-sm mb-6">Upravljanje hero slideshowom, bannerima i sekcijama</p>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <p className="font-medium text-green-400">✓ Modeli i migracija pripremljeni</p>
          <p className="text-sm text-zinc-400 mt-1">HeroSlide + HomepageSection (migracija 010_cms.py)</p>
        </div>
        <div>
          <p className="font-medium">Što Super Admin može mijenjati</p>
          <ul className="text-sm text-zinc-300 mt-2 space-y-1 list-disc list-inside">
            <li>Hero slike i videozapisi (desktop + mobilni kadar)</li>
            <li>Naslove i podnaslove po kategoriji</li>
            <li>Redoslijed i trajanje slajdova</li>
            <li>Aktivacija/deaktivacija vizuala</li>
            <li>Sekcije homepagea (istaknuti, nadolazeći, organizatori…)</li>
          </ul>
        </div>
        <div className="text-xs text-zinc-500 border-t border-white/10 pt-4">
          Backend routeri za CMS bit će dodani u sljedećem koraku. Migracija se testira samo u razvojnom okruženju.
        </div>
      </div>
    </div>
  );
}
