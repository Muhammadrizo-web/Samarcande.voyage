import { href } from '@/lib/i18n';
import { SectionHead } from '@/components/Blocks';
import { BookingForm } from '@/components/client/BookingForm';
import type { ViewProps } from './types';

export function BookingPage({ locale, t, now }: ViewProps) {
  return (
    <section className="section section--first">
      <div className="wrap">
        <SectionHead as="h1" eyebrow={t.book.eyebrow} title={t.book.title} lead={t.book.lead} />
        <BookingForm
          locale={locale} buildNow={now} b={t.book} d={t.dates} f={t.form}
          datesHref={href(locale, 'dates')} termsHref={href(locale, 'terms')} privacyHref={href(locale, 'privacy')}
          termsLabel={t.meta.pages.terms.title} privacyLabel={t.meta.pages.privacy.title}
        />
      </div>
    </section>
  );
}
