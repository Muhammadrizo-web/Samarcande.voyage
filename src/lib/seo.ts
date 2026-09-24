import type { Metadata } from 'next';
import { SITE } from '@/content/site';
import { DEPARTURES, PRICING, ROUTE, type Departure } from '@/content/tour';
import type { Dictionary } from '@/i18n/fr';
import { LOCALES, LOCALE_META, alternates, href, type Locale, type Route } from './i18n';
import { tpl } from './format';
import { statusOf } from './departures';

export const abs = (path: string) => `${SITE.url}${path}`;

export function titleFor(t: Dictionary, route: Route): { title: string; desc: string } {
  if (route.page === 'city') {
    const c = t.cityPages[route.city];
    const city = t.cities[route.city];
    return {
      title: tpl(t.meta.pages.city.title, { city }),
      desc: tpl(t.meta.pages.city.desc, { city, lead: c.lead }),
    };
  }
  const p = t.meta.pages[route.page];
  return { title: p.title, desc: p.desc };
}

export function pageMetadata(locale: Locale, route: Route, t: Dictionary): Metadata {
  const { title, desc } = titleFor(t, route);
  const alts = alternates(route);
  const url = abs(alts[locale]);
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, abs(alts[l])]));
  languages['x-default'] = abs(alts.fr);
  const noindex = route.page === 'booking';
  return {
    title: route.page === 'home' ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: url, languages },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE.name,
      title,
      description: desc,
      locale: LOCALE_META[locale].og,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].og),
      images: [{ url: abs('/og.jpg'), width: 1200, height: 630, alt: t.hero.credit }],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [abs('/og.jpg')] },
  };
}

/* ------------------------------------------------------------ JSON-LD */

export function organizationLd(locale: Locale, t: Dictionary) {
  const sameAs = Object.values(SITE.social).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': abs('/#agency'),
    name: SITE.name,
    url: abs(href(locale, 'home')),
    logo: abs('/icon-512.png'),
    image: abs('/og.jpg'),
    description: t.meta.pages.home.desc,
    email: SITE.email,
    telephone: SITE.phoneHref,
    priceRange: `€${PRICING.base}+`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street || undefined,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode || undefined,
      addressCountry: SITE.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHours: SITE.hours,
    areaServed: ['FR', 'BE', 'CH', 'CA', 'DE', 'AT', 'GB', 'RU', 'KZ'],
    knowsLanguage: ['fr', 'en', 'de', 'ru', 'uz'],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function offerFor(d: Departure, locale: Locale, now: number) {
  const status = statusOf(d, now);
  return {
    '@type': 'Offer',
    name: d.code,
    price: d.price,
    priceCurrency: 'EUR',
    availability: status === 'full' ? 'https://schema.org/SoldOut' : status === 'few' || status === 'lastminute' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
    validThrough: d.out,
    description: `${d.out} → ${d.back}`,
    url: abs(`${href(locale, 'booking')}?dep=${d.code}`),
    seller: { '@id': abs('/#agency') },
  };
}

export function tripLd(locale: Locale, t: Dictionary, now: number) {
  const live = DEPARTURES.filter((d) => statusOf(d, now));
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: t.meta.pages.tour.title,
    description: t.meta.pages.tour.desc,
    url: abs(href(locale, 'tour')),
    image: abs('/og.jpg'),
    touristType: ['Cultural tourism', 'Group tour'],
    provider: { '@id': abs('/#agency') },
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: t.days.length,
      itemListElement: t.days.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'TouristAttraction', name: `${t.ui.day} ${i + 1} — ${d.t}`, description: d.d },
      })),
    },
    offers: live.length
      ? live.map((d) => offerFor(d, locale, now))
      : { '@type': 'AggregateOffer', lowPrice: Math.min(...DEPARTURES.map((d) => d.price)), highPrice: PRICING.base, priceCurrency: 'EUR' },
    subjectOf: ROUTE.map((r) => ({ '@type': 'City', name: t.cities[r.key] })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}
