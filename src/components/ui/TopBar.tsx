import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { SkipLink } from '@/components/ui/SkipLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { Locale } from '@/lib/i18n'

export function TopBar({ locale }: { locale: Locale }) {
  return (
    <header className="flex items-center justify-end gap-2 py-6">
      <SkipLink locale={locale} />
      <LocaleSwitch locale={locale} />
      <ThemeToggle locale={locale} />
    </header>
  )
}
