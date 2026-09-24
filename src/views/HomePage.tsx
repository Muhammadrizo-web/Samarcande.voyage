import Link from 'next/link';
import { CITY_KEYS, href } from '@/lib/i18n';
import { faqFor } from '@/i18n';
import { faqLd, tripLd } from '@/lib/seo';
import { CtaBand, SectionHead } from '@/components/Blocks';
import { Carnet, CityStrip, Faq, Hero, Included, Moments, RouteBlock, TrustBlock } from '@/components/Sections';
import { NextDepartures } from '@/components/client/NextDepartures';
import { JsonLd } from '@/components/JsonLd';
import { Arrow } from '@/components/Icons';
import type { ViewProps } from './types';

export function HomePage({ locale, t, now }: ViewProps) {
  const faq = faqFor(t);
  return (
    <>
      <Hero locale={locale} t={t} />

      <section className="section screen" data-screen={t.trust.eyebrow}>
        <div className="wrap"><TrustBlock t={t} n={1} /></div>
      </section>

      <section className="section section--tint screen" data-screen={t.route.eyebrow}>
        <div className="wrap">
          <RouteBlock locale={locale} t={t} n={2} action={<Link href={href(locale, 'tour')} className="link-arrow">{t.ui.program} <Arrow /></Link>} />
        </div>
      </section>

      <section className="section screen" data-screen={t.prog.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.prog.eyebrow} n={3} title={t.prog.teaserTitle}
            aside={<Link href={href(locale, 'tour')} className="link-arrow">{t.ui.program} <Arrow /></Link>} />
          <Moments locale={locale} t={t} />
        </div>
      </section>

      <section className="section section--tint screen" data-screen={t.incl.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.incl.eyebrow} n={4} title={t.incl.title} lead={t.incl.lead} />
          <Included locale={locale} t={t} />
        </div>
      </section>

      <section className="section screen" data-screen={t.dates.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.dates.eyebrow} n={5} title={t.dates.homeTitle} lead={t.dates.lead}
            aside={<Link href={href(locale, 'dates')} className="link-arrow">{t.ui.seeDates} <Arrow /></Link>} />
          <div data-rv="">
            <NextDepartures locale={locale} buildNow={now} d={t.dates} w={t.waitlist} f={t.form} />
          </div>
        </div>
      </section>

      <section className="section section--band screen" data-screen={t.dest.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.dest.eyebrow} n={6} title={t.dest.title} lead={t.dest.lead}
            aside={<Link href={href(locale, 'destinations')} className="link-arrow" style={{ color: 'var(--band-ink)' }}>{t.ui.seeAll} <Arrow /></Link>} />
          <CityStrip locale={locale} t={t} keys={CITY_KEYS} band />
        </div>
      </section>

      <section className="section screen" data-screen={t.carnet.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.carnet.eyebrow} n={7} title={t.carnet.title} lead={t.carnet.lead} />
          <Carnet locale={locale} t={t} />
        </div>
      </section>

      <section className="section section--tint screen" data-screen={t.infos.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.infos.eyebrow} n={8} title={t.infos.title}
            aside={<Link href={href(locale, 'infos')} className="link-arrow">{t.ui.seeAll} <Arrow /></Link>} />
          <Faq items={faq.slice(0, 6)} cols />
        </div>
      </section>

      <CtaBand locale={locale} t={t} />
      <JsonLd data={[tripLd(locale, t, now), faqLd(faq)]} />
    </>
  );
}
