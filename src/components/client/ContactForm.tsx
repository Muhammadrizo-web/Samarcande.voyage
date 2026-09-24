'use client';

import { useState } from 'react';
import type { Dictionary } from '@/i18n/fr';
import type { Locale } from '@/lib/i18n';
import { isEmail, sendLead } from '@/lib/lead';
import { Arrow, Check } from '../Icons';
import { DemoNote, FormError, SubmitLabel, type Status } from './FormStatus';

export function ContactForm({ locale, c, f, b }: { locale: Locale; c: Dictionary['contact']; f: Dictionary['form']; b: Dictionary['book'] }) {
  const [v, setV] = useState({ name: '', email: '', subject: c.subjects[0] ?? '', message: '' });
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const set = (k: keyof typeof v, val: string) => setV((x) => ({ ...x, [k]: val }));
  const summary = `${c.subject}: ${v.subject}\n${f.name}: ${v.name}\n${b.email}: ${v.email}\n\n${v.message}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!v.name.trim()) er.name = f.required;
    if (!isEmail(v.email)) er.email = v.email ? f.invalidEmail : f.required;
    if (v.message.trim().length < 5) er.message = f.required;
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus('sending');
    setStatus(await sendLead({ type: 'contact', locale, website: hp, summary, email: v.email, name: v.name, data: v, page: location.pathname }));
  };

  if (status === 'ok' || status === 'demo') {
    return (
      <div className="alert alert--ok" role="status">
        <span style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 700 }}><Check /> {f.ok}</span>
        {status === 'demo' && <DemoNote f={f} />}
      </div>
    );
  }

  const cls = (k: string) => `field${errors[k] ? ' is-bad' : ''}`;
  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className={cls('name')}>
          <label htmlFor="ct-name">{f.name} *</label>
          <input id="ct-name" autoComplete="name" value={v.name} aria-invalid={!!errors.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <span className="field__err">{errors.name}</span>}
        </div>
        <div className={cls('email')}>
          <label htmlFor="ct-email">{b.email} *</label>
          <input id="ct-email" type="email" inputMode="email" autoComplete="email" value={v.email} aria-invalid={!!errors.email} onChange={(e) => set('email', e.target.value)} />
          {errors.email && <span className="field__err">{errors.email}</span>}
        </div>
        <div className="field full">
          <label htmlFor="ct-subject">{c.subject}</label>
          <select id="ct-subject" value={v.subject} onChange={(e) => set('subject', e.target.value)}>
            {c.subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className={`${cls('message')} full`}>
          <label htmlFor="ct-msg">{f.message} *</label>
          <textarea id="ct-msg" placeholder={c.msgPh} value={v.message} aria-invalid={!!errors.message} onChange={(e) => set('message', e.target.value)} />
          {errors.message && <span className="field__err">{errors.message}</span>}
        </div>
      </div>
      <div className="hp" aria-hidden="true">
        <label>Website <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
      </div>
      {status === 'error' && <FormError f={f} subject={`${c.title} — ${v.subject}`} summary={summary} />}
      <div>
        <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
          <SubmitLabel status={status} f={f} label={f.send} /> {status !== 'sending' && <Arrow />}
        </button>
      </div>
    </form>
  );
}
