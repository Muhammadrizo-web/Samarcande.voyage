import { BOOKING, PRICING, type Departure } from '@/content/tour';
import { parseISO } from './format';

export type Selection = {
  dep: string;
  pax: number;
  single: number;
  train: boolean;
  transfer: boolean;
  nights: number;
};

export const DEFAULT_SELECTION: Omit<Selection, 'dep'> = {
  pax: Math.max(2, BOOKING.minPaxPerBooking),
  single: 0,
  train: true,
  transfer: false,
  nights: 0,
};

export function clampSelection(s: Selection): Selection {
  const pax = Math.max(BOOKING.minPaxPerBooking, Math.min(BOOKING.maxPaxPerBooking, Math.round(s.pax) || 1));
  const minSingle = pax === 1 ? 1 : 0; // un voyageur seul a sa chambre
  const single = Math.max(minSingle, Math.min(pax, Math.round(s.single) || 0));
  const nights = Math.max(0, Math.min(3, Math.round(s.nights) || 0));
  return { ...s, pax, single, nights };
}

export type Quote = ReturnType<typeof quote>;

export function quote(dep: Departure, raw: Selection, daysLeft: number) {
  const s = clampSelection(raw);
  const transferUnit = s.pax <= 2 ? PRICING.transferSmall : PRICING.transferLarge;
  const base = dep.price * s.pax;
  const singleSum = s.single * dep.single;
  const trainSum = s.train ? PRICING.train * s.pax : 0;
  const nightsSum = s.nights * (PRICING.extraNight * s.pax + PRICING.extraNightSingle * s.single);
  const transferSum = s.transfer ? transferUnit * s.pax : 0;
  const total = base + singleSum + trainSum + nightsSum + transferSum;
  const lastMinute = daysLeft < PRICING.balanceDays;
  const deposit = lastMinute ? total : Math.round(total * PRICING.deposit);
  const balanceDate = parseISO(dep.out);
  balanceDate.setDate(balanceDate.getDate() - PRICING.balanceDays);
  return {
    s, transferUnit, base, singleSum, trainSum, nightsSum, transferSum, total,
    deposit, balance: total - deposit, perPerson: Math.round(total / s.pax),
    lastMinute, balanceDate,
  };
}

/* ---------- état ⇄ URL : ?dep=GIR-14&pax=2&single=0&train=1&transfer=0&nights=0 */

export function selectionToQuery(s: Selection): string {
  const p = new URLSearchParams({
    dep: s.dep, pax: String(s.pax), single: String(s.single),
    train: s.train ? '1' : '0', transfer: s.transfer ? '1' : '0', nights: String(s.nights),
  });
  return p.toString();
}

export function selectionFromQuery(q: URLSearchParams, fallbackDep: string): Selection {
  const num = (k: string, d: number) => {
    const v = Number(q.get(k));
    return Number.isFinite(v) && q.has(k) ? v : d;
  };
  return clampSelection({
    dep: q.get('dep') || fallbackDep,
    pax: num('pax', DEFAULT_SELECTION.pax),
    single: num('single', DEFAULT_SELECTION.single),
    train: q.has('train') ? q.get('train') === '1' : DEFAULT_SELECTION.train,
    transfer: q.get('transfer') === '1',
    nights: num('nights', 0),
  });
}
