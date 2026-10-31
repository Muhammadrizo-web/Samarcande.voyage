import type { Dictionary } from '@/i18n/fr';
import type { Locale } from '@/lib/i18n';

export type ViewProps = { locale: Locale; t: Dictionary; now: number };
