import { DEPARTURES, PRICING, type Departure } from '@/content/tour';
import { parseISO } from './format';

export type DepStatus = 'open' | 'few' | 'full' | 'lastminute';

const DAY = 86_400_000;

export function daysUntil(iso: string, now: number): number {
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  return Math.round((parseISO(iso).getTime() - today.getTime()) / DAY);
}

/** null = départ masqué (passé ou trop proche). */
export function statusOf(d: Departure, now: number): DepStatus | null {
  const left = daysUntil(d.out, now);
  if (left < PRICING.hideBeforeDays) return null;
  if (d.seats === 'full') return 'full';
  if (left < PRICING.balanceDays) return 'lastminute';
  return d.seats;
}

export type LiveDeparture = Departure & { status: DepStatus; daysLeft: number };

export function upcoming(now: number): LiveDeparture[] {
  return DEPARTURES.flatMap((d) => {
    const status = statusOf(d, now);
    return status ? [{ ...d, status, daysLeft: daysUntil(d.out, now) }] : [];
  }).sort((a, b) => a.out.localeCompare(b.out));
}

export function bookable(now: number): LiveDeparture[] {
  return upcoming(now).filter((d) => d.status !== 'full');
}

export function findDeparture(code: string | null | undefined): Departure | undefined {
  return code ? DEPARTURES.find((d) => d.code === code) : undefined;
}

export function lowestPrice(): number {
  return Math.min(...DEPARTURES.map((d) => d.price));
}

export function seasonYears(now: number): number[] {
  return [...new Set(upcoming(now).map((d) => Number(d.out.slice(0, 4))))];
}
