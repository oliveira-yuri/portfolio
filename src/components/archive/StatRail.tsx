import { ui } from '@/content/ui'
import { formatarData, formatarMesAno } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'

export function StatRail({ locale, posts }: { locale: Locale; posts: Post[] }) {
  if (posts.length === 0) return null

  const maisRecente = posts[0]
  const maisAntigo = posts[posts.length - 1]

  return (
    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
      <div>
        <dt className="sr-only">{t(ui.newsletter.textos, locale)}</dt>
        <dd className="text-accent">
          {posts.length} {t(ui.newsletter.textos, locale)}
        </dd>
      </div>
      <div>
        <dt className="sr-only">{t(ui.newsletter.desde, locale)}</dt>
        <dd>
          {t(ui.newsletter.desde, locale)} <span className="text-accent">{formatarMesAno(maisAntigo.data)}</span>
        </dd>
      </div>
      <div>
        <dt className="sr-only">{t(ui.newsletter.ultimo, locale)}</dt>
        {/* Data absoluta de propósito: o site é estático e "há N dias" congelaria no build. */}
        <dd>
          {t(ui.newsletter.ultimo, locale)}{' '}
          <span className="text-accent">{formatarData(maisRecente.data, locale)}</span>
        </dd>
      </div>
    </dl>
  )
}
