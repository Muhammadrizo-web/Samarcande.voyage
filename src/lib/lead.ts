import { FORMS, SITE } from '@/content/site';
import type { Locale } from './i18n';

export type LeadType = 'booking' | 'contact' | 'waitlist';
export type LeadResult = 'ok' | 'demo' | 'error';

export type LeadPayload = {
  type: LeadType;
  locale: Locale;
  /** Champ piège : doit rester vide (les robots le remplissent). */
  website?: string;
  /** Résumé lisible, identique à ce que reçoivent Telegram et l'e-mail. */
  summary: string;
  email: string;
  name: string;
  data: Record<string, unknown>;
  page: string;
};

export async function sendLead(p: LeadPayload): Promise<LeadResult> {
  if (FORMS.demo) {
    await new Promise((r) => setTimeout(r, 700));
    return 'demo';
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(FORMS.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
      signal: ctrl.signal,
    });
    if (!res.ok) return 'error';
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
    return json.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  } finally {
    clearTimeout(timer);
  }
}

/** Liens de secours : la demande part quand même, par e-mail ou WhatsApp. */
export function fallbackLinks(subject: string, summary: string) {
  const mail = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
  const wa = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`${subject}\n\n${summary}`)}` : null;
  return { mail, wa };
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function loadDraft<T>(key: string): Partial<T> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}
export function saveDraft(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* stockage indisponible */ }
}
export function clearDraft(key: string) {
  try { localStorage.removeItem(key); } catch { /* */ }
}
