import Link from 'next/link';
import { SITE } from '@/content/site';
import { href } from '@/lib/i18n';
import { breadcrumbLd } from '@/lib/seo';
import { Breadcrumb, Eyebrow, SectionHead } from '@/components/Blocks';
import { ContactForm } from '@/components/client/ContactForm';
import { QuoteCalc } from '@/components/client/QuoteRequest';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { Arrow, Info, Mail, Phone, Telegram, WhatsApp } from '@/components/Icons';
import type { ViewProps } from './types';

/** Voyages sur mesure : comment ça marche, ce que nous organisons, formulaire de demande. */
export function CustomPage({ locale, t }: ViewProps) {
  const c = t.custom;
  return (
    <>
      <section className="section section--first screen" data-screen={c.eyebrow}>
        <div className="wrap">
          <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: t.nav.custom }]} />
          <div className="city-hero">
            <div className="grid gap-6">
              <Eyebrow>{c.eyebrow}</Eyebrow>
              <h1 className="h1">{c.title}</h1>
              <p className="lead">{c.lead}</p>
              <ul className="passion__who passion__who--links">
                {t.home.passion.who.map((w) => <li key={w}><a href="#demande">{w}</a></li>)}
              </ul>
              <div className="hero__cta">
                <a href="#demande" className="btn btn--primary">{c.formTitle} <Arrow /></a>
              </div>
            </div>
            <div className="frame city-hero__img" data-rv="clip">
              <Picture name="city-boukhara" alt={t.cities.buk} priority sizes="(min-width: 960px) 40vw, 92vw" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint screen" data-screen={c.stepsEyebrow}>
        <div className="wrap">
          <SectionHead eyebrow={c.stepsEyebrow} n={1} title={c.stepsTitle} />
          <ol className="steps steps--how">
            {c.steps.map((s, i) => (
              <li key={i} className="pillar" data-rv="">
                <span className="pillar__n">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h4">{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section screen" data-screen={c.orgEyebrow}>
        <div className="wrap">
          <SectionHead split eyebrow={c.orgEyebrow} n={2} title={c.orgTitle} />
          <div className="org">
            {c.org.map((o) => (
              <div key={o.t} className="panel org__item" data-rv="">
                <h3 className="h3">{o.t}</h3>
                <p className="muted">{o.d}</p>
              </div>
            ))}
          </div>
          <div className="callout" style={{ marginTop: 28 }} data-rv="">
            <Info />
            <span>{c.baseNote} <Link href={href(locale, 'tour')} className="link-arrow">{c.baseLink} <Arrow /></Link></span>
          </div>
        </div>
      </section>

      <section className="section screen" id="calcul" data-screen={t.dates.calcTitle}>
        <div className="wrap">
          <SectionHead eyebrow={t.dates.calcTitle} n={3} title={t.ui.quote} />
          <QuoteCalc locale={locale} t={t} />
        </div>
      </section>

      <section className="section section--tint screen" id="demande" data-screen={c.formEyebrow}>
        <div className="wrap">
          <SectionHead eyebrow={c.formEyebrow} n={4} title={c.formTitle} lead={c.formLead} />
          <div className="planner">
            <div className="panel" data-rv="">
              <ContactForm locale={locale} c={t.contact} f={t.form} b={t.book} subject={t.contact.subjects[1]} />
            </div>
            <div className="grid gap-4 content-start" data-rv="">
              <div className="flex flex-wrap gap-3">
                {SITE.whatsapp && (
                  <a className="btn btn--line" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener"><WhatsApp size={19} /> WhatsApp</a>
                )}
                {SITE.telegram && (
                  <a className="btn btn--line" href={`https://t.me/${SITE.telegram}`} target="_blank" rel="noopener"><Telegram size={18} /> Telegram</a>
                )}
              </div>
              <div className="facts">
                <div><b>{t.contact.emailT}</b><p><a className="link-arrow" href={`mailto:${SITE.email}`}><Mail /> {SITE.email}</a></p></div>
                <div><b>{t.contact.phoneT}</b><p><a className="link-arrow" href={`tel:${SITE.phoneHref}`}><Phone /> {SITE.phone}</a></p></div>
                <div><b>{t.contact.langT}</b><p>{t.contact.langD}</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbLd([{ name: t.ui.home, path: href(locale, 'home') }, { name: t.nav.custom, path: href(locale, 'custom') }])} />
    </>
  );
}
