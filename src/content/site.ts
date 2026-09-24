/**
 * Coordonnées et réglages de l'agence — LE fichier à compléter avant la mise en ligne.
 * Tout ce qui est marqué TODO est vérifié par `npm run check:launch`
 * (le build de production refuse de partir tant qu'il en reste).
 */

export const SITE = {
  name: 'Samarcande Voyage',
  /** TODO: domaine définitif (sans barre finale) */
  url: 'https://www.samarcande-voyage.com',
  /** TODO: adresse réelle */
  email: 'contact@samarcande-voyage.com',
  /** TODO: numéro réel — format international affiché + format lien */
  phone: '+998 00 000 00 00',
  phoneHref: '+998000000000',
  /** TODO: numéro WhatsApp sans « + » ni espaces (vide = bouton masqué) */
  whatsapp: '998000000000',
  /** TODO: identifiant Telegram sans @ (vide = bouton masqué) */
  telegram: '',
  address: {
    /** TODO: rue et numéro */
    street: '',
    city: 'Samarcande',
    region: 'Samarqand',
    postalCode: '',
    country: 'UZ',
  },
  geo: { lat: 39.6542, lng: 66.9597 },
  /** TODO: numéro de licence de tour-opérateur, null tant qu'il n'est pas délivré */
  licence: null as string | null,
  /** TODO: raison sociale et identifiant fiscal (INN) pour les mentions légales */
  legalName: '',
  taxId: '',
  founded: '',
  /** Profils publics (vides = non affichés) */
  social: { instagram: '', facebook: '', tripadvisor: '', google: '' },
  hours: 'Mo-Sa 09:00-18:00',
} as const;

export const FORMS = {
  endpoint: process.env.NEXT_PUBLIC_LEAD_ENDPOINT || '/api/lead',
  /** Aperçus uniquement : les formulaires simulent l'envoi et le disent. */
  demo: process.env.NEXT_PUBLIC_DEMO_FORMS === '1',
} as const;

/**
 * Поведение секций на компьютере :
 *  'page'    — одно движение колеса / тачпада = ровно одна секция (плавная прокрутка) ;
 *  'curtain' — обычная прокрутка, следующая секция наезжает поверх предыдущей ;
 *  'scroll'  — обычная прокрутка без эффектов.
 * На телефонах и планшетах всегда обычная прокрутка.
 */
export const UI = {
  sectionMode: 'page' as 'page' | 'curtain' | 'scroll',
} as const;
