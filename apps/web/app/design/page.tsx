import { Button, Input, Badge, SectionHeading, EmptyState, Skeleton, EventCardSkeleton } from '@/components/ui';

export const metadata = { title: 'Design System' };

export default function DesignPage() {
  return (
    <div className="space-y-12 py-8">
      <SectionHeading title="Design System" subtitle="BALKAN EVENTS visual tokens and components" />

      <section>
        <h3 className="text-lg font-semibold mb-4">Buttons</h3>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="accent">Accent</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Inputs</h3>
        <div className="max-w-sm space-y-3">
          <Input label="Email" placeholder="you@example.com" />
          <Input placeholder="Search..." />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Badges</h3>
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="accent">Featured</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="muted">Draft</Badge>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Skeleton</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </section>

      <section>
        <EmptyState title="Nema događaja" description="Trenutno nema objavljenih događaja u ovoj kategoriji." />
      </section>
    </div>
  );
}
