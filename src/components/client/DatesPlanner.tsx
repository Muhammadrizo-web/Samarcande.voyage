'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BOOKING, PRICING } from '@/content/tour';
import type { Dictionary } from '@/i18n/fr';
import { upcoming, type LiveDeparture } from '@/lib/departures';
import { fmtDay, fmtLong, fmtMonth, fmtShort, money, plural, tpl } from '@/lib/format';
import type { Locale } from '@/lib/i18n';
import { DEFAULT_SELECTION, clampSelection, quote, selectionFromQuery, selectionToQuery, type Selection } from '@/lib/pricing';
import { Arrow, Check, Info, LinkIc, Minus, Plus } from '../Icons';
import { CountUp } from './CountUp';
import { useNow } from './useNow';
import { Waitlist } from './Waitlist';

type Props = {
  locale: Locale;
  buildNow: number;
  d: Dictionary['dates'];
  w: Dictionary['waitlist'];
  f: Dictionary['form'];
  ui: Dictionary['ui'];
  bookHref: string;
  contactHref: string;
};

export function DatesPlanner({ locale, buildNow, d, w, f, ui, bookHref, contactHref }: Props) {
  const now = useNow(buildNow);
  const live = useMemo(() => upcoming(now), [now]);
  const open = useMemo(() => live.filter((x) => x.status !== 'full'), [live]);
  const first = open[0]?.code ?? '';

  const [sel, setSel] = useState<Selection>({ dep: first, ...DEFAULT_SELECTION });
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const s = selectionFromQuery(new URLSearchParams(window.location.search), first);
    if (!open.some((x) => x.code === s.dep)) s.dep = first;
    setSel(s);
    setReady(true);
  }, [open, first]);

  useEffect(() => {
    if (!ready || !sel.dep) return;
    window.history.replaceState(null, '', `${window.location.pathname}?${selectionToQuery(sel)}`);
  }, [sel, ready]);

  const update = (patch: Partial<Selection>) => setSel((s) => clampSelection({ ...s, ...patch }));

  if (!open.length) {
    return (
      <div className="panel" id="waitlist" style={{ maxWidth: 820 }}>
        <p className="muted" style={{ marginBottom: 18 }}>{d.empty}</p>
        <span className="eyebrow">{w.eyebrow}</span>
        <h2 className="h3" style={{ marginTop: 14 }}>{w.title}</h2>
        <p className="muted" style={{ margin: '10px 0 22px' }}>{w.lead}</p>
        <Waitlist locale={locale} w={w} f={f} />
      </div>
    );
  }

  const dep = open.find((x) => x.code === sel.dep) ?? open[0]!;
  const q = quote(dep, sel, dep.daysLeft);
  const fmt = (n: number) => money(n, locale);
  const bookUrl = `${bookHref}?${selectionToQuery({ ...q.s, dep: dep.code })}`;
  const minSingle = q.s.pax === 1 ? 1 : 0;

  const months = new Map<string, LiveDeparture[]>();
  for (const x of live) {
    const k = x.out.slice(0, 7);
    months.set(k, [...(months.get(k) ?? []), x]);
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* presse-papiers refusé */ }
  };

  return (
    <div className="planner">
      <div role="radiogroup" aria-label={d.title}>
        {[...months.entries()].map(([k, deps]) => (
          <div key={k}>
            <div className="dep-month">{fmtMonth(deps[0]!.out, locale)}</div>
            {deps.map((x) => {
              const on = x.code === dep.code;
              const full = x.status === 'full';
              const label = x.deal ? d.status.deal : d.status[x.status];
              const pillCls = `pill pill--${x.deal && x.status === 'open' ? 'deal' : x.status}`;
              return (
                <button key={x.code} type="button" role="radio" aria-checked={on} aria-disabled={full}
                  className={`dep${on ? ' is-on' : ''}`} onClick={() => !full && update({ dep: x.code })}>
                  <span className="dep__radio" aria-hidden />
                  <span className="dep__main">
                    <span className="dep__date">{fmtLong(x.out, locale)}</span>
                    <span className="dep__sub num">{d.back} {fmtShort(x.back, locale)} · {x.code}</span>
                    <span className="dep__pill-m"><span className={pillCls}>{label}</span></span>
                  </span>
                  <span className="dep__pill"><span className={pillCls}>{label}</span></span>
                  <span className="dep__price">
                    <b className="num">{fmt(x.price)}</b>
                    <span>{d.perPerson}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="callout callout--glaze" style={{ marginTop: 22 }}>
          <Info />
          <span>{d.privateNote} <Link href={contactHref} className="link-arrow" style={{ padding: 0 }}>{d.privateCta}</Link></span>
        </div>
        {open.length < 4 && (
          <div className="panel" id="waitlist" style={{ marginTop: 22 }}>
            <span className="eyebrow">{w.eyebrow}</span>
            <h2 className="h3" style={{ marginTop: 12 }}>{w.title}</h2>
            <p className="muted" style={{ margin: '8px 0 20px' }}>{w.lead}</p>
            <Waitlist locale={locale} w={w} f={f} />
          </div>
        )}
      </div>

      <aside className="calc" id="calc" aria-label={d.calcTitle}>
        <div>
          <h2 className="h3">{d.calcTitle}</h2>
          <p className="calc__for">{d.calcFor} <b>{fmtLong(dep.out, locale)}</b></p>
        </div>
        {q.lastMinute && (
          <div className="callout" style={{ marginTop: 0 }}><Info /><span>{d.lastminuteNote}</span></div>
        )}
        <hr className="rule" />

        <div className="row">
          <span className="row__lab">
            <b>{d.pax}</b>
            <span>{BOOKING.minPaxPerBooking <= 1 ? d.paxNoteMin1 : d.paxNoteMin3}</span>
          </span>
          <span className="stepper">
            <button type="button" aria-label={`${d.pax} −1`} disabled={q.s.pax <= BOOKING.minPaxPerBooking} onClick={() => update({ pax: q.s.pax - 1 })}><Minus /></button>
            <output aria-live="polite">{q.s.pax}</output>
            <button type="button" aria-label={`${d.pax} +1`} disabled={q.s.pax >= BOOKING.maxPaxPerBooking} onClick={() => update({ pax: q.s.pax + 1 })}><Plus /></button>
          </span>
        </div>

        <div className="row">
          <span className="row__lab">
            <b>{d.singles}</b>
            <span>{tpl(d.singlesNote, { price: fmt(dep.single) })}</span>
          </span>
          <span className="stepper">
            <button type="button" aria-label={`${d.singles} −1`} disabled={q.s.single <= minSingle} onClick={() => update({ single: q.s.single - 1 })}><Minus /></button>
            <output aria-live="polite">{q.s.single}</output>
            <button type="button" aria-label={`${d.singles} +1`} disabled={q.s.single >= q.s.pax} onClick={() => update({ single: q.s.single + 1 })}><Plus /></button>
          </span>
        </div>

        <hr className="rule" />
        <b className="eyebrow" style={{ color: 'var(--muted)' }}>{d.options}</b>

        <label className="opt">
          <input type="checkbox" checked={q.s.train} onChange={(e) => update({ train: e.target.checked })} />
          <span className="box"><Check size={13} /></span>
          <span className="opt__m"><b>{d.optTrain}</b><span>{d.optTrainNote}</span></span>
          <span className="opt__p">+{fmt(PRICING.train)}</span>
        </label>
        <label className="opt">
          <input type="checkbox" checked={q.s.transfer} onChange={(e) => update({ transfer: e.target.checked })} />
          <span className="box"><Check size={13} /></span>
          <span className="opt__m"><b>{d.optTransfer}</b><span>{d.optTransferNote}</span></span>
          <span className="opt__p">+{fmt(q.transferUnit)}</span>
        </label>
        <div className="row">
          <span className="row__lab"><b>{d.optNights}</b><span>{d.optNightsNote}</span></span>
          <span className="seg" role="group" aria-label={d.optNights}>
            {[0, 1, 2, 3].map((n) => (
              <button key={n} type="button" aria-pressed={q.s.nights === n} onClick={() => update({ nights: n })}>{n}</button>
            ))}
          </span>
        </div>

        <div className="bill">
          <div className="bill__row"><span>{d.lineTour} — {q.s.pax} × {fmt(dep.price)}</span><b>{fmt(q.base)}</b></div>
          {q.s.single > 0 && <div className="bill__row"><span>{d.lineSingle} × {q.s.single}</span><b>{fmt(q.singleSum)}</b></div>}
          {q.s.train && <div className="bill__row"><span>{d.lineTrain}</span><b>{fmt(q.trainSum)}</b></div>}
          {q.s.nights > 0 && <div className="bill__row"><span>{d.lineNights} × {q.s.nights}</span><b>{fmt(q.nightsSum)}</b></div>}
          {q.s.transfer && <div className="bill__row"><span>{d.lineTransfer}</span><b>{fmt(q.transferSum)}</b></div>}
          <div className="bill__total">
            <span>{d.total} <span className="muted small">{tpl(d.totalFor, { n: q.s.pax, people: plural(q.s.pax, locale, ui.personForms) })}</span></span>
            <CountUp value={q.total} locale={locale} kind="money" className="num" duration={450} />
          </div>
          <div className="bill__pp">{tpl(d.perPers, { price: fmt(q.perPerson) })}</div>
        </div>

        <div className="deposit">
          <div className="deposit__row">
            <span>{q.lastMinute ? d.depositFull : d.deposit}</span>
            <b className="num">{fmt(q.deposit)}</b>
          </div>
          {!q.lastMinute && (
            <div className="deposit__bal">
              <span>{tpl(d.balance, { date: fmtDay(q.balanceDate, locale) })}</span>
              <span className="num">{fmt(q.balance)}</span>
            </div>
          )}
        </div>

        <Link href={bookUrl} className="btn btn--primary btn--block">{d.bookThis} <Arrow /></Link>
        <button type="button" className="link-arrow" style={{ justifySelf: 'center' }} onClick={share}>
          <LinkIc /> {copied ? d.copied : d.share}
        </button>
      </aside>

      <div className="mbar no-print" aria-hidden="true">
        <span><small>{d.total}</small><b className="num">{fmt(q.total)}</b></span>
        <Link href={bookUrl} className="btn btn--primary btn--sm" tabIndex={-1}>{ui.book} <Arrow /></Link>
      </div>
    </div>
  );
}
