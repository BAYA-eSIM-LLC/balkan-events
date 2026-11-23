'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/admin/organizations`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(setOrgs);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Organizations</h1>
      <ul className="text-sm space-y-1">
        {orgs.map(o => <li key={o.id}>{o.name} — {o.is_active ? 'active' : 'suspended'}</li>)}
        {orgs.length === 0 && <li className="text-gray-500">None</li>}
      </ul>
    </div>
  );
}
