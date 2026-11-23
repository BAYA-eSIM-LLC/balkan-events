'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OrganizerPermissionsPage() {
  const [matrix, setMatrix] = useState<any>({});

  useEffect(() => {
    fetch(`${API}/orgs/permissions/matrix`).then(r => r.json()).then(setMatrix);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Permission Matrix</h1>
      <div className="text-sm space-y-2">
        {Object.entries(matrix).map(([role, caps]) => (
          <div key={role} className="border p-2 rounded">
            <span className="font-semibold">{role}</span>: {(caps as string[]).join(', ')}
          </div>
        ))}
      </div>
    </div>
  );
}
