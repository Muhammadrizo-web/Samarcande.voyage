import 'server-only';
import type { Locale } from '@/lib/i18n';
import { BOOKING } from '@/content/tour';
import fr, { type Dictionary } from './fr';
import en from './en';
import ru from './ru';
import de from './de';

const DICTS: Record<Locale, Dictionary> = { fr, en, ru, de };

export function getDict(locale: Locale): Dictionary {
  return DICTS[locale];
}

/** FAQ avec la réponse « couples » choisie selon la règle de réservation. */
export function faqFor(t: Dictionary) {
  const couples = BOOKING.minPaxPerBooking <= 2 ? t.faqCouples.yes : t.faqCouples.no;
  return t.faq.map((f) => (f.q === '__COUPLES__' ? couples : f));
}

export type { Dictionary };
