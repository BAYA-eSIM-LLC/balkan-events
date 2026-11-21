# BALKAN EVENTS – Design System

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| brand-600 | #0284c7 | Primary actions |
| brand-700 | #0369a1 | Hover / dark |
| accent-500 | #f59e0b | Featured / highlights |
| ink | #0f172a | Primary text |
| ink-muted | #475569 | Secondary text |
| surface | #ffffff | Cards |
| surface-muted | #f8fafc | Page background |

## Typography

- **Sans:** Inter (UI)
- **Display:** Fraunces (hero headings)

## Components

- `Button` – primary / secondary / ghost / accent, sm/md/lg
- `Input` / `SearchInput`
- `Badge` – default / accent / success / muted
- `EventCard` – image, title, location, date, featured badge
- `SectionHeading`
- `Container`
- `Skeleton` / `EventCardSkeleton`
- `EmptyState`

## Accessibility

- `:focus-visible` ring on all interactive elements
- Skip link class available
- Sufficient color contrast (WCAG AA target)

## Usage

```tsx
import { Button, EventCard, SectionHeading } from '@/components/ui';
```
