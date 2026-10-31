import Link from 'next/link';
import { SITE } from '@/content/site';
import type { Dictionary } from '@/i18n/fr';
import { href, type Locale, type PageKey } from '@/lib/i18n';
import { Brand } from './Header';
import { asset } from '@/lib/asset';

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const nav: [PageKey, string][] = [
    ['tour', t.nav.tour], ['destinations', t.nav.dest], ['custom', t.nav.custom], ['dates', t.nav.group],
    ['experiences', t.nav.exp], ['agency', t.nav.agency], ['infos', t.nav.infos], ['contact', t.nav.contact],
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
      <div className="ftr__scene" aria-hidden>
        <picture>
          <source type="image/avif" srcSet={`${asset('/brand/scene-1200.avif')} 1200w, ${asset('/brand/scene-2000.avif')} 2000w`} sizes="(min-width: 1000px) 980px, 100vw" />
          <img src={asset('/brand/scene-1200.webp')} srcSet={`${asset('/brand/scene-1200.webp')} 1200w, ${asset('/brand/scene-2000.webp')} 2000w`} sizes="(min-width: 1000px) 980px, 100vw" alt="" width={2400} height={977} loading="lazy" decoding="async" />
        </picture>
      </div>
    </footer>
  );
}
