import { href } from '@/lib/i18n';
import { breadcrumbLd, tripLd } from '@/lib/seo';
import { Breadcrumb, CtaBand, SectionHead } from '@/components/Blocks';
import { Included } from '@/components/Sections';
import { DatesPlanner } from '@/components/client/DatesPlanner';
import { JsonLd } from '@/components/JsonLd';
import type { ViewProps } from './types';

export function DatesPage({ locale, t, now }: ViewProps) {
  return (
    <>
      <section className="section section--first">
        <div className="wrap">
          <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: t.nav.dates }]} />
          <SectionHead as="h1" eyebrow={t.dates.eyebrow} title={t.dates.title} lead={t.dates.lead} />
          <DatesPlanner
            locale={locale} buildNow={now} d={t.dates} w={t.waitlist} f={t.form} ui={t.ui}
            bookHref={href(locale, 'booking')} contactHref={href(locale, 'contact')}
          />
        </div>
      </section>
      <section className="section section--tint screen" data-screen={t.incl.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.incl.eyebrow} title={t.incl.title} lead={t.incl.lead} />
          <Included locale={locale} t={t} />
        </div>
      </section>
      <CtaBand locale={locale} t={t} />
      <JsonLd data={[
        tripLd(locale, t, now),
        breadcrumbLd([{ name: t.ui.home, path: href(locale, 'home') }, { name: t.nav.dates, path: href(locale, 'dates') }]),
      ]} />
    </>
  );
}
