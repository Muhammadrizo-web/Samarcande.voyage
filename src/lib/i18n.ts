/**
 * Langues, URL traduites et résolution des routes.
 * Chaque page existe dans les 4 langues avec son propre slug :
 *   /fr/circuit-ouzbekistan-12-jours/  ↔  /de/usbekistan-rundreise-12-tage/
 * Ce fichier est partagé serveur / client (petit, sans dépendance).
 */

export const LOCALES = ['fr', 'en', 'ru', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

export const LOCALE_META: Record<Locale, { label: string; short: string; intl: string; og: string }> = {
  fr: { label: 'Français', short: 'FR', intl: 'fr-FR', og: 'fr_FR' },
  en: { label: 'English', short: 'EN', intl: 'en-GB', og: 'en_GB' },
  ru: { label: 'Русский', short: 'RU', intl: 'ru-RU', og: 'ru_RU' },
  de: { label: 'Deutsch', short: 'DE', intl: 'de-DE', og: 'de_DE' },
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

export type PageKey =
  | 'home' | 'tour' | 'dates' | 'booking' | 'destinations'
  | 'agency' | 'infos' | 'contact' | 'terms' | 'legal' | 'privacy';

export const PAGE_SLUGS: Record<PageKey, Record<Locale, string>> = {
  home: { fr: '', en: '', ru: '', de: '' },
  tour: { fr: 'circuit-ouzbekistan-12-jours', en: 'uzbekistan-tour-12-days', ru: 'tur-po-uzbekistanu-12-dney', de: 'usbekistan-rundreise-12-tage' },
  dates: { fr: 'dates-et-tarifs', en: 'dates-and-prices', ru: 'daty-i-tseny', de: 'termine-und-preise' },
  booking: { fr: 'reservation', en: 'booking', ru: 'bronirovanie', de: 'buchung' },
  destinations: { fr: 'destinations', en: 'destinations', ru: 'goroda', de: 'reiseziele' },
  agency: { fr: 'agence', en: 'about-us', ru: 'o-nas', de: 'ueber-uns' },
  infos: { fr: 'infos-pratiques', en: 'practical-info', ru: 'poleznaya-informatsiya', de: 'reiseinfos' },
  contact: { fr: 'contact', en: 'contact', ru: 'kontakty', de: 'kontakt' },
  terms: { fr: 'conditions-generales-de-vente', en: 'terms-of-sale', ru: 'usloviya-prodazhi', de: 'agb' },
  legal: { fr: 'mentions-legales', en: 'legal-notice', ru: 'pravovaya-informatsiya', de: 'impressum' },
  privacy: { fr: 'confidentialite', en: 'privacy', ru: 'konfidentsialnost', de: 'datenschutz' },
};

/** Étapes qui ont leur propre page (Ourguentch n'est qu'un aéroport : pas de page). */
export const CITY_KEYS = ['tas', 'sam', 'shk', 'yan', 'buk', 'khi'] as const;
export type CityKey = (typeof CITY_KEYS)[number];

export const CITY_SLUGS: Record<CityKey, Record<Locale, string>> = {
  tas: { fr: 'tachkent', en: 'tashkent', ru: 'tashkent', de: 'taschkent' },
  sam: { fr: 'samarcande', en: 'samarkand', ru: 'samarkand', de: 'samarkand' },
  shk: { fr: 'chakhrisabz', en: 'shakhrisabz', ru: 'shakhrisabz', de: 'schachrisabs' },
  yan: { fr: 'desert-kyzyl-koum-yourtes', en: 'kyzylkum-desert-yurt-camp', ru: 'pustynya-kyzylkum-yurty', de: 'kysylkum-wueste-jurten' },
  buk: { fr: 'boukhara', en: 'bukhara', ru: 'bukhara', de: 'buchara' },
  khi: { fr: 'khiva', en: 'khiva', ru: 'khiva', de: 'chiwa' },
};

export type Route = { page: PageKey } | { page: 'city'; city: CityKey };

const trail = (s: string) => (s ? `${s}/` : '');

/** Chemin interne (sans basePath : next/link l'ajoute). */
export function href(locale: Locale, route: Route | PageKey): string {
  const r: Route = typeof route === 'string' ? { page: route } : route;
  if (r.page === 'city') {
    return `/${locale}/${PAGE_SLUGS.destinations[locale]}/${CITY_SLUGS[r.city][locale]}/`;
  }
  return `/${locale}/${trail(PAGE_SLUGS[r.page][locale])}`;
}

export function resolve(locale: Locale, segments: string[] = []): Route | null {
  const [a, b, ...rest] = segments.map((s) => decodeURIComponent(s));
  if (rest.length) return null;
  if (!a) return { page: 'home' };
  if (b !== undefined) {
    if (a !== PAGE_SLUGS.destinations[locale]) return null;
    const city = CITY_KEYS.find((k) => CITY_SLUGS[k][locale] === b);
    return city ? { page: 'city', city } : null;
  }
  const page = (Object.keys(PAGE_SLUGS) as PageKey[]).find((k) => k !== 'home' && PAGE_SLUGS[k][locale] === a);
  return page ? { page } : null;
}

/** Retrouve la route à partir d'un pathname complet (utilisé par le sélecteur de langue). */
export function routeFromPath(pathname: string): { locale: Locale; route: Route } | null {
  const parts = pathname.split('/').filter(Boolean);
  const i = parts.findIndex((p) => isLocale(p));
  if (i < 0) return null;
  const locale = parts[i] as Locale;
  const route = resolve(locale, parts.slice(i + 1));
  return route ? { locale, route } : null;
}

export function allRoutes(): Route[] {
  const pages = (Object.keys(PAGE_SLUGS) as PageKey[]).map((page) => ({ page }) as Route);
  const cities = CITY_KEYS.map((city) => ({ page: 'city', city }) as Route);
  return [...pages, ...cities];
}

export function alternates(route: Route): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, href(l, route)])) as Record<Locale, string>;
}

export function routeId(route: Route): string {
  return route.page === 'city' ? `city:${route.city}` : route.page;
}
