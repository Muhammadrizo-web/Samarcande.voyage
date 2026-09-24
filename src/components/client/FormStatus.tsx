'use client';

import type { Dictionary } from '@/i18n/fr';
import { fallbackLinks, type LeadResult } from '@/lib/lead';
import { Info, Mail, WhatsApp } from '../Icons';

export type Status = 'idle' | 'sending' | LeadResult;

export function FormError({ f, subject, summary }: { f: Dictionary['form']; subject: string; summary: string }) {
  const { mail, wa } = fallbackLinks(subject, summary);
  return (
    <div className="alert alert--err" role="alert">
      <b>{f.errorTitle}</b>
      <p>{f.errorText}</p>
      <div className="alert__acts">
        <a className="btn btn--line btn--sm" href={mail}><Mail /> {f.byEmail}</a>
        {wa && <a className="btn btn--line btn--sm" href={wa} target="_blank" rel="noopener"><WhatsApp size={17} /> {f.byWhatsapp}</a>}
      </div>
    </div>
  );
}

export function DemoNote({ f }: { f: Dictionary['form'] }) {
  return (
    <div className="alert alert--demo" role="status">
      <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Info /> {f.demo}</span>
    </div>
  );
}

export function SubmitLabel({ status, f, label }: { status: Status; f: Dictionary['form']; label: string }) {
  return status === 'sending' ? <><span className="spinner" aria-hidden /> {f.sending}</> : <>{label}</>;
}
