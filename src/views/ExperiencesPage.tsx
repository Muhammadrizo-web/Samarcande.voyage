import Link from 'next/link';
import type { ImageName } from '@/content/images.generated';
import { href, type CityKey } from '@/lib/i18n';
import { breadcrumbLd } from '@/lib/seo';
import { Breadcrumb, CtaBand, Eyebrow, SectionHead } from '@/components/Blocks';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { ArrowUpRight } from '@/components/Icons';
import type { Dictionary } from '@/i18n/fr';
import type { ViewProps } from './types';

/** Photo réelle et étape associées à chaque expérience (même ordre que t.exp.items). */
const EXP: { img: ImageName; city: CityKey }[] = [
  { img: 'city-tachkent', city: 'tas' },
  { img: 'carnet-2', city: 'sam' },
  { img: 'city-samarcande', city: 'sam' },
  { img: 'gk1', city: 'buk' },
  { img: 'g9', city: 'yan' },
  { img: 'city-yourte', city: 'yan' },
  { img: 'g2', city: 'buk' },
  { img: 'gk2', city: 'khi' },
];

const altFor = (t: Dictionary, img: ImageName) =>
  (t.gallery as Record<string, string>)[img] ?? '';

export function ExperiencesPage({ locale, t }: ViewProps) {
  const e = t.exp;
  return (
    <>
      <section className="section section--first screen" data-screen={e.eyebrow}>
        <div className="wrap">
          <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: t.nav.exp }]} />
          <div className="city-hero">
            <div className="grid gap-6">
              <Eyebrow>{e.eyebrow}</Eyebrow>
              <h1 className="h1">{e.title}</h1>
              <p className="lead">{e.lead}</p>
            </div>
            <figure className="frame city-hero__img" data-rv="clip">
              <Picture name="city-yourte" alt={t.cities.yan} priority sizes="(min-width: 960px) 40vw, 92vw" />
            </figure>
          </div>
        </div>
      </section>

      <section className="section section--tint screen" data-screen={e.listEyebrow}>
        <div className="wrap">
          <SectionHead eyebrow={e.listEyebrow} n={1} title={e.listTitle} />
          <div className="exp">
            {e.items.map((it, i) => {
              const m = EXP[i];
              if (!m) return null;
              return (
                <Link key={i} href={href(locale, { page: 'city', city: m.city })} className="exp__item" data-rv="">
                  <div className="frame exp__img">
                    <Picture name={m.img} alt={altFor(t, m.img)} sizes="(min-width: 1100px) 24vw, (min-width: 640px) 46vw, 92vw" />
                  </div>
                  <span className="exp__where">{String(i + 1).padStart(2, '0')} · {t.cities[m.city]}</span>
                  <h3 className="h3">{it.t}</h3>
                  <p className="muted">{it.d}</p>
                  <span className="exp__go">{t.route.more} <ArrowUpRight /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand locale={locale} t={t} title={e.closeTitle} text={e.closeText} btn={t.home.band.btn} to="custom" />
      <JsonLd data={breadcrumbLd([{ name: t.ui.home, path: href(locale, 'home') }, { name: t.nav.exp, path: href(locale, 'experiences') }])} />
    </>
  );
}
