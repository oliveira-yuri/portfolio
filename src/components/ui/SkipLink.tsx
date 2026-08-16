import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function SkipLink({ locale }: { locale: Locale }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-raised focus:px-4 focus:py-2 focus:text-ink"
    >
      {t(ui.skipToContent, locale)}
    </a>
  )
}
