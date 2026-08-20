import Link from 'next/link'
import { descricaoPilar } from '@/content/pilares'
import { ui } from '@/content/ui'
import { formatarData } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'
import { caminhoPilar } from '@/lib/routes'
import { tempoDeLeitura } from '@/lib/reading'

export function PostHeader({ locale, post }: { locale: Locale; post: Post }) {
  return (
    <header>
      <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
        <Link href={caminhoPilar(locale, post.pilar)} className="text-accent">
          {t(descricaoPilar[post.pilar].nome, locale)}
        </Link>
        {' · '}
        <time dateTime={post.data}>{formatarData(post.data, locale)}</time>
        {' · '}
        <span>
          {tempoDeLeitura(post.corpo)} {t(ui.post.tempoLeitura, locale)}
        </span>
        {post.atualizado ? (
          <>
            {' · '}
            <span>
              {t(ui.post.atualizadoEm, locale)} {formatarData(post.atualizado, locale)}
            </span>
          </>
        ) : null}
      </p>
      <h1 className="mt-2 max-w-[24em] font-serif text-3xl text-ink md:text-4xl">{post.titulo}</h1>
      <p className="mt-2 max-w-2xl text-muted">{post.resumo}</p>
      <ul className="mt-3 flex flex-wrap gap-x-3 font-mono text-xs text-accent/90">
        {post.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/${locale}/tags/${tag}`}>#{tag}</Link>
          </li>
        ))}
      </ul>
    </header>
  )
}
