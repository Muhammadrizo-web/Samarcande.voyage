import Link from 'next/link';
import type React from 'react';
import { CLIMATE, DAY_PHOTOS, DAY_PHOTO_POS, DISTANCES, HOTELS, PRICING, ROUTE } from '@/content/tour';
import { IMAGES, type ImageName } from '@/content/images.generated';
import type { Dictionary } from '@/i18n/fr';
import { fmtDay, money, plural } from '@/lib/format';
import { LOCALE_META, href, type CityKey, type Locale } from '@/lib/i18n';
import { Picture } from './Picture';
import { MAIN_PATH, MapLayers, SPUR_PATH, explorerStops } from './RouteMap';
import { SectionHead } from './Blocks';
import { CountUp } from './client/CountUp';
import { RouteExplorer } from './client/RouteExplorer';
import { DayExplorer } from './client/DayExplorer';
import { HScroll } from './client/HScroll';
import { FaqList } from './client/FaqList';
import { Arrow, ArrowUpRight, Check, Clock, Cross, Info, Plate, Users } from './Icons';

export const CITY_PHOTO: Partial<Record<CityKey, ImageName>> = {
  tas: 'city-tachkent', sam: 'city-samarcande', shk: 'city-chakhrisabz', yan: 'city-yourte', buk: 'city-boukhara', khi: 'city-khiva',
};

/* ---------------------------------------------------------------- héros */

export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  const ring = `${t.cities.sam} · ${t.cities.buk} · ${t.cities.khi} · ${t.cities.tas} · `.toUpperCase();
  return (
    <section className="hero screen" data-screen={t.nav.home}>
      <div className="wrap hero__grid">
        <div className="hero__text">
          <span className="eyebrow fade-up">{t.hero.eyebrow}</span>
          <h1 className="display hero__title">
            {t.hero.title.map((l, i) => <span key={i} className="ln"><span>{l}</span></span>)}
          </h1>
          <p className="lead fade-up d1">{t.hero.lead}</p>
          <div className="hero__cta fade-up d2">
            <Link href={href(locale, 'dates')} className="btn btn--primary">{t.ui.seeDates} <Arrow /></Link>
            <Link href={href(locale, 'tour')} className="btn btn--line">{t.ui.program}</Link>
          </div>
          <ul className="hero__facts fade-up d3">
            <li><Clock />{t.hero.facts[0]}</li>
            <li><Users />{t.hero.facts[1]}</li>
            <li><Plate />{t.hero.facts[2]}</li>
          </ul>
        </div>
        <div className="hero__media">
          <div className="frame hero__img">
            <Picture name="hero" alt={t.hero.credit} priority sizes="(min-width: 960px) 46vw, 92vw" position="72% 50%" />
            <span className="hero__credit">{t.hero.credit}</span>
          </div>
          <div className="frame hero__small">
            <Picture name="gk2" alt={t.gallery.gk2} sizes="(min-width: 960px) 18vw, 36vw" />
          </div>
          <div className="hero__badge">
            <svg className="badge-ring" viewBox="0 0 100 100" aria-hidden>
              <defs><path id="ring-path" d="M50 50m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0" /></defs>
              <text fontSize="7.2" fontWeight="700" letterSpacing="1.6" fill="currentColor">
                <textPath href="#ring-path">{ring}</textPath>
              </text>
            </svg>
            <span>
              <small>{t.ui.from}</small>
              <b className="num">{money(PRICING.base, locale)}</b>
              <small>{t.ui.perPerson}</small>
            </span>
          </div>
        </div>
      </div>
      <Marquee t={t} />
    </section>
  );
}

export function Marquee({ t }: { t: Dictionary }) {
  const items = (['tas', 'sam', 'shk', 'yan', 'buk', 'khi'] as const).map((k) => t.cities[k]);
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        {[...row, ...row].map((c, i) => <span key={i} className="marquee__item">{c}<i className="star" /></span>)}
      </div>
    </div>
  );
}

export function Pillars({ t }: { t: Dictionary }) {
  return (
    <div className="pillars">
      {t.trust.items.map((it, i) => (
        <div key={i} className="pillar" data-rv="">
          <span className="pillar__n">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="h4">{it.t}</h3>
          <p>{it.d}</p>
        </div>
      ))}
    </div>
  );
}

/** Écran « Pourquoi nous » : piliers 2 × 2 + photo de terrain. */
export function TrustBlock({ t, n }: { t: Dictionary; n?: number }) {
  return (
    <div className="trust">
      <div>
        <SectionHead eyebrow={t.trust.eyebrow} n={n} title={t.trust.title} />
        <Pillars t={t} />
      </div>
      <figure className="frame trust__img" data-rv="clip">
        <Picture name="terrain" alt={t.agency.photoCaption} sizes="(min-width: 1100px) 34vw, 92vw" />
        <figcaption>{t.agency.photoCaption}</figcaption>
      </figure>
    </div>
  );
}

/* ------------------------------------------------------------ itinéraire */

export function RouteBlock({ locale, t, n, action }: { locale: Locale; t: Dictionary; n?: number; action?: React.ReactNode }) {
  const photos = Object.fromEntries(
    (Object.entries(CITY_PHOTO) as [CityKey, ImageName][]).map(([k, img]) => [k, <Picture key={k} name={img} alt="" sizes="240px" />]),
  );
  const intl = LOCALE_META[locale].intl;
  const stats = [
    { v: '12', l: t.route.stats.days },
    { v: '10', l: t.route.stats.nights },
    { v: DISTANCES.total.toLocaleString(intl), l: t.route.stats.km },
    { v: '4', l: t.route.stats.sites },
  ];
  return (
    <RouteExplorer
      head={<SectionHead eyebrow={t.route.eyebrow} n={n} title={t.route.title} aside={action} />}
      lead={t.route.lead}
      stops={explorerStops(locale, t)}
      layers={<MapLayers />}
      mainPath={MAIN_PATH}
      spurPath={SPUR_PATH}
      photos={photos}
      stats={stats}
      labels={{
        mapLabel: t.route.mapLabel, hint: t.route.hint, reset: t.route.reset,
        overview: t.route.overview, more: t.route.more, daysLabel: t.dest.days,
      }}
    />
  );
}

export function Moments({ locale, t }: { locale: Locale; t: Dictionary }) {
  const photos: ImageName[] = ['day-03', 'city-yourte', 'city-khiva'];
  return (
    <div className="moments">
      {t.prog.teaser.map((m, i) => (
        <Link key={m.day} href={`${href(locale, 'tour')}#day-${m.day}`} className="moment" data-rv="">
          <div className="frame moment__img">
            <Picture name={photos[i] ?? 'hero'} alt={m.t} sizes="(min-width: 800px) 30vw, 92vw" />
          </div>
          <span className="moment__day">{t.ui.day} {m.day}</span>
          <h3 className="h3">{m.t}</h3>
          <p>{m.d}</p>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- compris */

export function Included({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <div className="incl">
      <div className="panel" data-rv="">
        <div className="panel__t">
          <h3 className="h3">{t.incl.inTitle}</h3>
          <b className="incl__price"><CountUp value={PRICING.base} locale={locale} kind="money" className="num" /></b>
        </div>
        <ul>
          {t.incl.in.map((x, i) => <li key={i} className="li-check"><Check /><span>{x}</span></li>)}
        </ul>
      </div>
      <div className="panel" data-rv="">
        <div className="panel__t"><h3 className="h3">{t.incl.outTitle}</h3></div>
        <ul>
          {t.incl.out.map((x, i) => (
            <li key={i} className="li-x"><Cross /><span>{x.t}{x.p && <> — <b>{x.p}</b></>}</span></li>
          ))}
        </ul>
        <div className="callout"><Info /><span>{t.incl.flightNote}</span></div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- programme */

export function DayBlock({ t, n }: { t: Dictionary; n?: number }) {
  const photos = t.days.map((d, i) => {
    const p = DAY_PHOTOS[i];
    return p ? <Picture key={i} name={p} alt={d.t} sizes="(min-width: 1100px) 30vw, 92vw" position={DAY_PHOTO_POS[i]} /> : null;
  });
  return (
    <DayExplorer
      head={<SectionHead eyebrow={t.prog.eyebrow} n={n} title={t.prog.title} lead={t.prog.lead} />}
      days={t.days.map((d, i) => ({ ...d, km: DISTANCES.road[i] || undefined }))}
      photos={photos}
      labels={{ day: t.ui.day, night: t.prog.night, pick: t.ui.dayPick, print: t.ui.print, prev: t.ui.prev, next: t.ui.next }}
    />
  );
}

export function Hotels({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <div className="hotels">
      {HOTELS.map((h) => (
        <div key={h.key} className="hotel" data-rv="">
          <b>{h.nights} {plural(h.nights, locale, t.ui.nightForms)}</b>
          <h3>{t.cities[h.key]}</h3>
          <p>{h.names}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ villes */

/**
 * Bandeau de villes en accordéon : la carte survolée (ou sélectionnée au clavier)
 * s'élargit et révèle son texte. Sur téléphone : cartes qui défilent au doigt.
 */
export function CityStrip({ locale, t, keys, band }: { locale: Locale; t: Dictionary; keys: readonly CityKey[]; band?: boolean }) {
  const def = keys.find((k) => CITY_PHOTO[k]) ?? keys[0];
  return (
    <div className={`strip${band ? ' strip--band' : ''}`} data-rv="">
      {keys.map((k, i) => {
        const r = ROUTE.find((x) => x.key === k);
        const photo = CITY_PHOTO[k];
        const nights = r?.nights ?? 0;
        return (
          <Link key={k} href={href(locale, { page: 'city', city: k })} className={`strip__item${k === def ? ' is-default' : ''}`}>
            <span className="strip__bg">
              {photo ? <Picture name={photo} alt="" sizes="(min-width: 1100px) 40vw, 80vw" /> : <PatternFill />}
            </span>
            <span className="strip__v" aria-hidden><i>{String(i + 1).padStart(2, '0')}</i>{t.cities[k]}</span>
            <span className="strip__body">
              <span className="strip__meta">{nights > 0 ? `${nights} ${plural(nights, locale, t.ui.nightForms)}` : t.route.pass}</span>
              <span className="strip__name">{t.cities[k]}</span>
              <span className="strip__note">{t.cityNote[k]}</span>
              <span className="strip__go">{t.route.more} <ArrowUpRight /></span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Pour une étape sans photo : fond lapis et motif girih. */
export function PatternFill({ label }: { label?: string }) {
  return (
    <span className="pattern-fill" aria-hidden>
      {label && <span>{label}</span>}
    </span>
  );
}

/* ------------------------------------------------------------ carnet */

export function Carnet({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pics: ImageName[] = ['carnet-1', 'carnet-2', 'carnet-3', 'carnet-4'];
  const date = fmtDay('2023-04-17', locale);
  return (
    <div className="carnet">
      {pics.map((p, i) => (
        <figure key={p} className="polaroid" data-rv="">
          <div className="frame"><Picture name={p} alt={t.carnet.items[i] ?? ''} sizes="(min-width: 900px) 22vw, 46vw" /></div>
          <figcaption><span>{date}</span>{t.carnet.items[i]}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Gallery({ t }: { t: Dictionary }) {
  const keys = Object.keys(t.gallery) as (keyof Dictionary['gallery'])[];
  return (
    <HScroll prev={t.ui.prev} next={t.ui.next}>
      {keys.map((k) => {
        const meta = IMAGES[k as ImageName];
        return (
          <figure key={k} className="hs__item" style={{ ['--ar' as string]: `${meta.w} / ${meta.h}` }}>
            <div className="frame"><Picture name={k as ImageName} alt={t.gallery[k]} sizes="(min-width: 900px) 40vw, 80vw" /></div>
            <figcaption>{t.gallery[k]}</figcaption>
          </figure>
        );
      })}
    </HScroll>
  );
}

/* --------------------------------------------------------------- FAQ */

export function Faq({ items, cols }: { items: { q: string; a: string }[]; cols?: boolean }) {
  return <FaqList items={items} cols={cols} />;
}

/* ------------------------------------------------------------- climat */

export function Climate({ t }: { t: Dictionary }) {
  const max = 40, min = -8;
  const y = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div>
      <div className="climate" data-rv="fade" role="img" aria-label={t.infos.climateLead}>
        {CLIMATE.high.map((hi, i) => {
          const lo = CLIMATE.low[i] ?? 0;
          const cls = (CLIMATE.best as readonly number[]).includes(i) ? 'best' : (CLIMATE.ok as readonly number[]).includes(i) ? 'ok' : '';
          return (
            <div key={i} className={`climate__m ${cls}`} style={{ ['--i' as string]: i }}>
              <span className="climate__t">{hi}°</span>
              <div className="climate__bar">
                <div className="climate__fill" style={{ bottom: `${y(lo)}%`, top: `${100 - y(hi)}%` }} />
              </div>
              <span className="climate__l">{lo}°</span>
              <span className="climate__name">{t.infos.months[i]}</span>
            </div>
          );
        })}
      </div>
      <div className="legend" style={{ marginTop: 20 }}>
        <span><i style={{ background: 'var(--gold)' }} />{t.infos.climateBest}</span>
        <span><i style={{ background: 'color-mix(in srgb, var(--gold) 40%, var(--line-2))' }} />{t.infos.climateOk}</span>
        <span>{t.infos.climateNote}</span>
      </div>
    </div>
  );
}

export { SectionHead };
