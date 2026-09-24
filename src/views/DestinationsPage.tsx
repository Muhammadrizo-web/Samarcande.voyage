import { CITY_KEYS, href } from '@/lib/i18n';
import { breadcrumbLd } from '@/lib/seo';
import { Breadcrumb, CtaBand, SectionHead } from '@/components/Blocks';
import { CityStrip, Gallery, RouteBlock } from '@/components/Sections';
import { JsonLd } from '@/components/JsonLd';
import type { ViewProps } from './types';

export function DestinationsPage({ locale, t }: ViewProps) {
  return (
    <>
      <section className="section section--first screen" data-screen={t.dest.eyebrow}>
        <div className="wrap">
          <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: t.nav.dest }]} />
          <SectionHead split as="h1" eyebrow={t.dest.eyebrow} title={t.dest.title} lead={t.dest.lead} />
          <CityStrip locale={locale} t={t} keys={CITY_KEYS} />
        </div>
      </section>
      <section className="section section--tint screen" data-screen={t.route.eyebrow}>
        <div className="wrap">
          <RouteBlock locale={locale} t={t} n={1} />
        </div>
      </section>
      <section className="section screen" data-screen={t.dest.galleryTitle}>
        <div className="wrap">
          <SectionHead split eyebrow={t.dest.galleryTitle} n={2} title={t.dest.galleryTitle} />
          <Gallery t={t} />
        </div>
      </section>
      <CtaBand locale={locale} t={t} />
      <JsonLd data={breadcrumbLd([{ name: t.ui.home, path: href(locale, 'home') }, { name: t.nav.dest, path: href(locale, 'destinations') }])} />
    </>
  );
}
