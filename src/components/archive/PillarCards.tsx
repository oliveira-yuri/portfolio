import Link from 'next/link'
import { descricaoPilar } from '@/content/pilares'
import { type Locale, t } from '@/lib/i18n'
import { type Pilar, type Post, pilares } from '@/lib/posts'
import { caminhoPilar } from '@/lib/routes'

const MESES_MINIMOS_PARA_CADENCIA = 4

function mesesDistintos(posts: Post[]): string[] {
  return [...new Set(posts.map((post) => post.data.slice(0, 7)))].sort().reverse()
}

function Cadencia({ posts, meses }: { posts: Post[]; meses: string[] }) {
  const contagens = meses.map((mes) => posts.filter((post) => post.data.startsWith(mes)).length)
  const maximo = Math.max(1, ...contagens)

  return (
    <div data-cadencia className="mt-3 flex h-4 items-end gap-0.5" aria-hidden="true">
      {[...contagens].reverse().map((valor, i) => (
        <span
          key={meses[i]}
          className="w-1 bg-accent/40"
          style={{ height: `${Math.max(8, (valor / maximo) * 100)}%` }}
        />
      ))}
    </div>
  )
}

export function PillarCards({ locale, posts }: { locale: Locale; posts: Post[] }) {
  const meses = mesesDistintos(posts)
  const mostrarCadencia = meses.length >= MESES_MINIMOS_PARA_CADENCIA

  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-3">
      {pilares.map((pilar: Pilar) => {
        const doPilar = posts.filter((post) => post.pilar === pilar)
        const { nome, descricao } = descricaoPilar[pilar]

        return (
          <li key={pilar}>
            <Link
              href={caminhoPilar(locale, pilar)}
              className="block h-full rounded border border-line bg-raised p-4 transition-colors hover:border-accent"
            >
              <span className="font-mono text-2xl text-accent">
                {String(doPilar.length).padStart(2, '0')}
              </span>
              <span className="mt-1 block font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                {t(nome, locale)}
              </span>
              <span className="mt-1 block text-sm text-muted">{t(descricao, locale)}</span>
              {mostrarCadencia ? <Cadencia posts={doPilar} meses={meses} /> : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
