import Link from 'next/link';
import { ROUTE } from '@/content/tour';
import { CITY_KEYS, href, type CityKey } from '@/lib/i18n';
import { plural } from '@/lib/format';
import { abs, breadcrumbLd } from '@/lib/seo';
import { Breadcrumb, CtaBand, Eyebrow } from '@/components/Blocks';
import { CITY_PHOTO, CityStrip, PatternFill } from '@/components/Sections';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { Arrow, Bed, Calendar, Shield } from '@/components/Icons';
import type { ViewProps } from './types';

export function CityPage({ locale, t, city }: ViewProps & { city: CityKey }) {
  const c = t.cityPages[city];
  const r = ROUTE.find((x) => x.key === city);
  const nights = r?.nights ?? 0;
  const days = r?.days ?? [];
  const photo = CITY_PHOTO[city];
  const idx = CITY_KEYS.indexOf(city);
  const others = [...CITY_KEYS.slice(idx + 1), ...CITY_KEYS.slice(0, idx)];
  const dayRange = days.length > 1 ? `${days[0]}–${days[days.length - 1]}` : `${days[0] ?? ''}`;

  return (
    <>
      <section className="section section--first screen" data-screen={t.cities[city]}>
        <div className="wrap">
          <Breadcrumb items={[
            { name: t.ui.home, href: href(locale, 'home') },
            { name: t.nav.dest, href: href(locale, 'destinations') },
            { name: t.cities[city] },
          ]} />
          <div className="city-hero">
            <div className="grid gap-6">
              <Eyebrow>{t.dest.eyebrow}</Eyebrow>
              <h1 className="h1">{c.title}</h1>
              <p className="lead">{c.intro[0]}</p>
              <div className="city-facts">
                <span><Calendar />{t.dest.days} {dayRange}</span>
                <span><Bed />{nights > 0 ? `${nights} ${plural(nights, locale, t.ui.nightForms)}` : t.route.pass}</span>
                {c.unesco && <span><Shield size={16} />{t.dest.unesco}</span>}
              </div>
            </div>
            <div className="frame city-hero__img" data-rv="clip">
              {photo
                ? <Picture name={photo} alt={t.cities[city]} priority sizes="(min-width: 960px) 40vw, 92vw" />
                : <PatternFill label={t.cities[city]} />}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint screen" data-screen={t.dest.highlights}>
        <div className="wrap">
          <div className="city-detail">
            <div className="grid gap-6 content-start" data-rv="">
              <Eyebrow n={1}>{t.dest.onTour}</Eyebrow>
              <h2 className="h2">{t.cities[city]}</h2>
              <p className="lead">{c.intro[1]}</p>
              <div>
                <Link href={`${href(locale, 'tour')}#day-${days[0] ?? 1}`} className="btn btn--line">{t.ui.program} <Arrow /></Link>
              </div>
            </div>
            <div data-rv="">
              <Eyebrow n={2}>{t.dest.highlights}</Eyebrow>
              <ol className="hl-list" style={{ marginTop: 18 }}>
                {c.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section screen" data-screen={t.dest.otherCities}>
        <div className="wrap">
          <div className="sec-head" data-rv="">
            <Eyebrow n={3}>{t.dest.otherCities}</Eyebrow>
            <h2 className="h2">{t.dest.otherCities}</h2>
          </div>
          <CityStrip locale={locale} t={t} keys={others} />
        </div>
      </section>

      <CtaBand locale={locale} t={t} />
      <JsonLd data={[
        {
          '@context': 'https://schema.org',
          '@type': 'TouristDestination',
          name: t.cities[city],
          description: c.intro.join(' '),
          url: abs(href(locale, { page: 'city', city })),
          touristType: 'Cultural tourism',
          includesAttraction: c.highlights.map((h) => ({ '@type': 'TouristAttraction', name: h })),
          containedInPlace: { '@type': 'Country', name: 'Uzbekistan' },
        },
        breadcrumbLd([
          { name: t.ui.home, path: href(locale, 'home') },
          { name: t.nav.dest, path: href(locale, 'destinations') },
          { name: t.cities[city], path: href(locale, { page: 'city', city }) },
        ]),
      ]} />
    </>
  );
}
