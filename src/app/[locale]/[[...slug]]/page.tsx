import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDict } from '@/i18n';
import { LOCALES, allRoutes, href, isLocale, resolve, type Locale, type Route } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { HomePage } from '@/views/HomePage';
import { TourPage } from '@/views/TourPage';
import { DatesPage } from '@/views/DatesPage';
import { BookingPage } from '@/views/BookingPage';
import { DestinationsPage } from '@/views/DestinationsPage';
import { CityPage } from '@/views/CityPage';
import { AgencyPage } from '@/views/AgencyPage';
import { InfosPage } from '@/views/InfosPage';
import { ContactPage } from '@/views/ContactPage';
import { LegalPage } from '@/views/LegalPage';

type Params = { locale: string; slug?: string[] };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return LOCALES.flatMap((locale) =>
    allRoutes().map((route) => {
      const segs = href(locale, route).split('/').filter(Boolean).slice(1);
      return { locale, slug: segs.length ? segs : undefined };
    }),
  );
}

async function read(params: Promise<Params>): Promise<{ locale: Locale; route: Route }> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const route = resolve(locale, slug);
  if (!route) notFound();
  return { locale, route };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, route } = await read(params);
  return pageMetadata(locale, route, getDict(locale));
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale, route } = await read(params);
  const t = getDict(locale);
  const now = Date.now();
  const props = { locale, t, now };
  let view;
  switch (route.page) {
    case 'home': view = <HomePage {...props} />; break;
    case 'tour': view = <TourPage {...props} />; break;
    case 'dates': view = <DatesPage {...props} />; break;
    case 'booking': view = <BookingPage {...props} />; break;
    case 'destinations': view = <DestinationsPage {...props} />; break;
    case 'city': view = <CityPage {...props} city={route.city} />; break;
    case 'agency': view = <AgencyPage {...props} />; break;
    case 'infos': view = <InfosPage {...props} />; break;
    case 'contact': view = <ContactPage {...props} />; break;
    case 'terms': case 'legal': case 'privacy': view = <LegalPage {...props} kind={route.page} />; break;
  }
  return <div className="page-enter">{view}</div>;
}
