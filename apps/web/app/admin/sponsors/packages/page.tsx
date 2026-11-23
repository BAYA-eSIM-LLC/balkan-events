'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/admin/sponsors/packages`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(setPackages);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sponsor Packages</h1>
      <ul className="text-sm space-y-1">
        {packages.map(p => <li key={p.id}>{p.name} ({p.code}) — {p.price}</li>)}
        {packages.length === 0 && <li className="text-gray-500">No packages defined</li>}
      </ul>
    </div>
  );
}
