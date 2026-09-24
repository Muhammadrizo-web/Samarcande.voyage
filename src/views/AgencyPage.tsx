import { SITE } from '@/content/site';
import { href } from '@/lib/i18n';
import { breadcrumbLd } from '@/lib/seo';
import { Breadcrumb, CtaBand, Eyebrow, SectionHead } from '@/components/Blocks';
import { Pillars } from '@/components/Sections';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { Info } from '@/components/Icons';
import type { ViewProps } from './types';

export function AgencyPage({ locale, t }: ViewProps) {
  const facts = t.agency.facts.map((f, i) =>
    i === 0 && SITE.licence ? { ...f, d: `${t.agency.licenceLabel} ${SITE.licence}` } : f);
  return (
    <>
      <section className="section section--first screen" data-screen={t.agency.eyebrow}>
        <div className="wrap">
          <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: t.nav.agency }]} />
          <div className="city-hero">
            <div className="grid gap-5">
              <Eyebrow>{t.agency.eyebrow}</Eyebrow>
              <h1 className="h1">{t.agency.title}</h1>
              <p className="lead">{t.agency.lead}</p>
              {t.agency.p.map((p, i) => <p key={i} className="muted agency__p">{p}</p>)}
            </div>
            <figure className="frame city-hero__img" data-rv="clip">
              <Picture name="terrain" alt={t.agency.photoCaption} priority sizes="(min-width: 960px) 40vw, 92vw" />
              <figcaption className="frame__cap">{t.agency.photoCaption}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section section--tint screen" data-screen={t.trust.eyebrow}>
        <div className="wrap">
          <SectionHead eyebrow={t.trust.eyebrow} n={1} title={t.trust.title} />
          <Pillars t={t} />
        </div>
      </section>

      <section className="section screen" data-screen={t.agency.factsTitle}>
        <div className="wrap wrap--narrow">
          <SectionHead eyebrow={t.agency.factsTitle} n={2} title={t.agency.factsTitle} />
          <div className="facts" data-rv="">
            {facts.map((f) => <div key={f.t}><b>{f.t}</b><p>{f.d}</p></div>)}
          </div>
          <div className="callout" style={{ marginTop: 28 }} data-rv=""><Info /><span>{t.agency.honest}</span></div>
        </div>
      </section>

      <CtaBand locale={locale} t={t} />
      <JsonLd data={breadcrumbLd([{ name: t.ui.home, path: href(locale, 'home') }, { name: t.nav.agency, path: href(locale, 'agency') }])} />
    </>
  );
}
