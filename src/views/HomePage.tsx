import Link from 'next/link';
import { href, type CityKey } from '@/lib/i18n';
import { faqFor } from '@/i18n';
import { faqLd, tripLd } from '@/lib/seo';
import { CtaBand, SectionBg, SectionHead } from '@/components/Blocks';
import { CityStrip, Faq, Hero, IntroBlock, PassionBlock, RouteBlock, WhyBlock } from '@/components/Sections';
import { NextDepartures } from '@/components/client/NextDepartures';
import { JsonLd } from '@/components/JsonLd';
import { Arrow } from '@/components/Icons';
import type { ViewProps } from './types';

/** « Un voyage, mille découvertes » : ordre du texte de l'agence (Nourata = étape du désert). */
const DISCOVER: readonly CityKey[] = ['tas', 'sam', 'shk', 'yan', 'buk', 'khi'];

export function HomePage({ locale, t, now }: ViewProps) {
  const faq = faqFor(t);
  const h = t.home;
  return (
    <>
      <Hero locale={locale} t={t} />

      <section className="section screen" data-screen={h.intro.eyebrow}>
        <div className="wrap"><IntroBlock t={t} n={1} /></div>
      </section>

      <section className="section section--tint screen" data-screen={h.why.eyebrow}>
        <div className="wrap"><WhyBlock t={t} n={2} /></div>
      </section>

      <section className="section section--band screen" data-screen={h.discover.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={h.discover.eyebrow} n={3} title={h.discover.title} lead={h.discover.lead}
            aside={<Link href={href(locale, 'destinations')} className="link-arrow" style={{ color: 'var(--band-ink)' }}>{t.ui.seeAll} <Arrow /></Link>} />
          <CityStrip locale={locale} t={t} keys={DISCOVER} band noMeta notes={h.discover.notes} />
        </div>
      </section>

      <section className="section screen has-bg has-photo" data-screen={h.passion.eyebrow}>
        <SectionBg name="g8" pos="50% 35%" />
        <div className="wrap"><PassionBlock locale={locale} t={t} n={4} /></div>
      </section>

      <section className="section section--tint screen" data-screen={t.route.eyebrow}>
        <div className="wrap">
          <RouteBlock locale={locale} t={t} n={5} action={<Link href={href(locale, 'tour')} className="link-arrow">{t.ui.program} <Arrow /></Link>} />
        </div>
      </section>

      <section className="section screen has-bg has-photo" data-screen={t.nav.group}>
        <SectionBg name="city-tachkent" pos="50% 50%" soft />
        <div className="wrap">
          <SectionHead split eyebrow={t.nav.group} n={6} title={t.dates.homeTitle} lead={t.dates.lead}
            aside={<Link href={href(locale, 'dates')} className="link-arrow">{t.ui.seeDates} <Arrow /></Link>} />
          <div data-rv="">
            <NextDepartures locale={locale} buildNow={now} d={t.dates} w={t.waitlist} f={t.form} />
          </div>
        </div>
      </section>

      <section className="section section--tint screen" data-screen={t.infos.eyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={t.infos.eyebrow} n={7} title={t.infos.title}
            aside={<Link href={href(locale, 'infos')} className="link-arrow">{t.ui.seeAll} <Arrow /></Link>} />
          <Faq items={faq.slice(0, 6)} cols />
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={h.band.title} text={h.band.text} btn={h.band.btn} to="custom" />
      <JsonLd data={[tripLd(locale, t, now), faqLd(faq)]} />
    </>
  );
}
