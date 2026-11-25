import type { MetadataRoute } from 'next';
import { fetchEvents } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://balkanevents.org';
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/refund`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const events = await fetchEvents('/events?status=PUBLISHED&limit=500');
    const eventPages: MetadataRoute.Sitemap = events.map(e => ({
      url: `${base}/events/${e.slug}`,
      lastModified: new Date(e.start_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [...staticPages, ...eventPages];
  } catch {
    return staticPages;
  }
}
