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
      <p className="font-dado text-[0.7rem] uppercase tracking-widest text-suave">
        <Link href={caminhoPilar(locale, post.pilar)} className="text-frio">
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
      <h1 className="mt-2 max-w-[24em] font-display text-3xl text-tinta md:text-4xl">{post.titulo}</h1>
      <p className="mt-2 max-w-2xl text-suave">{post.resumo}</p>
      <ul className="mt-3 flex flex-wrap gap-x-3 font-dado text-xs text-frio/90">
        {post.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/${locale}/tags/${tag}`}>#{tag}</Link>
          </li>
        ))}
      </ul>
    </header>
  )
}
