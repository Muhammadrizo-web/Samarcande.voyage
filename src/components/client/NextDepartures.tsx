'use client';

import Link from 'next/link';
import type { Dictionary } from '@/i18n/fr';
import { bookable } from '@/lib/departures';
import { fmtMonth, fmtShort, money } from '@/lib/format';
import { href, type Locale } from '@/lib/i18n';
import { selectionToQuery, DEFAULT_SELECTION } from '@/lib/pricing';
import { Arrow } from '../Icons';
import { useNow } from './useNow';
import { Waitlist } from './Waitlist';

export function NextDepartures({ locale, buildNow, d, w, f }: {
  locale: Locale; buildNow: number; d: Dictionary['dates']; w: Dictionary['waitlist']; f: Dictionary['form'];
}) {
  const now = useNow(buildNow);
  const list = bookable(now).slice(0, 3);

  if (!list.length) {
    return (
      <div className="panel" style={{ maxWidth: 760 }}>
        <span className="eyebrow">{w.eyebrow}</span>
        <h3 className="h3" style={{ marginTop: 14 }}>{w.title}</h3>
        <p className="muted" style={{ margin: '10px 0 22px' }}>{w.lead}</p>
        <Waitlist locale={locale} w={w} f={f} />
      </div>
    );
  }

  return (
    <div className="dep-tiles">
      {list.map((dep) => (
        <Link key={dep.code} className="dep-tile"
          href={`${href(locale, 'dates')}?${selectionToQuery({ dep: dep.code, ...DEFAULT_SELECTION })}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="dep-tile__m">{fmtMonth(dep.out, locale)}</span>
            <span className={`pill pill--${dep.deal ? 'deal' : dep.status}`}>{dep.deal ? d.status.deal : d.status[dep.status]}</span>
          </div>
          <span className="dep-tile__d">{fmtShort(dep.out, locale)}</span>
          <span className="muted small">{d.back} {fmtShort(dep.back, locale)} · {dep.code}</span>
          <span className="dep-tile__p">
            <span><b className="num">{money(dep.price, locale)}</b> <span className="muted small">{d.perPerson}</span></span>
            <Arrow />
          </span>
        </Link>
      ))}
      {list.length < 3 && (
        <Link className="dep-tile dep-tile--next" href={`${href(locale, 'dates')}#waitlist`}>
          <span className="dep-tile__m">{w.eyebrow}</span>
          <span className="dep-tile__d">{w.title}</span>
          <span className="muted small">{w.lead}</span>
          <span className="dep-tile__p"><span className="small" style={{ fontWeight: 700 }}>{w.submit}</span><Arrow /></span>
        </Link>
      )}
    </div>
  );
}
