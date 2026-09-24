import { href } from '@/lib/i18n';
import { breadcrumbLd, tripLd } from '@/lib/seo';
import { Breadcrumb, CtaBand, Eyebrow, SectionHead } from '@/components/Blocks';
import { DayBlock, Hotels, Included, RouteBlock } from '@/components/Sections';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { Clock, Plate, Users } from '@/components/Icons';
import type { ViewProps } from './types';

export function TourPage({ locale, t, now }: ViewProps) {
  return (
    <>
      <section className="section section--first screen" data-screen={t.nav.tour}>
        <div className="wrap">
          <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: t.nav.tour }]} />
          <div className="city-hero">
            <div className="grid gap-6">
              <Eyebrow>{t.meta.tagline}</Eyebrow>
              <h1 className="h1">{t.hero.title.join(' ')}</h1>
              <p className="lead">{t.hero.lead}</p>
              <div className="city-facts">
                <span><Clock />{t.hero.facts[0]}</span>
                <span><Users />{t.hero.facts[1]}</span>
                <span><Plate />{t.hero.facts[2]}</span>
              </div>
            </div>
            <div className="frame city-hero__img" data-rv="clip">
              <Picture name="city-samarcande" alt={t.cities.sam} priority sizes="(min-width: 960px) 40vw, 92vw" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint screen" data-screen={t.route.eyebrow}>
        <div className="wrap">
          <RouteBlock locale={locale} t={t} n={1} />
        </div>
      </section>

      <section className="section screen" data-screen={t.prog.eyebrow} id="programme">
        <div className="wrap">
          <DayBlock t={t} n={2} />
        </div>
      </section>

      <section className="section section--tint screen" data-screen={t.incl.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.incl.eyebrow} n={3} title={t.incl.title} lead={t.incl.lead} />
          <Included locale={locale} t={t} />
        </div>
      </section>

      <section className="section screen" data-screen={t.prog.hotelsTitle}>
        <div className="wrap">
          <SectionHead split eyebrow={t.prog.hotelsTitle} n={4} title={t.prog.hotelsTitle} lead={t.prog.hotelsLead} />
          <Hotels locale={locale} t={t} />
        </div>
      </section>

      <CtaBand locale={locale} t={t} />
      <JsonLd data={[
        tripLd(locale, t, now),
        breadcrumbLd([{ name: t.ui.home, path: href(locale, 'home') }, { name: t.nav.tour, path: href(locale, 'tour') }]),
      ]} />
    </>
  );
}
