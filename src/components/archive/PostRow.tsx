import Link from 'next/link'
import { descricaoPilar } from '@/content/pilares'
import { ui } from '@/content/ui'
import { formatarData } from '@/lib/date'
import { classesDoPilar } from '@/lib/escala'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'
import { tempoDeLeitura } from '@/lib/reading'
import { caminhoPilar } from '@/lib/routes'

/** Acima disso a barra satura; textos mais longos que isso são raros. */
const LEITURA_DE_REFERENCIA = 12

export function PostRow({
  locale,
  post,
  comResumo = false,
}: {
  locale: Locale
  post: Post
  comResumo?: boolean
}) {
  const minutos = tempoDeLeitura(post.corpo)
  const proporcao = Math.min(1, minutos / LEITURA_DE_REFERENCIA)
  const { texto: classePilar } = classesDoPilar(post.pilar)

  return (
    <li className="grid grid-cols-[1fr] gap-x-5 gap-y-1 py-5 sm:grid-cols-[4.5rem_1fr_5rem]">
      <time dateTime={post.data} className="font-dado text-xs tabular-nums text-suave sm:pt-1.5">
        {formatarData(post.data, locale)}
      </time>

      <div className="min-w-0">
        <Link
          href={caminhoPilar(locale, post.pilar)}
          className={`font-dado text-[0.65rem] uppercase tracking-[0.14em] ${classePilar}`}
        >
          {t(descricaoPilar[post.pilar].nome, locale)}
        </Link>
        {/* Não é heading: o post que este link abre vive noutra URL, e uma
            lista de dezenas de linhas viraria dezenas de entradas no sumário
            da página atual — entradas que não levam a lugar nenhum dentro
            dela. O link já carrega o título como nome acessível. */}
        <Link
          href={`/${locale}/posts/${post.slug}`}
          className="mt-0.5 block font-display text-xl leading-snug text-tinta"
        >
          {post.titulo}
        </Link>
        {comResumo ? <p className="mt-1 text-suave">{post.resumo}</p> : null}
        <ul className="mt-1.5 flex flex-wrap gap-x-3 font-dado text-[0.7rem] text-suave">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link href={`/${locale}/tags/${tag}`}>#{tag}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sm:pt-2">
        <span data-intervalo className="block h-[3px] bg-fio">
          <span className={`block h-full ${classesDoPilar(post.pilar).fundo}`} style={{ width: `${proporcao * 100}%` }} />
        </span>
        <span className="mt-1 block font-dado text-[0.65rem] tabular-nums text-suave">
          {minutos} {t(ui.post.tempoLeituraCurto, locale)}
        </span>
      </div>
    </li>
  )
}
