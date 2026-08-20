import Link from 'next/link'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { SkipLink } from '@/components/ui/SkipLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function TopBar({ locale }: { locale: Locale }) {
  return (
    <header className="flex items-center justify-between gap-2 py-6">
      <SkipLink locale={locale} />
      <nav className="flex gap-4 font-dado text-xs text-suave">
        <Link href={`/${locale}`}>{t(ui.nav.newsletter, locale)}</Link>
        <Link href={`/${locale}/portfolio`}>{t(ui.nav.portfolio, locale)}</Link>
      </nav>
      <div className="flex items-center gap-2">
        <LocaleSwitch locale={locale} />
        <ThemeToggle locale={locale} />
      </div>
    </header>
  )
}
