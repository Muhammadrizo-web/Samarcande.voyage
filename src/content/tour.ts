/**
 * Le circuit : tarifs, départs, étapes, hôtels.
 * Source : tarif agence GIR-OUZB 2026, 12 jours / 10 nuits, IN TAS / OUT UGC.
 *
 * Ajouter la saison 2027 : copier une ligne de DEPARTURES, changer code/dates/prix.
 * Les départs passés disparaissent seuls du site ; à moins de 30 jours ils passent
 * en « dernière minute » (paiement intégral), à moins de 3 jours ils sont masqués.
 */

import type { CityKey } from '@/lib/i18n';
import type { ImageName } from '@/content/images.generated';

export const PRICING = {
  currency: 'EUR',
  base: 1110,
  single: 230,
  train: 40,
  extraNight: 50,
  extraNightSingle: 30,
  transferSmall: 30, // par personne, 1 à 2 voyageurs
  transferLarge: 15, // par personne, 3 à 10 voyageurs
  deposit: 0.3,
  balanceDays: 30,
  /** Masquer un départ quand il reste moins de N jours */
  hideBeforeDays: 3,
  groupMin: 3,
  groupMax: 26,
} as const;

export const BOOKING = {
  /**
   * TODO(agence) : nombre minimum de voyageurs PAR DEMANDE.
   * 1 = un voyageur seul ou un couple peut rejoindre le groupe (le départ reste
   *     garanti dès 3 participants au total) ;
   * 3 = il faut être au moins trois dans la même demande.
   * Le texte de la FAQ s'adapte automatiquement.
   */
  minPaxPerBooking: 1,
  maxPaxPerBooking: 12,
} as const;

export type Seats = 'open' | 'few' | 'full';
export type Departure = {
  code: string;
  /** ISO AAAA-MM-JJ */
  out: string;
  back: string;
  price: number;
  single: number;
  seats: Seats;
  deal?: boolean;
};

export const DEPARTURES: Departure[] = [
  { code: 'GIR-02', out: '2026-04-02', back: '2026-04-13', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-03', out: '2026-04-09', back: '2026-04-20', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-04', out: '2026-04-23', back: '2026-05-04', price: 1110, single: 230, seats: 'few' },
  { code: 'GIR-05', out: '2026-04-30', back: '2026-05-11', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-06', out: '2026-05-07', back: '2026-05-18', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-07', out: '2026-05-14', back: '2026-05-25', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-08', out: '2026-06-04', back: '2026-06-15', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-09', out: '2026-08-06', back: '2026-08-17', price: 1080, single: 220, seats: 'open', deal: true },
  { code: 'GIR-10', out: '2026-08-27', back: '2026-09-07', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-11', out: '2026-09-03', back: '2026-09-14', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-12', out: '2026-09-17', back: '2026-09-28', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-13', out: '2026-09-24', back: '2026-10-05', price: 1110, single: 230, seats: 'few' },
  { code: 'GIR-14', out: '2026-10-01', back: '2026-10-12', price: 1110, single: 230, seats: 'open' },
  { code: 'GIR-15', out: '2026-10-15', back: '2026-10-26', price: 1110, single: 230, seats: 'open' },
  // TODO(agence) : saison 2027 — ajouter les lignes ici dès réception de la brochure.
];

export type StopKey = CityKey | 'urg';
export const ROUTE: { key: StopKey; nights: number; days: number[] }[] = [
  { key: 'tas', nights: 2, days: [1, 2] },
  { key: 'sam', nights: 3, days: [3, 4, 5] },
  { key: 'shk', nights: 0, days: [5] },
  { key: 'yan', nights: 1, days: [6] },
  { key: 'buk', nights: 3, days: [7, 8, 9] },
  { key: 'khi', nights: 1, days: [10, 11] },
  { key: 'urg', nights: 0, days: [12] },
];

export const HOTELS: { key: StopKey; nights: number; names: string }[] = [
  { key: 'tas', nights: 2, names: 'Wyndham Garden 3★ · Krokus Plaza 3★' },
  { key: 'sam', nights: 3, names: 'Ideal 3★ · Malika 3★ · Zilol Bakht 3★' },
  { key: 'yan', nights: 1, names: 'Yourtes · 5–6 pers.' },
  { key: 'buk', nights: 3, names: 'Iman 3★ · Mihrob 3★ · Komil 3★' },
  { key: 'khi', nights: 1, names: 'Darvaza 3★ · Malika Kheivak 3★ · Anor Qala 3★' },
];

/** Distances routières du programme (km), pour la carte et les chiffres clés. */
export const DISTANCES = { total: 1600, road: [0, 0, 300, 0, 340, 230, 280, 0, 0, 460, 0, 0] } as const;

/** Photo associée à chaque jour (clé 0 = jour 1). */
export const DAY_PHOTOS: Partial<Record<number, ImageName>> = {
  0: 'city-tachkent', 1: 'city-tachkent', 2: 'day-03', 3: 'city-samarcande', 4: 'day-05', 5: 'day-06', 6: 'carnet-3',
  7: 'day-08', 8: 'day-09', 9: 'day-10', 10: 'day-11', 11: 'g5',
};

/**
 * Recadrage (object-position) pour un jour donné : les jours 1 et 2 partagent la
 * photo de Tachkent, deux cadrages différents évitent l'effet « doublon ».
 * TODO agence : une photo propre pour le jour 1 (aéroport, accueil du groupe).
 */
export const DAY_PHOTO_POS: Partial<Record<number, string>> = { 0: '50% 22%' };

/** Températures maximales moyennes à Samarcande / Boukhara (°C), indicatives. */
export const CLIMATE = {
  high: [6, 9, 15, 22, 27, 33, 35, 34, 29, 22, 14, 8],
  low: [-3, -1, 4, 9, 13, 17, 19, 17, 12, 6, 2, -1],
  best: [3, 4, 8, 9], // index de mois (0 = janvier) : avril, mai, septembre, octobre
  ok: [2, 5, 10],
} as const;
