'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminOrgDetailPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/admin/organizations/${params.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(setData);
  }, [params.id]);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{data.name}</h1>
      <p className="text-sm mb-4">{data.is_active ? 'Active' : 'Suspended'}</p>
      <h2 className="font-semibold mb-2">Members</h2>
      <ul className="text-sm mb-4">{data.members?.map((m: any) => <li key={m.user_id}>User {m.user_id} — {m.role}</li>)}</ul>
      <h2 className="font-semibold mb-2">Events</h2>
      <ul className="text-sm">{data.events?.map((e: any) => <li key={e.id}>{e.title}</li>)}</ul>
    </div>
  );
}
