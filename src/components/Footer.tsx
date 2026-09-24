import Link from 'next/link';
import { SITE } from '@/content/site';
import type { Dictionary } from '@/i18n/fr';
import { href, type Locale, type PageKey } from '@/lib/i18n';
import { Brand } from './Header';

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const nav: [PageKey, string][] = [
    ['tour', t.nav.tour], ['dates', t.nav.dates], ['destinations', t.nav.dest],
    ['agency', t.nav.agency], ['infos', t.nav.infos], ['contact', t.nav.contact],
  ];
  const legal: [PageKey, string][] = [
    ['terms', t.meta.pages.terms.title], ['legal', t.meta.pages.legal.title], ['privacy', t.meta.pages.privacy.title],
  ];
  const year = new Date().getFullYear();
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__grid">
          <div>
            <Brand locale={locale} />
            <p className="ftr__note">{t.footer.tag}</p>
            <p className="ftr__note">{t.footer.priceNote}</p>
          </div>
          <div>
            <h2 className="ftr__h">{t.footer.nav}</h2>
            <ul>{nav.map(([k, l]) => <li key={k}><Link href={href(locale, k)}>{l}</Link></li>)}</ul>
          </div>
          <div>
            <h2 className="ftr__h">{t.footer.legal}</h2>
            <ul>{legal.map(([k, l]) => <li key={k}><Link href={href(locale, k)}>{l}</Link></li>)}</ul>
          </div>
          <div>
            <h2 className="ftr__h">{t.footer.contact}</h2>
            <ul>
              <li>{t.contact.officeD}</li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              <li><a href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a></li>
              <li className="muted small">{t.contact.hoursD}</li>
            </ul>
          </div>
        </div>
        <div className="ftr__bottom">
          <span>© {year} {SITE.name}. {t.footer.rights}</span>
          <span>{SITE.licence ? `${t.agency.licenceLabel} ${SITE.licence}` : t.agency.facts[0]?.d}</span>
        </div>
      </div>
      <div className="ftr__word" aria-hidden>Samarcande <span>Voyage</span></div>
    </footer>
  );
}
