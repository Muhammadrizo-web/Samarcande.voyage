import { LOCALE_META, type Locale } from './i18n';

const nbsp = / | /g;

export function money(n: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(LOCALE_META[locale].intl, {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(n).replace(nbsp, ' ');
  } catch {
    return `${n} €`;
  }
}

/** « 2026-10-01 » → Date locale à midi (évite les décalages de fuseau). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12);
}

export function fmtDate(iso: string | Date, locale: Locale, opts: Intl.DateTimeFormatOptions): string {
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  try {
    return new Intl.DateTimeFormat(LOCALE_META[locale].intl, opts).format(d);
  } catch {
    return d.toDateString();
  }
}

export const fmtLong = (iso: string, l: Locale) => fmtDate(iso, l, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const fmtShort = (iso: string, l: Locale) => fmtDate(iso, l, { weekday: 'short', day: 'numeric', month: 'long' });
export const fmtDay = (iso: string | Date, l: Locale) => fmtDate(iso, l, { day: 'numeric', month: 'long', year: 'numeric' });
export const fmtMonth = (iso: string, l: Locale) => {
  const s = fmtDate(iso, l, { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Remplace {cle} dans une chaîne. */
export function tpl(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Pluriel simple, russe inclus (1 ночь, 2 ночи, 5 ночей). */
export function plural(n: number, locale: Locale, forms: readonly string[]): string {
  const [one = '', few = one, many = few] = forms;
  if (locale === 'ru') {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  if (locale === 'fr') return n <= 1 ? one : few;
  return n === 1 ? one : few;
}
