'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminSeatMapsPage() {
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/admin/seat-maps`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(d => { setMaps(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Seat Maps</h1>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th>ID</th><th>Name</th><th>Event</th><th>Org</th><th>Active</th></tr></thead>
        <tbody>
          {maps.map(m => (
            <tr key={m.id} className="border-b">
              <td>{m.id}</td><td>{m.name}</td><td>{m.event_id}</td><td>{m.organization_id}</td><td>{m.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {maps.length === 0 && <p className="text-gray-500 mt-4">No seat maps yet.</p>}
    </div>
  );
}
