import { ui } from '@/content/ui'
import { profile } from '@/content/profile'
import { type Locale, t } from '@/lib/i18n'

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="flex flex-wrap justify-between gap-4 border-t border-fio py-8 font-dado text-xs text-suave">
      <span>{profile.name}</span>
      <span>
        {t(ui.footer.vinculo, locale)}{' '}
        <a href="https://ibe.ia.br/" className="text-frio">
          ibe.IA
        </a>
      </span>
      <a href={`/${locale}/index.xml`}>RSS</a>
    </footer>
  )
}
