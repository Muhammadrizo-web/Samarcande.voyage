import type { MetadataRoute } from 'next';
import { LOCALES, allRoutes, alternates } from '@/lib/i18n';
import { abs } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return allRoutes().flatMap((route) => {
    const alts = alternates(route);
    const languages = Object.fromEntries(LOCALES.map((l) => [l, abs(alts[l])]));
    const priority = route.page === 'home' ? 1 : route.page === 'tour' || route.page === 'dates' ? 0.9 : route.page === 'city' ? 0.8 : route.page === 'booking' ? 0.3 : 0.5;
    if (route.page === 'booking') return [];
    return LOCALES.map((l) => ({
      url: abs(alts[l]),
      lastModified: now,
      changeFrequency: route.page === 'dates' ? ('weekly' as const) : ('monthly' as const),
      priority,
      alternates: { languages },
    }));
  });
}
