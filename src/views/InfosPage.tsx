import { faqFor } from '@/i18n';
import { href } from '@/lib/i18n';
import { breadcrumbLd, faqLd } from '@/lib/seo';
import { Breadcrumb, CtaBand, SectionHead } from '@/components/Blocks';
import { Climate, Faq } from '@/components/Sections';
import { JsonLd } from '@/components/JsonLd';
import type { ViewProps } from './types';

export function InfosPage({ locale, t }: ViewProps) {
  const faq = faqFor(t);
  return (
    <>
      <section className="section section--first screen" data-screen={t.infos.eyebrow}>
        <div className="wrap">
          <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: t.nav.infos }]} />
          <SectionHead split as="h1" eyebrow={t.infos.eyebrow} title={t.infos.title} lead={t.infos.lead} />
          <Faq items={faq} cols />
        </div>
      </section>

      <section className="section section--tint screen" data-screen={t.infos.climateTitle}>
        <div className="wrap">
          <SectionHead split eyebrow={t.infos.climateTitle} n={1} title={t.infos.climateTitle} lead={t.infos.climateLead} />
          <Climate t={t} />
        </div>
      </section>

      <section className="section screen" data-screen={t.infos.practicalTitle}>
        <div className="wrap">
          <SectionHead eyebrow={t.infos.practicalTitle} n={2} title={t.infos.practicalTitle} />
          <div className="practical" data-rv="">
            {t.infos.practical.map((p) => <div key={p.t}><b>{p.t}</b><p>{p.d}</p></div>)}
          </div>
        </div>
      </section>

      <CtaBand locale={locale} t={t} />
      <JsonLd data={[faqLd(faq), breadcrumbLd([{ name: t.ui.home, path: href(locale, 'home') }, { name: t.nav.infos, path: href(locale, 'infos') }])]} />
    </>
  );
}
