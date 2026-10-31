'use client';

import { useState } from 'react';
import type { Dictionary } from '@/i18n/fr';
import type { Locale } from '@/lib/i18n';
import { isEmail, sendLead } from '@/lib/lead';
import { fmtDate } from '@/lib/format';
import { Arrow, Check } from '../Icons';
import { DemoNote, FormError, SubmitLabel, type Status } from './FormStatus';

const MONTHS = [3, 4, 5, 7, 8, 9];

export function Waitlist({ locale, w, f }: { locale: Locale; w: Dictionary['waitlist']; f: Dictionary['form'] }) {
  const monthName = (m: number) => {
    const s = fmtDate(new Date(2027, m, 1, 12), locale, { month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [month, setMonth] = useState('');
  const [hp, setHp] = useState('');
  const [bad, setBad] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const summary = `${w.title}\n${w.name}: ${name}\n${w.email}: ${email}\n${w.month}: ${month || w.anyMonth}\n(${locale})`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) { setBad(true); return; }
    setBad(false);
    setStatus('sending');
    const r = await sendLead({ type: 'waitlist', locale, website: hp, summary, email, name, data: { month }, page: location.pathname });
    setStatus(r);
  };

  if (status === 'ok' || status === 'demo') {
    return (
      <div className="alert alert--ok" role="status">
        <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Check /> {w.ok}</span>
        {status === 'demo' && <DemoNote f={f} />}
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="wl-name">{w.name}</label>
          <input id="wl-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className={`field${bad ? ' is-bad' : ''}`}>
          <label htmlFor="wl-email">{w.email} *</label>
          <input id="wl-email" type="email" autoComplete="email" inputMode="email" required value={email}
            aria-invalid={bad} aria-describedby={bad ? 'wl-err' : undefined} onChange={(e) => setEmail(e.target.value)} />
          {bad && <span id="wl-err" className="field__err">{f.invalidEmail}</span>}
        </div>
        <div className="field full">
          <label htmlFor="wl-month">{w.month}</label>
          <select id="wl-month" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">{w.anyMonth}</option>
            {MONTHS.map((m) => <option key={m} value={monthName(m)}>{monthName(m)}</option>)}
          </select>
        </div>
      </div>
      <div className="hp" aria-hidden="true">
        <label>Website <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
      </div>
      {status === 'error' && <FormError f={f} subject={w.title} summary={summary} />}
      <div>
        <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
          <SubmitLabel status={status} f={f} label={w.submit} /> {status !== 'sending' && <Arrow />}
        </button>
      </div>
    </form>
  );
}
