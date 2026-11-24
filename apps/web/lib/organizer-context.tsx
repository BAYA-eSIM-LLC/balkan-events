'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminFetch } from './admin-api';

type Org = { id: number; name: string; verification_status: string; is_verified: boolean };
type Ctx = {
  orgs: Org[];
  activeOrg: Org | null;
  setActiveOrgId: (id: number) => void;
  events: any[];
  loading: boolean;
  error: string | null;
};

const OrganizerContext = createContext<Ctx>({
  orgs: [], activeOrg: null, setActiveOrgId: () => {}, events: [], loading: true, error: null,
});

export function OrganizerProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('activeOrgId') : null;
    adminFetch('/organizer/organizations')
      .then((list: Org[]) => {
        setOrgs(list || []);
        const id = saved ? parseInt(saved) : (list?.[0]?.id ?? null);
        if (id && list?.some(o => o.id === id)) setActiveId(id);
        else if (list?.[0]) setActiveId(list[0].id);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    sessionStorage.setItem('activeOrgId', String(activeId));
    adminFetch('/organizer/events')
      .then((all: any[]) => setEvents((all || []).filter(e => e.organization_id === activeId)))
      .catch(() => setEvents([]));
  }, [activeId]);

  const activeOrg = orgs.find(o => o.id === activeId) || null;

  return (
    <OrganizerContext.Provider value={{ orgs, activeOrg, setActiveOrgId: setActiveId, events, loading, error }}>
      {children}
    </OrganizerContext.Provider>
  );
}

export function useOrganizer() {
  return useContext(OrganizerContext);
}
