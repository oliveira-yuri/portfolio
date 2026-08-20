import Link from 'next/link'
import { descricaoPilar } from '@/content/pilares'
import { ui } from '@/content/ui'
import { classesDoPilar } from '@/lib/escala'
import { type Locale, t } from '@/lib/i18n'
import { type Pilar, type Post, pilares } from '@/lib/posts'
import { caminhoPilar } from '@/lib/routes'

export function LegendaDaEscala({ locale, posts }: { locale: Locale; posts: Post[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="font-dado text-[0.65rem] uppercase tracking-[0.16em] text-suave">
        {t(ui.newsletter.escalaRotulo, locale)}
      </span>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {pilares.map((pilar: Pilar) => {
          const contagem = posts.filter((post) => post.pilar === pilar).length
          const { nome } = descricaoPilar[pilar]

          return (
            <li key={pilar}>
              <Link href={caminhoPilar(locale, pilar)} className="flex items-center gap-1.5 text-sm text-suave">
                <span aria-hidden="true" className={`inline-block h-2 w-2 ${classesDoPilar(pilar).fundo}`} />
                {t(nome, locale)} <span className="font-dado tabular-nums">{String(contagem).padStart(2, '0')}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
