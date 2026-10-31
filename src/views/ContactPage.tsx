import { SITE } from '@/content/site';
import { href } from '@/lib/i18n';
import { breadcrumbLd } from '@/lib/seo';
import { Breadcrumb, SectionHead } from '@/components/Blocks';
import { ContactForm } from '@/components/client/ContactForm';
import { JsonLd } from '@/components/JsonLd';
import { Mail, Phone, Telegram, WhatsApp } from '@/components/Icons';
import type { ViewProps } from './types';

export function ContactPage({ locale, t }: ViewProps) {
  return (
    <section className="section section--first">
      <div className="wrap">
        <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: t.nav.contact }]} />
        <SectionHead as="h1" eyebrow={t.contact.eyebrow} title={t.contact.title} lead={t.contact.lead} />
        <div className="planner">
          <div className="panel" data-rv="">
            <ContactForm locale={locale} c={t.contact} f={t.form} b={t.book} />
          </div>
          <aside className="grid gap-4 content-start" data-rv="">
            <div className="flex flex-wrap gap-3">
              {SITE.whatsapp && (
                <a className="btn btn--line" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener"><WhatsApp size={19} /> WhatsApp</a>
              )}
              {SITE.telegram && (
                <a className="btn btn--line" href={`https://t.me/${SITE.telegram}`} target="_blank" rel="noopener"><Telegram size={18} /> Telegram</a>
              )}
            </div>
            <div className="facts">
              <div><b>{t.contact.emailT}</b><p><a className="link-arrow" href={`mailto:${SITE.email}`}><Mail /> {SITE.email}</a></p></div>
              <div><b>{t.contact.phoneT}</b><p><a className="link-arrow" href={`tel:${SITE.phoneHref}`}><Phone /> {SITE.phone}</a></p></div>
              <div><b>{t.contact.officeT}</b><p>{t.contact.officeD}</p></div>
              <div><b>{t.contact.hoursT}</b><p>{t.contact.hoursD}</p></div>
              <div><b>{t.contact.langT}</b><p>{t.contact.langD}</p></div>
            </div>
          </aside>
        </div>
      </div>
      <JsonLd data={breadcrumbLd([{ name: t.ui.home, path: href(locale, 'home') }, { name: t.nav.contact, path: href(locale, 'contact') }])} />
    </section>
  );
}
