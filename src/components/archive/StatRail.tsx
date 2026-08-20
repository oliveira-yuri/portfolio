import { ui } from '@/content/ui'
import { formatarData } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'

export function StatRail({ locale, posts }: { locale: Locale; posts: Post[] }) {
  if (posts.length === 0) return null

  const maisRecente = posts[0]

  return (
    <dl className="mt-4 font-dado text-xs text-suave">
      <div>
        <dt className="sr-only">{t(ui.newsletter.ultimo, locale)}</dt>
        {/* Data absoluta de propósito: o site é estático e "há N dias" congelaria no build. */}
        <dd>
          {t(ui.newsletter.ultimo, locale)}{' '}
          <span className="text-frio">{formatarData(maisRecente.data, locale)}</span>
        </dd>
      </div>
    </dl>
  )
}
