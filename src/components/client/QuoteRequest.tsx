'use client';

import { useState } from 'react';
import { BOOKING, PRICING } from '@/content/tour';
import type { Dictionary } from '@/i18n/fr';
import { money, plural, tpl } from '@/lib/format';
import type { Locale } from '@/lib/i18n';
import { Arrow, Check, Info, Minus, Plus } from '../Icons';
import { CountUp } from './CountUp';

/** Événement envoyé au formulaire de demande : le détail du calcul à recopier dans le message. */
export const PREFILL_EVENT = 'sv:prefill';

/**
 * Calculateur « Votre prix » (tarif du circuit de base, sans date), écran à part.
 * « Demander le calcul » recopie le détail dans le message du formulaire (#demande) et y descend.
 */
export function QuoteCalc({ locale, t }: { locale: Locale; t: Dictionary }) {
  const d = t.dates;
  const c = t.custom;
  const [pax, setPax] = useState(Math.max(2, BOOKING.minPaxPerBooking));
  const [single, setSingle] = useState(0);
  const [train, setTrain] = useState(true);
  const [transfer, setTransfer] = useState(false);
  const [nights, setNights] = useState(0);

  const minSingle = pax === 1 ? 1 : 0;
  const s = Math.max(minSingle, Math.min(pax, single));
  const transferUnit = pax <= 2 ? PRICING.transferSmall : PRICING.transferLarge;
  const base = PRICING.base * pax;
  const singleSum = s * PRICING.single;
  const trainSum = train ? PRICING.train * pax : 0;
  const nightsSum = nights * (PRICING.extraNight * pax + PRICING.extraNightSingle * s);
  const transferSum = transfer ? transferUnit * pax : 0;
  const total = base + singleSum + trainSum + nightsSum + transferSum;
  const fmt = (n: number) => money(n, locale);
  const people = plural(pax, locale, t.ui.personForms);

  const setPaxSafe = (n: number) => {
    const p = Math.max(BOOKING.minPaxPerBooking, Math.min(BOOKING.maxPaxPerBooking, n));
    setPax(p);
    setSingle((x) => Math.max(p === 1 ? 1 : 0, Math.min(p, x)));
  };

  const request = () => {
    const lines = [
      `${d.calcTitle} (${c.calcBase}):`,
      `• ${d.lineTour} — ${pax} × ${fmt(PRICING.base)} = ${fmt(base)}`,
      s > 0 ? `• ${d.lineSingle} × ${s} = ${fmt(singleSum)}` : '',
      train ? `• ${d.lineTrain} = ${fmt(trainSum)}` : '',
      nights > 0 ? `• ${d.lineNights} × ${nights} = ${fmt(nightsSum)}` : '',
      transfer ? `• ${d.lineTransfer} = ${fmt(transferSum)}` : '',
      `${d.total} ${tpl(d.totalFor, { n: pax, people })}: ${fmt(total)}`,
    ].filter(Boolean).concat('', c.calcDates);
    window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: lines.join('\n') }));
    document.getElementById('demande')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => (document.getElementById('ct-msg') as HTMLTextAreaElement | null)?.focus({ preventScroll: true }), 900);
  };

  return (
      <section className="calc quote-calc" aria-label={d.calcTitle} data-rv="">
        <div className="quote-calc__head">
          <h3 className="h4">{c.calcBase}</h3>
          <p className="quote-calc__note"><Info size={15} /> {c.calcNote}</p>
        </div>

        <div className="quote-calc__grid">
          <div className="quote-calc__col">
            <div className="row">
              <span className="row__lab">
                <b>{d.pax}</b>
                <span>{BOOKING.minPaxPerBooking <= 1 ? d.paxNoteMin1 : d.paxNoteMin3}</span>
              </span>
              <span className="stepper">
                <button type="button" aria-label={`${d.pax} −1`} disabled={pax <= BOOKING.minPaxPerBooking} onClick={() => setPaxSafe(pax - 1)}><Minus /></button>
                <output aria-live="polite">{pax}</output>
                <button type="button" aria-label={`${d.pax} +1`} disabled={pax >= BOOKING.maxPaxPerBooking} onClick={() => setPaxSafe(pax + 1)}><Plus /></button>
              </span>
            </div>
            <div className="row">
              <span className="row__lab">
                <b>{d.singles}</b>
                <span>{tpl(d.singlesNote, { price: fmt(PRICING.single) })}</span>
              </span>
              <span className="stepper">
                <button type="button" aria-label={`${d.singles} −1`} disabled={s <= minSingle} onClick={() => setSingle(s - 1)}><Minus /></button>
                <output aria-live="polite">{s}</output>
                <button type="button" aria-label={`${d.singles} +1`} disabled={s >= pax} onClick={() => setSingle(s + 1)}><Plus /></button>
              </span>
            </div>
            <div className="row">
              <span className="row__lab"><b>{d.optNights}</b><span>{d.optNightsNote}</span></span>
              <span className="seg" role="group" aria-label={d.optNights}>
                {[0, 1, 2, 3].map((n) => (
                  <button key={n} type="button" aria-pressed={nights === n} onClick={() => setNights(n)}>{n}</button>
                ))}
              </span>
            </div>
          </div>

          <div className="quote-calc__col">
            <b className="eyebrow" style={{ color: 'var(--muted)' }}>{d.options}</b>
            <label className="opt">
              <input type="checkbox" checked={train} onChange={(e) => setTrain(e.target.checked)} />
              <span className="box"><Check size={13} /></span>
              <span className="opt__m"><b>{d.optTrain}</b><span>{d.optTrainNote}</span></span>
              <span className="opt__p">+{fmt(PRICING.train)}</span>
            </label>
            <label className="opt">
              <input type="checkbox" checked={transfer} onChange={(e) => setTransfer(e.target.checked)} />
              <span className="box"><Check size={13} /></span>
              <span className="opt__m"><b>{d.optTransfer}</b><span>{d.optTransferNote}</span></span>
              <span className="opt__p">+{fmt(transferUnit)}</span>
            </label>
          </div>

          <div className="quote-calc__col quote-calc__sum">
            <div className="bill">
              <div className="bill__row"><span>{d.lineTour} — {pax} × {fmt(PRICING.base)}</span><b>{fmt(base)}</b></div>
              {s > 0 && <div className="bill__row"><span>{d.lineSingle} × {s}</span><b>{fmt(singleSum)}</b></div>}
              {train && <div className="bill__row"><span>{d.lineTrain}</span><b>{fmt(trainSum)}</b></div>}
              {nights > 0 && <div className="bill__row"><span>{d.lineNights} × {nights}</span><b>{fmt(nightsSum)}</b></div>}
              {transfer && <div className="bill__row"><span>{d.lineTransfer}</span><b>{fmt(transferSum)}</b></div>}
              <div className="bill__total">
                <span>{d.total} <span className="muted small">{tpl(d.totalFor, { n: pax, people })}</span></span>
                <CountUp value={total} locale={locale} kind="money" className="num" duration={450} />
              </div>
              <div className="bill__pp">{tpl(d.perPers, { price: fmt(Math.round(total / pax)) })}</div>
            </div>
            <button type="button" className="btn btn--primary btn--block" onClick={request}>{t.ui.quote} <Arrow /></button>
          </div>
        </div>
      </section>

  );
}
