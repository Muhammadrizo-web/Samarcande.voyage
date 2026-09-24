'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Dictionary } from '@/i18n/fr';
import { bookable } from '@/lib/departures';
import { fmtDay, fmtLong, money, tpl } from '@/lib/format';
import type { Locale } from '@/lib/i18n';
import { clearDraft, isEmail, loadDraft, saveDraft, sendLead } from '@/lib/lead';
import { selectionFromQuery, quote, type Selection } from '@/lib/pricing';
import { Arrow, Check, Info } from '../Icons';
import { DemoNote, FormError, SubmitLabel, type Status } from './FormStatus';
import { useNow } from './useNow';

type Draft = { travellers: { first: string; last: string }[]; email: string; phone: string; country: string; msg: string };
const DRAFT_KEY = 'sv-booking-draft';

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`field${error ? ' is-bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="field__err" id={`${id}-err`}>{error}</span>}
    </div>
  );
}

type Props = {
  locale: Locale;
  buildNow: number;
  b: Dictionary['book'];
  d: Dictionary['dates'];
  f: Dictionary['form'];
  datesHref: string;
  termsHref: string;
  privacyHref: string;
  termsLabel: string;
  privacyLabel: string;
};

export function BookingForm({ locale, buildNow, b, d, f, datesHref, termsHref, privacyHref, termsLabel, privacyLabel }: Props) {
  const now = useNow(buildNow);
  const open = useMemo(() => bookable(now), [now]);
  const [sel, setSel] = useState<Selection | null>(null);
  const [draft, setDraft] = useState<Draft>({ travellers: [], email: '', phone: '', country: '', msg: '' });
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setSel(selectionFromQuery(new URLSearchParams(window.location.search), open[0]?.code ?? ''));
    const saved = loadDraft<Draft>(DRAFT_KEY);
    if (saved) setDraft((x) => ({ ...x, ...saved, travellers: saved.travellers ?? x.travellers }));
  }, [open]);

  const dep = sel ? open.find((x) => x.code === sel.dep) : undefined;
  const q = dep && sel ? quote(dep, sel, dep.daysLeft) : null;
  const pax = q?.s.pax ?? 0;

  const travellers = Array.from({ length: pax }, (_, i) => draft.travellers[i] ?? { first: '', last: '' });
  const set = (patch: Partial<Draft>) => setDraft((x) => { const n = { ...x, ...patch }; saveDraft(DRAFT_KEY, n); return n; });
  const setTrav = (i: number, k: 'first' | 'last', v: string) => {
    const list = travellers.map((t, j) => (j === i ? { ...t, [k]: v } : t));
    set({ travellers: list });
  };

  if (!sel) return <div className="panel" aria-busy="true" style={{ minHeight: 320 }} />;

  if (!dep || !q) {
    return (
      <div className="panel" style={{ maxWidth: 720 }}>
        <p className="lead">{b.noDeparture}</p>
        <Link href={datesHref} className="btn btn--primary" style={{ marginTop: 20 }}>{d.title} <Arrow /></Link>
      </div>
    );
  }

  const fmt = (n: number) => money(n, locale);
  const summaryLines = [
    `${b.chosen}: ${dep.code} — ${fmtLong(dep.out, locale)}`,
    `${d.pax}: ${q.s.pax} · ${d.singles}: ${q.s.single} · ${d.optTrain}: ${q.s.train ? '✓' : '—'} · ${d.optTransfer}: ${q.s.transfer ? '✓' : '—'} · ${d.optNights}: ${q.s.nights}`,
    `${d.total}: ${fmt(q.total)} · ${q.lastMinute ? d.depositFull : d.deposit}: ${fmt(q.deposit)}`,
    '',
    ...travellers.map((t, i) => `${b.traveller} ${i + 1}: ${t.first} ${t.last.toUpperCase()}`),
    `${b.email}: ${draft.email}`,
    `${b.phone}: ${draft.phone}`,
    `${b.country}: ${draft.country}`,
    draft.msg ? `\n${draft.msg}` : '',
  ];
  const summary = summaryLines.join('\n');

  const validate = () => {
    const e: Record<string, string> = {};
    travellers.forEach((t, i) => {
      if (!t.first.trim()) e[`fn${i}`] = f.required;
      if (!t.last.trim()) e[`ln${i}`] = f.required;
    });
    if (!isEmail(draft.email)) e.email = draft.email ? f.invalidEmail : f.required;
    if (draft.phone.replace(/\D/g, '').length < 6) e.phone = f.required;
    if (!consent) e.consent = f.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      document.querySelector<HTMLElement>('.is-bad input, .is-bad .box')?.closest('.field, .check')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setStatus('sending');
    const r = await sendLead({
      type: 'booking', locale, website: hp, summary, email: draft.email,
      name: `${travellers[0]?.first ?? ''} ${travellers[0]?.last ?? ''}`.trim(),
      data: { departure: dep.code, out: dep.out, selection: q.s, total: q.total, deposit: q.deposit, travellers, phone: draft.phone, country: draft.country, message: draft.msg },
      page: window.location.pathname,
    });
    setStatus(r);
    if (r !== 'error') { clearDraft(DRAFT_KEY); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  if (status === 'ok' || status === 'demo') {
    return (
      <div className="success">
        <div className="success__ic"><Check size={34} /></div>
        <h2 className="h2">{b.okTitle}</h2>
        <p className="lead" style={{ textAlign: 'center' }}>{b.okText}</p>
        {status === 'demo' && <DemoNote f={f} />}
        <button type="button" className="btn btn--line" onClick={() => setStatus('idle')}>{b.okAgain}</button>
      </div>
    );
  }

  const err = (k: string) => errors[k];

  return (
    <>
      <ol className="steps" aria-label={b.title}>
        <li className="step is-done"><i><Check size={14} /></i>{b.steps[0]}</li>
        <li className="step-bar" aria-hidden />
        <li className="step is-on" aria-current="step"><i>2</i>{b.steps[1]}</li>
        <li className="step-bar" aria-hidden />
        <li className="step"><i>3</i>{b.steps[2]}</li>
      </ol>

      <div className="planner">
        <form className="form" onSubmit={submit} noValidate>
          <div className="callout callout--glaze" style={{ marginTop: 0 }}><Info /><span>{b.nameNote}</span></div>

          {travellers.map((t, i) => (
            <fieldset key={i} className="fieldset">
              <legend className="sr-only">{b.traveller} {i + 1}</legend>
              <div className="fieldset__h" aria-hidden>{b.traveller} {i + 1}</div>
              <div className="form-grid">
                <Field id={`fn${i}`} label={`${b.first} *`} error={err(`fn${i}`)}>
                  <input id={`fn${i}`} autoComplete={i === 0 ? 'given-name' : 'off'} value={t.first}
                    aria-invalid={!!err(`fn${i}`)} onChange={(e) => setTrav(i, 'first', e.target.value)} />
                </Field>
                <Field id={`ln${i}`} label={`${b.last} *`} error={err(`ln${i}`)}>
                  <input id={`ln${i}`} autoComplete={i === 0 ? 'family-name' : 'off'} value={t.last}
                    aria-invalid={!!err(`ln${i}`)} onChange={(e) => setTrav(i, 'last', e.target.value)} />
                </Field>
              </div>
            </fieldset>
          ))}

          <fieldset className="fieldset">
            <legend className="sr-only">{b.contactTitle}</legend>
            <div className="fieldset__h" aria-hidden>{b.contactTitle}</div>
            <div className="form-grid">
              <Field id="bk-email" label={`${b.email} *`} error={err('email')}>
                <input id="bk-email" type="email" inputMode="email" autoComplete="email" value={draft.email}
                  aria-invalid={!!err('email')} onChange={(e) => set({ email: e.target.value })} />
              </Field>
              <Field id="bk-phone" label={`${b.phone} *`} error={err('phone')}>
                <input id="bk-phone" type="tel" inputMode="tel" autoComplete="tel" value={draft.phone}
                  aria-invalid={!!err('phone')} onChange={(e) => set({ phone: e.target.value })} />
              </Field>
              <div className="full">
                <Field id="bk-country" label={b.country}>
                  <input id="bk-country" autoComplete="country-name" value={draft.country} onChange={(e) => set({ country: e.target.value })} />
                </Field>
              </div>
              <div className="full">
                <Field id="bk-msg" label={b.msg}>
                  <textarea id="bk-msg" placeholder={b.msgPh} value={draft.msg} onChange={(e) => set({ msg: e.target.value })} />
                </Field>
              </div>
            </div>
          </fieldset>

          <div className="hp" aria-hidden="true">
            <label>Website <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
          </div>

          <label className={`check${err('consent') ? ' is-bad' : ''}`}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className="box"><Check size={13} /></span>
            <span>
              {b.consent}{' '}
              <span className="muted">(<Link href={termsHref} target="_blank">{termsLabel}</Link> · <Link href={privacyHref} target="_blank">{privacyLabel}</Link>)</span>
            </span>
          </label>

          {Object.keys(errors).length > 0 && <p className="field__err" role="alert">{f.fixErrors}</p>}
          {status === 'error' && <FormError f={f} subject={`${b.title} — ${dep.code}`} summary={summary} />}

          <button type="submit" className="btn btn--primary btn--block" disabled={status === 'sending'}>
            <SubmitLabel status={status} f={f} label={b.submit} /> {status !== 'sending' && <Arrow />}
          </button>
          <p className="muted small">{b.payNote}</p>
        </form>

        <aside className="calc" aria-label={b.summary}>
          <h2 className="h3">{b.summary}</h2>
          <p className="calc__for">{b.chosen} · <b>{fmtLong(dep.out, locale)}</b></p>
          <Link href={`${datesHref}${window.location.search}`} className="link-arrow" style={{ justifySelf: 'start' }}>{b.change} <Arrow /></Link>
          <div className="bill">
            <div className="bill__row"><span>{d.pax}</span><b>{q.s.pax}</b></div>
            <div className="bill__row"><span>{d.lineTour}</span><b>{fmt(q.base)}</b></div>
            {q.s.single > 0 && <div className="bill__row"><span>{d.lineSingle} × {q.s.single}</span><b>{fmt(q.singleSum)}</b></div>}
            {q.s.train && <div className="bill__row"><span>{d.lineTrain}</span><b>{fmt(q.trainSum)}</b></div>}
            {q.s.nights > 0 && <div className="bill__row"><span>{d.lineNights} × {q.s.nights}</span><b>{fmt(q.nightsSum)}</b></div>}
            {q.s.transfer && <div className="bill__row"><span>{d.lineTransfer}</span><b>{fmt(q.transferSum)}</b></div>}
            <div className="bill__total"><span>{d.total}</span><b className="num">{fmt(q.total)}</b></div>
            <div className="bill__pp">{tpl(d.perPers, { price: fmt(q.perPerson) })}</div>
          </div>
          <div className="deposit">
            <div className="deposit__row"><span>{q.lastMinute ? d.depositFull : d.deposit}</span><b className="num">{fmt(q.deposit)}</b></div>
            {!q.lastMinute && (
              <div className="deposit__bal"><span>{tpl(d.balance, { date: fmtDay(q.balanceDate, locale) })}</span><span className="num">{fmt(q.balance)}</span></div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
