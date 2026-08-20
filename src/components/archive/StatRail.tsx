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
        {/* dt visível (não sr-only): antes o rótulo ficava escondido aqui E
            repetido, por extenso, dentro de <dd> — um leitor de tela ouvia
            "último em" duas vezes seguidas. Residue de quando a régua tinha
            vários itens. Agora o rótulo mora só no <dt>, e "inline" nos dois
            mantém a leitura visual em uma linha só, como antes. */}
        <dt className="inline">{t(ui.newsletter.ultimo, locale)}</dt>{' '}
        {/* Data absoluta de propósito: o site é estático e "há N dias" congelaria no build. */}
        <dd className="inline text-frio">{formatarData(maisRecente.data, locale)}</dd>
      </div>
    </dl>
  )
}
