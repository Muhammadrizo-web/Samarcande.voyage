import { SITE } from '@/content/site';
import { href } from '@/lib/i18n';
import { tpl } from '@/lib/format';
import { Breadcrumb, SectionHead } from '@/components/Blocks';
import { Info } from '@/components/Icons';
import type { ViewProps } from './types';

export function LegalPage({ locale, t, kind }: ViewProps & { kind: 'terms' | 'legal' | 'privacy' }) {
  const sections = t.legalPages[kind];
  const title = t.meta.pages[kind].title;
  const vars = { email: SITE.email, phone: SITE.phone };
  return (
    <section className="section section--first">
      <div className="wrap wrap--narrow">
        <Breadcrumb items={[{ name: t.ui.home, href: href(locale, 'home') }, { name: title }]} />
        <SectionHead as="h1" eyebrow={t.footer.legal} title={title} />
        <div className="callout" style={{ marginTop: 0, marginBottom: 40 }}><Info /><span>{t.legalPages.draft}</span></div>
        <div className="prose">
          {sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p, i) => <p key={i}>{tpl(p, vars)}</p>)}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
